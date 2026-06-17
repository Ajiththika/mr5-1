/**
 * Enhanced Auth Controller with Refresh Token Support
 */

import { asyncHandler } from "../middleware/errorHandler.js";
import { registerSchema, loginSchema } from "../utils/validation.js";
import * as authService from "../services/authService.js";

// Cookie options
const getAccessTokenCookieOptions = () => ({
	expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
	path: "/",
});

const getRefreshTokenCookieOptions = () => ({
	expires: new Date(
		Date.now() + (parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 7) * 24 * 60 * 60 * 1000
	),
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
	path: "/",
});

// Helper to get client IP
const getClientIp = (req) => {
	return req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || null;
};

// Helper to set auth cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
	res.cookie("access_token", accessToken, getAccessTokenCookieOptions());
	res.cookie("refresh_token", refreshToken, getRefreshTokenCookieOptions());
};

// Helper to clear auth cookies
const clearAuthCookies = (res) => {
	res.cookie("access_token", "", { expires: new Date(0), httpOnly: true });
	res.cookie("refresh_token", "", { expires: new Date(0), httpOnly: true });
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
	const validation = registerSchema.safeParse(req.body);
	if (!validation.success) {
		const error = new Error(validation.error.errors[0].message);
		error.statusCode = 400;
		throw error;
	}

	try {
		const ipAddress = getClientIp(req);
		const userAgent = req.headers["user-agent"];

		const { user, accessToken, refreshToken } = await authService.registerUser(
			validation.data,
			ipAddress,
			userAgent
		);

		setAuthCookies(res, accessToken, refreshToken);

		res.status(201).json({
			success: true,
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					status: user.status,
				},
				accessToken,
			},
		});
	} catch (error) {
		if (error.message === "User already exists with this email") {
			error.statusCode = 400;
		}
		throw error;
	}
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
	const validation = loginSchema.safeParse(req.body);
	if (!validation.success) {
		const error = new Error(validation.error.errors[0].message);
		error.statusCode = 400;
		throw error;
	}

	try {
		const ipAddress = getClientIp(req);
		const userAgent = req.headers["user-agent"];

		const { user, accessToken, refreshToken } = await authService.loginUser(
			validation.data.email,
			validation.data.password,
			ipAddress,
			userAgent
		);

		setAuthCookies(res, accessToken, refreshToken);

		res.status(200).json({
			success: true,
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					language: user.language,
					status: user.status,
					avatarUrl: user.avatarUrl,
				},
				accessToken,
			},
		});
	} catch (error) {
		if (
			error.message === "Invalid credentials" ||
			error.message === "Your account has been deactivated" ||
			error.message === "Your account is pending approval"
		) {
			error.statusCode = 401;
		}
		throw error;
	}
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (requires refresh token cookie)
 */
export const refreshToken = asyncHandler(async (req, res) => {
	const refreshTokenString = req.cookies?.refresh_token || req.body?.refreshToken;

	if (!refreshTokenString) {
		// No refresh token provided - this is expected for unauthenticated users
		return res.status(401).json({
			success: false,
			message: "No refresh token provided. User is not authenticated.",
			error: "NO_REFRESH_TOKEN"
		});
	}

	try {
		const ipAddress = getClientIp(req);
		const userAgent = req.headers["user-agent"];

		const result = await authService.refreshAccessToken(refreshTokenString, ipAddress, userAgent);

		setAuthCookies(res, result.accessToken, result.refreshToken);

		res.status(200).json({
			success: true,
			data: {
				accessToken: result.accessToken,
				user: {
					id: result.user._id,
					name: result.user.name,
					email: result.user.email,
					role: result.user.role,
				},
			},
		});
	} catch (error) {
		clearAuthCookies(res);
		return res.status(401).json({
			success: false,
			message: error.message || "Invalid or expired refresh token",
			error: "INVALID_REFRESH_TOKEN"
		});
	}
});

