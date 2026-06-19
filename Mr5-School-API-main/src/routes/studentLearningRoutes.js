import express from "express";
import {
	getLearningProfile,
	updateLearningProfile,
	getChatMemory,
	appendChatMemory,
	getAiContext,
} from "../controllers/studentLearningController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(requireLegalConsent);
router.use(authorize("student"));

router.get("/learning-profile", getLearningProfile);
router.put("/learning-profile", updateLearningProfile);
router.get("/chat-memory", getChatMemory);
router.post("/chat-memory", appendChatMemory);
router.get("/ai-context", getAiContext);

export default router;
