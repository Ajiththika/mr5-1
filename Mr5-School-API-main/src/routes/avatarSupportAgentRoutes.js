import express from "express";
import { handleAvatarAction, testAvatarAction } from "../controllers/avatarSupportAgentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Handle avatar support agent actions
// @route   POST /api/avatar-support-agent/action
// @access  Private
router.post("/action", verifyToken, handleAvatarAction);

if (process.env.NODE_ENV === "development") {
	router.post("/test", testAvatarAction);
}

export default router;