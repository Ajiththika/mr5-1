/**
 * Enhanced Auth Service with Refresh Token Support
 * Provides secure JWT authentication with access/refresh token pattern
 */

import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { ensureIdentityForUser } from "./identityService.js";

// Token configuration
const ACCESS_TOKEN_EXPIRE = process.env.JWT_EXPIRE || "15m";
const REFRESH_TOKEN_EXPIRE_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 7;

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId, type: "access" }, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRE,
    });
};

/**
 * Generate refresh token (long-lived, stored in DB)
 */
const generateRefreshToken = async (userId, ipAddress, userAgent) => {
    const token = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 * 1000);

    const refreshToken = await RefreshToken.create({
        user: userId,
        token,
        expiresAt,
        createdByIp: ipAddress,
        userAgent,
    });

    return refreshToken;
};

/**
 * Register a new user
 */
export const registerUser = async (userData, ipAddress = null, userAgent = null) => {
    const { name, email, password, role } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User already exists with this email");
    }

    // AI-TEACHERs require admin approval
    let status = "approved";
    if (role === "AI-TEACHER") {
        status = "pending";
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || "student",
        status,
    });

    await ensureIdentityForUser(user);

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

    return {
        user,
        accessToken,
        refreshToken: refreshToken.token,
    };
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password, ipAddress = null, userAgent = null) => {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
        throw new Error("Your account has been deactivated");
    }

    if (user.status === "pending") {
        throw new Error("Your account is pending approval");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

    return {
        user,
        accessToken,
        refreshToken: refreshToken.token,
    };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshTokenString, ipAddress = null, userAgent = null) => {
    const refreshToken = await RefreshToken.findOne({ token: refreshTokenString }).populate("user");

    if (!refreshToken) {
        throw new Error("Invalid refresh token");
    }

    if (!refreshToken.isActive) {
        // Token reuse detected - revoke all tokens for this user
        await RefreshToken.updateMany({ user: refreshToken.user._id }, { revokedAt: new Date(), revokedByIp: ipAddress });
        throw new Error("Token reuse detected - all sessions revoked");
    }

    const user = refreshToken.user;
    if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
    }

    // Rotate refresh token (issue new one, revoke old)
    refreshToken.revokedAt = new Date();
    refreshToken.revokedByIp = ipAddress;

    const newRefreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();

    const accessToken = generateAccessToken(user._id);

    return {
        user,
        accessToken,
        refreshToken: newRefreshToken.token,
    };
};

/**
 * Revoke refresh token (logout from specific session)
 */
export const revokeRefreshToken = async (refreshTokenString, ipAddress = null) => {
    const refreshToken = await RefreshToken.findOne({ token: refreshTokenString });

    if (!refreshToken) {
        throw new Error("Token not found");
    }

    refreshToken.revokedAt = new Date();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();

    return { message: "Token revoked successfully" };
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export const revokeAllUserTokens = async (userId, ipAddress = null) => {
    await RefreshToken.updateMany(
        { user: userId, revokedAt: null },
        { revokedAt: new Date(), revokedByIp: ipAddress }
    );

    return { message: "All sessions revoked successfully" };
};

/**
 * Get active sessions for a user
 */
export const getActiveSessions = async (userId) => {
    const sessions = await RefreshToken.find({
        user: userId,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }).select("createdAt createdByIp userAgent");

    return sessions;
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
    return await User.findById(id);
};

/**
 * Update user details
 */
export const updateUserDetails = async (userId, updateData) => {
    // Filter out undefined values
    const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    const user = await User.findByIdAndUpdate(userId, filteredData, {
        new: true,
        runValidators: true,
    });
    return user;
};

/**
 * Update user password
 */
export const updateUserPassword = async (userId, currentPassword, newPassword, ipAddress = null) => {
    const user = await User.findById(userId).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    // Revoke all existing refresh tokens after password change
    await revokeAllUserTokens(userId, ipAddress);

    // Generate new tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, ipAddress);

    return {
        message: "Password updated successfully",
        accessToken,
        refreshToken: refreshToken.token,
    };
};

/**
 * Clean up expired tokens (for cron job)
 */
export const cleanupExpiredTokens = async () => {
    const result = await RefreshToken.deleteMany({
        $or: [{ expiresAt: { $lt: new Date() } }, { revokedAt: { $ne: null }, createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }],
    });
    return { deleted: result.deletedCount };
};

/**
 * Login or register with Google
 */
export const loginWithGoogle = async (user, ipAddress = null, userAgent = null) => {
    // Check status
    if (!user.isActive) {
        throw new Error("Your account has been deactivated");
    }

    if (user.status === "pending") {
        throw new Error("Your account is pending approval");
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Ensure generateAccessToken is available (it is local const in this file)
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

    return {
        user,
        accessToken,
        refreshToken: refreshToken.token,
    };
};

/**
 * Forgot Password
 */
export const forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("There is no user with that email");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset url (frontend url)
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        const html = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        `
        await sendEmail({
            email: user.email,
            subject: "Password reset token",
            message,
            html
        });

        return { message: "Email sent" };
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        throw new Error("Email could not be sent");
    }
};

/**
 * Reset Password
 */
export const resetPassword = async (resetToken, password, ipAddress = null, userAgent = null) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new Error("Invalid token");
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Revoke old sessions
    await revokeAllUserTokens(user._id, ipAddress);

    // Log them in immediately
    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id, ipAddress, userAgent);

    return {
        user,
        accessToken,
        refreshToken: refreshToken.token,
    };
};
