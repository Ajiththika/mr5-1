import AiAssistantInteraction from "../models/ai-assistant-interaction.model.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { paginate } from "../utils/pagination.js";
import aiService from "../services/ai.service.js";
import dotenv from "dotenv";

dotenv.config();

// @desc    Get all AI assistant interactions with pagination
// @route   GET /api/ai-assistant-interactions
// @access  Private
const getAllAiAssistantInteractions = asyncHandler(async (req, res) => {
	const { page, limit, user, course, mode, search } = req.query;

	// Build query
	const query = {};
	if (user) query.user = user;
	if (course) query.course = course;
	if (mode) query.mode = mode;
	if (search) {
		query.$or = [
			{ question: { $regex: search, $options: "i" } },
			{ response: { $regex: search, $options: "i" } },
		];
	}

	const result = await paginate(AiAssistantInteraction, query, {
		page,
		limit,
		sort: "-createdAt",
		populate: [
			{
				path: "user",
				select: "name email profileImage",
			},
			{
				path: "course",
				select: "title description",
			},
		],
	});

	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get AI assistant interaction by ID
// @route   GET /api/ai-assistant-interactions/:id
// @access  Private
const getAiAssistantInteractionById = asyncHandler(async (req, res) => {
	const aiAssistantInteraction = await AiAssistantInteraction.findById(
		req.params.id,
	)
		.populate("user", "name email profileImage")
		.populate("course", "title description");

	if (!aiAssistantInteraction) {
		return res.status(404).json({
			success: false,
			error: "AI Assistant Interaction not found",
		});
	}

	res.json({
		success: true,
		data: aiAssistantInteraction,
	});
});

// @desc    Create AI assistant interaction (Ask the AI Teacher)
// @route   POST /api/ai-assistant-interactions
// @access  Private
const createAiAssistantInteraction = asyncHandler(async (req, res) => {
	const { question, course, mode, user } = req.body; // user might come from body or req.user

	// Ensure we have a user ID. If protected route, commonly req.user._id
	// Fallback to body.user for flexibility if auth middleware not fully checked
	const userId = req.user ? req.user._id : user;

	if (!question) {
		return res.status(400).json({ success: false, error: "Question is required" });
	}

	try {
		const systemPrompt = `You are an expert AI Teacher for MR5 School. 
        Your goal is to help students learn effectively, answer their questions clearly, 
        and provide examples where necessary. Be encouraging, patient, and precise. 
        If the student asks about a specific course context, tailor your answer to that subject.`;

		// Using the centralized AI Service (Gemini backed)
		const aiResult = await aiService.chatCompletion({
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: question }
			],
			// Model is handled by default in service, or can be overridden e.g. model: "gemini-1.5-flash"
		});

		const aiResponse = aiResult.choices[0].message.content;

		const newInteraction = new AiAssistantInteraction({
			user: userId,
			question,
			response: aiResponse,
			course,
			mode: mode || 'text'
		});

		const savedInteraction = await newInteraction.save();

		const populatedInteraction = await AiAssistantInteraction.findById(
			savedInteraction._id,
		)
			.populate("user", "name email profileImage")
			.populate("course", "title description");

		res.status(201).json({
			success: true,
			data: populatedInteraction,
		});

	} catch (error) {
		console.error("AI Service Error:", error);
		res.status(500).json({
			success: false,
			error: "Failed to generate AI response. Please try again."
		});
	}
});

// @desc    Update AI assistant interaction
// @route   PUT /api/ai-assistant-interactions/:id
// @access  Private
const updateAiAssistantInteraction = asyncHandler(async (req, res) => {
	const aiAssistantInteraction =
		await AiAssistantInteraction.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})
			.populate("user", "name email profileImage")
			.populate("course", "title description");

	if (!aiAssistantInteraction) {
		return res.status(404).json({
			success: false,
			error: "AI Assistant Interaction not found",
		});
	}

	res.json({
		success: true,
		data: aiAssistantInteraction,
	});
});

// @desc    Delete AI assistant interaction
// @route   DELETE /api/ai-assistant-interactions/:id
// @access  Private
const deleteAiAssistantInteraction = asyncHandler(async (req, res) => {
	const aiAssistantInteraction =
		await AiAssistantInteraction.findByIdAndDelete(req.params.id);

	if (!aiAssistantInteraction) {
		return res.status(404).json({
			success: false,
			error: "AI Assistant Interaction not found",
		});
	}

	res.json({
		success: true,
		message: "AI Assistant Interaction deleted successfully",
	});
});

export {
	getAllAiAssistantInteractions,
	getAiAssistantInteractionById,
	createAiAssistantInteraction,
	updateAiAssistantInteraction,
	deleteAiAssistantInteraction,
};