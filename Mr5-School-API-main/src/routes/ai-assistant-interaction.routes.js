import express from "express";
import {
	getAllAiAssistantInteractions,
	getAiAssistantInteractionById,
	createAiAssistantInteraction,
	updateAiAssistantInteraction,
	deleteAiAssistantInteraction,
} from "../controllers/ai-assistant-interaction.controller.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAllAiAssistantInteractions);
router.get("/:id", getAiAssistantInteractionById);
router.post("/", createAiAssistantInteraction);
router.put("/:id", updateAiAssistantInteraction);
router.delete("/:id", authorize("admin"), deleteAiAssistantInteraction);

export default router;