/**
 * @desc    Logout user / clear cookies and revoke token
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
	const refreshTokenString = req.cookies?.refresh_token;
	const ipAddress = getClientIp(req);

	if (refreshTokenString) {
		try {
			await authService.revokeRefreshToken(refreshTokenString, ipAddress);
		} catch {
			// Ignore errors - user is logging out anyway
		}
	}

	clearAuthCookies(res);

	res.status(200).json({
		success: true,
		data: {},
		message: "Logged out successfully",
	});
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req, res) => {
	const ipAddress = getClientIp(req);

	await authService.revokeAllUserTokens(req.user.id, ipAddress);
	clearAuthCookies(res);

	res.status(200).json({
		success: true,
		message: "Logged out from all devices",
	});
});

/**
 * @desc    Get active sessions
 * @route   GET /api/auth/sessions
 * @access  Private
 */
export const getSessions = asyncHandler(async (req, res) => {
	const sessions = await authService.getActiveSessions(req.user.id);

	res.status(200).json({
		success: true,
		data: sessions,
	});
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
	const user = await authService.getUserById(req.user.id);
	res.status(200).json({
		success: true,
		data: user,
	});
});

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
export const updateDetails = asyncHandler(async (req, res) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
		language: req.body.language,
		profileImage: req.body.profileImage,
		avatarUrl: req.body.avatarUrl,
		avatarPreset: req.body.avatarPreset,
		onboardingCompleted: req.body.onboardingCompleted,
		timezone: req.body.timezone,
		gradingSystem: req.body.gradingSystem,
		regionalPreferences: req.body.regionalPreferences,
	};

	const user = await authService.updateUserDetails(req.user.id, fieldsToUpdate);

	res.status(200).json({
		success: true,
		data: user,
	});
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	if (!currentPassword || !newPassword) {
		const error = new Error("Please provide current password and new password");
		error.statusCode = 400;
		throw error;
	}

	try {
		const ipAddress = getClientIp(req);
		const result = await authService.updateUserPassword(
			req.user.id,
			currentPassword,
			newPassword,
			ipAddress
		);

		setAuthCookies(res, result.accessToken, result.refreshToken);

		res.status(200).json({
			success: true,
			message: result.message,
			accessToken: result.accessToken,
		});
	} catch (error) {
		if (error.message === "Current password is incorrect") {
			error.statusCode = 401;
		}
		throw error;
	}
});

/**
 * @desc    Google Auth Callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleCallback = asyncHandler(async (req, res) => {
	// Passport middleware puts user in req.user
	if (!req.user) {
		throw new Error("Google authentication failed");
	}

	const ipAddress = getClientIp(req);
	const userAgent = req.headers["user-agent"];

	const { user, accessToken, refreshToken } = await authService.loginWithGoogle(
		req.user,
		ipAddress,
		userAgent
	);

	setAuthCookies(res, accessToken, refreshToken);

	// Redirect to client dashboard (using relative path on assumption of proxy or env var)
	// The user requested redirect logic isn't explicit but standard MERN redirects to frontend.
	const redirectUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/dashboard` : "http://localhost:3000/dashboard";
	res.redirect(redirectUrl);
});

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;

	if (!email) {
		const error = new Error("Please provide an email");
		error.statusCode = 400;
		throw error;
	}

	const result = await authService.forgotPassword(email);

	res.status(200).json({
		success: true,
		data: result.message,
	});
});

/**
 * @desc    Reset Password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
	const { password } = req.body;
	const { resettoken } = req.params;

	if (!password) {
		const error = new Error("Please provide a new password");
		error.statusCode = 400;
		throw error;
	}

	const ipAddress = getClientIp(req);
	const userAgent = req.headers["user-agent"];

	const result = await authService.resetPassword(resettoken, password, ipAddress, userAgent);

	setAuthCookies(res, result.accessToken, result.refreshToken);

	res.status(200).json({
		success: true,
		data: result,
	});
});
