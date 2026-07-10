/**
 * transcriptRoutes.js
 * MR5 Academy Certification Standard — Transcript API Routes
 */
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
	getMyTranscript,
	generateShareLink,
	getSharedTranscript,
} from "../controllers/transcriptController.js";

const router = express.Router();

// Student: get own transcript (generates/refreshes it)
router.get("/my", verifyToken, getMyTranscript);

// Student: generate a public share link
router.post("/share", verifyToken, generateShareLink);

// Public: view shared transcript by token (employer/university)
router.get("/shared/:token", getSharedTranscript);

export default router;
