import express from "express";
import {
	getAllAiAssistantInteractions,
	getAiAssistantInteractionById,
	createAiAssistantInteraction,
	updateAiAssistantInteraction,
	deleteAiAssistantInteraction,
} from "../controllers/ai-assistant-interaction.controller.js";
const router = express.Router();
router.get("/", getAllAiAssistantInteractions);
router.get("/:id", getAiAssistantInteractionById);
router.post("/", createAiAssistantInteraction);
router.put("/:id", updateAiAssistantInteraction);
router.delete("/:id", deleteAiAssistantInteraction);

export default router;