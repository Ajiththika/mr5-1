import express from "express";
import {
	getAllLessons,
	getLessonById,
	createLesson,
	updateLesson,
	deleteLesson,
} from "../controllers/lessonController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllLessons);
router.get("/:id", getLessonById);

// Protected routes
router.use(verifyToken);
router.post("/", authorize("AI-TEACHER", "admin"), createLesson);
router.put("/:id", authorize("AI-TEACHER", "admin"), updateLesson);
router.delete("/:id", authorize("AI-TEACHER", "admin"), deleteLesson);

export default router;
