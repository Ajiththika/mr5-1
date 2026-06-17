import express from "express";
import {
	getAllAssignments,
	getAssignmentById,
	createAssignment,
	updateAssignment,
	deleteAssignment,
} from "../controllers/assignmentController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllAssignments);
router.get("/:id", verifyToken, getAssignmentById);
router.post("/", verifyToken, authorize("AI-TEACHER", "admin"), createAssignment);
router.put("/:id", verifyToken, authorize("AI-TEACHER", "admin"), updateAssignment);
router.delete("/:id", verifyToken, authorize("AI-TEACHER", "admin"), deleteAssignment);

export default router;
