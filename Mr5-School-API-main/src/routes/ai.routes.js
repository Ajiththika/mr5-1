import express from "express";
import aiService from "../services/ai.service.js";
import aiTeacherService from "../services/AITeacherService.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

// Middleware for rate limiting (basic consistent implementation)
const rateLimit = (req, res, next) => {
    // In production, use Redis or a library like express-rate-limit
    // This is a placeholder for the logic requested
    next();
};

// @desc    Interaction with RAG-enhanced AI Tutor
// @route   POST /api/ai/tutor
// @access  Private
router.post("/tutor", ...protect, rateLimit, async (req, res) => {
    try {
        const { query, courseId } = req.body;
        const userId = req.user.id;

        const response = await aiTeacherService.ask(userId, query, courseId);
        res.json({ response });
    } catch (error) {
        console.error("Tutor Error:", error);
        res.status(500).json({ error: "AI Tutor is currently unavailable." });
    }
});



// @desc    Chat with AI Coach
// @route   POST /api/ai/chat
// @access  Private
router.post("/chat", ...protect, rateLimit, async (req, res) => {
    try {
        const { messages, options } = req.body;

        // Basic moderation on latest message
        const lastMessage = messages[messages.length - 1]?.content;
        if (lastMessage) {
            const moderation = await aiService.moderateContent(lastMessage);
            if (moderation.flagged) {
                return res.status(400).json({
                    error: "Message flagged for content violation.",
                    categories: moderation.categories
                });
            }
        }

        if (options?.stream) {
            // Streaming adaptation for Gemini if needed, or fallback to non-stream for stability during migration
            // Since the aiService.chatCompletion was updated to return a full response object (not a stream),
            // we will default to non-streaming response for now.
            // If streaming is strictly required, the service needs update to yield generator.

            const response = await aiService.chatCompletion({ messages, ...options });
            // Mimic stream response structure if client strictly expects SSE?
            // Or just return JSON if client handles it.
            // Assuming client handles standard JSON if not streaming event-stream.
            // Let's just return JSON for now to ensure it works.
            res.json(response);
        } else {
            // Use the standard completion
            const response = await aiService.chatCompletion({ messages, ...options });
            res.json(response);
        }
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "AI Service failed" });
    }
});

// @desc    Generate Course Summary & Quiz
// @route   POST /api/ai/summary
// @access  Private (AI-TEACHER/Admin)
router.post("/summary", ...protect, authorize("AI-TEACHER", "admin"), async (req, res) => {
    try {
        const { content } = req.body;
        const result = await aiService.generateCourseSummaryAndQuiz(content);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Summary generation failed" });
    }
});

// @desc    Auto-grade Assignment
// @route   POST /api/ai/grade
// @access  Private
router.post("/grade", ...protect, async (req, res) => {
    try {
        const { answer, rubric } = req.body;
        const result = await aiService.autoGrade({ studentAnswer: answer, rubric });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Grading failed" });
    }
});

// @desc    Chat with Ollama directly
// @route   POST /api/ai/ollama
// @access  Private
router.post("/ollama", ...protect, rateLimit, async (req, res) => {
    try {
        const { messages, options } = req.body;

        const response = await aiService.chatOllama({ messages, ...options });
        res.json(response);
    } catch (error) {
        console.error("Ollama Chat Error:", error);
        res.status(500).json({ error: "Ollama Service failed" });
    }
});

// @desc    Chat with Gemini directly
// @route   POST /api/ai/gemini
// @access  Private
router.post("/gemini", ...protect, rateLimit, async (req, res) => {
    try {
        const { message, messages, options, multimodal } = req.body;

        // Handle both single message and messages array formats
        let chatMessages = messages || [{ role: "user", content: message || "" }];

        // If it's a single message, convert to messages array format
        if (message && !messages) {
            chatMessages = [{ role: "user", content: message }];
        }

        // Use multimodal chat completion if requested
        const response = multimodal
            ? await aiService.multimodalChatCompletion({ messages: chatMessages, ...options })
            : await aiService.chatCompletion({ messages: chatMessages, ...options });

        res.json({ response: response.choices[0].message.content });
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        res.status(500).json({ error: "Gemini Service failed" });
    }
});

// @desc    Detect Regional Information based on location
// @route   POST /api/ai/detect-regional-info
// @access  Private
router.post("/detect-regional-info", ...protect, async (req, res) => {
    try {
        const { location } = req.body;
        // If location is not provided, we could try to detect from IP, 
        // but for now we expect it from the frontend which has better access to browser settings too.
        const result = await aiService.getRegionalDetection(location || req.ip);
        res.json(result);
    } catch (error) {
        console.error("Regional Detection Error:", error);
        res.status(500).json({ error: "Regional detection failed" });
    }
});

// @desc    Generate Course Structure via AI
// @route   POST /api/ai/generate-course
// @access  Private
router.post('/generate-course', ...protect, async (req, res) => {
    const { topic } = req.body;

    if (!topic) return res.status(400).json({ error: "Topic is required" });

    try {
        const courseData = await aiService.generateCourseStructure(topic);
        res.json({ success: true, data: courseData });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI Generation Failed" });
    }
});

export default router;