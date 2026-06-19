import express from "express";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../controllers/courseController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Protected routes
router.use(verifyToken);
router.use(requireLegalConsent);
router.post("/", authorize("AI-TEACHER", "admin"), createCourse);
router.put("/:id", authorize("AI-TEACHER", "admin"), updateCourse);
router.delete("/:id", authorize("AI-TEACHER", "admin"), deleteCourse);

export default router;
