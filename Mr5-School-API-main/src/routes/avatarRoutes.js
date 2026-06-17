import express from "express";
import User from "../models/User.js";
import Teacher from "../models/Teacher.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * @route   POST /api/avatar/auto-register
 * @desc    Automatically register and approve Avatar AI AI-TEACHERs
 * @access  Public (but with special token validation)
 */
router.post("/auto-register", async (req, res) => {
	try {
		const { name, email, password, phone, specialization, bio, avatarToken } =
			req.body;

		const AVATHOR_SECRET_TOKEN = process.env.AVATHOR_SECRET_TOKEN;
		if (!AVATHOR_SECRET_TOKEN) {
			return res.status(503).json({
				success: false,
				message: "Avatar auto-registration is not configured",
			});
		}
		if (avatarToken !== AVATHOR_SECRET_TOKEN) {
			return res.status(403).json({
				success: false,
				message: "Invalid Avatar AI authentication token",
			});
		}

		// Check if user already exists
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({
				success: false,
				message: "User with this email already exists",
			});
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create user with AI-TEACHER role and APPROVED status
		user = new User({
			name,
			email,
			password: hashedPassword,
			phone,
			role: "AI-TEACHER",
			status: "approved", // Auto-approve Avatar AI AI-TEACHERs
		});

		await user.save();

		// Create AI-TEACHER profile
		const teacher = new Teacher({
			user: user._id,
			specialization: specialization || "AI & Programming",
			bio: bio || "AI-powered teaching assistant from Avatar AI",
			isAvatarAI: true, // Mark as Avatar AI AI-TEACHER
			approvedAt: new Date(),
			approvedBy: "system", // System-approved
		});

		await teacher.save();

		// Generate JWT token
		const payload = {
			user: {
				id: user._id,
				role: user.role,
				status: user.status,
			},
		};

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN || "7d",
		});

		res.json({
			success: true,
			message: "Avatar AI AI-TEACHER registered and approved successfully",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					status: user.status,
				},
				teacher: {
					id: teacher._id,
					specialization: teacher.specialization,
					isAvatarAI: teacher.isAvatarAI,
				},
				token,
			},
		});
	} catch (error) {
		console.error("Avatar AI auto-registration error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during Avatar AI registration",
			error: error.message,
		});
	}
});

/**
 * @route   GET /api/avatar/AI-TEACHERs
 * @desc    Get all Avatar AI AI-TEACHERs
 * @access  Public
 */
router.get("/AI-TEACHERs", async (req, res) => {
	try {
		const avatarTeachers = await Teacher.find({ isAvatarAI: true })
			.populate("user", "name email status")
			.select("specialization bio approvedAt");

		res.json({
			success: true,
			data: avatarTeachers,
		});
	} catch (error) {
		console.error("Error fetching Avatar AI AI-TEACHERs:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
});

export default router;
