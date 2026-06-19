import express from "express";
import { handleAvatarAction, testAvatarAction } from "../controllers/avatarSupportAgentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.post("/action", ...protect, handleAvatarAction);

if (process.env.NODE_ENV === "development") {
	router.post("/test", testAvatarAction);
}

export default router;