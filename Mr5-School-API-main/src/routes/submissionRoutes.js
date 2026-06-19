import express from "express";
import {
	getAllSubmissions,
	getSubmissionById,
	createSubmission,
	updateSubmission,
	deleteSubmission,
} from "../controllers/submissionController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.get("/", ...protect, authorize("AI-TEACHER", "admin"), getAllSubmissions);
router.get("/:id", ...protect, getSubmissionById);
router.post("/", ...protect, authorize("student"), createSubmission);
router.put("/:id", ...protect, authorize("AI-TEACHER", "admin"), updateSubmission);
router.delete("/:id", ...protect, authorize("admin"), deleteSubmission);

export default router;
