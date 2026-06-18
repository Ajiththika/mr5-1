import User from "../models/User.js";
import ChatMemory from "../models/ChatMemory.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { updateUserDetails } from "../services/authService.js";

const EDUCATION_LEVELS = [
	"High School",
	"Higher Secondary",
	"Diploma",
	"Bachelor's Degree",
	"Master's Degree",
	"Doctorate",
	"Professional Certification",
	"Other",
];

// @route GET /api/students/me/learning-profile
export const getLearningProfile = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	const user = await User.findById(userId).select(
		"name age educationLevel welcomeChatCompleted language role",
	);

	res.json({
		success: true,
		data: {
			...user.toObject(),
			educationLevels: EDUCATION_LEVELS,
		},
	});
});

// @route PUT /api/students/me/learning-profile
export const updateLearningProfile = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;
	const { age, educationLevel, welcomeChatCompleted } = req.body;

	if (
		educationLevel !== undefined &&
		educationLevel !== null &&
		!EDUCATION_LEVELS.includes(educationLevel)
	) {
		return res.status(400).json({
			success: false,
			error: "Invalid education level",
		});
	}

	if (age !== undefined && age !== null) {
		const parsedAge = Number(age);
		if (!Number.isFinite(parsedAge) || parsedAge < 5 || parsedAge > 120) {
			return res.status(400).json({
				success: false,
				error: "Age must be between 5 and 120",
			});
		}
	}

	const user = await updateUserDetails(userId, {
		age: age !== undefined ? Number(age) : undefined,
		educationLevel,
		welcomeChatCompleted,
	});

	res.json({ success: true, data: user });
});

// @route GET /api/students/me/chat-memory
export const getChatMemory = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;
	const limit = Math.min(Number(req.query.limit) || 40, 100);

	const messages = await ChatMemory.find({ user: userId })
		.sort({ createdAt: -1 })
		.limit(limit)
		.lean();

	res.json({
		success: true,
		data: messages.reverse(),
	});
});

// @route POST /api/students/me/chat-memory
export const appendChatMemory = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;
	const { role, content, source, mode, course } = req.body;

	if (!role || !content?.trim()) {
		return res.status(400).json({
			success: false,
			error: "Role and content are required",
		});
	}

	const saved = await ChatMemory.create({
		user: userId,
		role,
		content: content.trim(),
		source: source || "teaching",
		mode: mode || "text",
		course,
	});

	res.status(201).json({ success: true, data: saved });
});

// @route GET /api/students/me/ai-context
export const getAiContext = asyncHandler(async (req, res) => {
	const userId = req.user._id || req.user.id;

	const user = await User.findById(userId).select(
		"name age educationLevel language welcomeChatCompleted",
	);

	const recentMessages = await ChatMemory.find({ user: userId })
		.sort({ createdAt: -1 })
		.limit(24)
		.lean();

	res.json({
		success: true,
		data: {
			profile: user,
			recentMessages: recentMessages.reverse(),
		},
	});
});
