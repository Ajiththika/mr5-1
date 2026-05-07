import express from "express";
import { handleAvatarAction, testAvatarAction } from "../controllers/avatarSupportAgentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Handle avatar support agent actions
// @route   POST /api/avatar-support-agent/action
// @access  Private
router.post("/action", verifyToken, handleAvatarAction);

// @desc    Test endpoint for avatar support agent
// @route   POST /api/avatar-support-agent/test
// @access  Public (for testing)
router.post("/test", testAvatarAction);

export default router;