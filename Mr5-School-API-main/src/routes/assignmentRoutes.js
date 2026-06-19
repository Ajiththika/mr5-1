import express from "express";
import {
	getAllAssignments,
	getAssignmentById,
	createAssignment,
	updateAssignment,
	deleteAssignment,
} from "../controllers/assignmentController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

router.get("/", ...protect, getAllAssignments);
router.get("/:id", ...protect, getAssignmentById);
router.post("/", ...protect, authorize("AI-TEACHER", "admin"), createAssignment);
router.put("/:id", ...protect, authorize("AI-TEACHER", "admin"), updateAssignment);
router.delete("/:id", ...protect, authorize("AI-TEACHER", "admin"), deleteAssignment);

export default router;
