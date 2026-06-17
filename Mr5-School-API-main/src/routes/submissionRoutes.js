import express from "express";
import {
	getAllSubmissions,
	getSubmissionById,
	createSubmission,
	updateSubmission,
	deleteSubmission,
} from "../controllers/submissionController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, authorize("AI-TEACHER", "admin"), getAllSubmissions);
router.get("/:id", verifyToken, getSubmissionById);
router.post("/", verifyToken, authorize("student"), createSubmission);
router.put("/:id", verifyToken, authorize("AI-TEACHER", "admin"), updateSubmission);
router.delete("/:id", verifyToken, authorize("admin"), deleteSubmission);

export default router;
