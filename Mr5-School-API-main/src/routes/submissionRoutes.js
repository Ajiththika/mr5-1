import express from "express";
import {
	getAllSubmissions,
	getSubmissionById,
	createSubmission,
	updateSubmission,
	deleteSubmission,
} from "../controllers/submissionController.js";
const router = express.Router();
router.get("/", getAllSubmissions);
router.get("/:id", getSubmissionById);
router.post("/", createSubmission);
router.put("/:id", updateSubmission);
router.delete("/:id", deleteSubmission);

export default router;
