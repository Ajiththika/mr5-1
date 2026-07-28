import express from "express";
import {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../controllers/courseController.js";
import {
    discover,
    generate,
    getJob,
    suggestions,
} from "../controllers/courseDiscoveryController.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();

// Public discovery & search routes
router.get("/", getAllCourses);
router.get("/suggestions", suggestions);
router.get("/discover", suggestions);
router.get("/search", suggestions);

// Protected discovery routes
router.post("/discover", verifyToken, requireLegalConsent, discover);
router.post("/generate", verifyToken, requireLegalConsent, generate);
router.get("/jobs/:jobId", verifyToken, requireLegalConsent, getJob);

// Specific course by ID route
router.get("/:id", getCourseById);

// Protected admin/teacher management routes
router.use(verifyToken);
router.use(requireLegalConsent);
router.post("/", authorize("AI-TEACHER", "admin"), createCourse);
router.put("/:id", authorize("AI-TEACHER", "admin"), updateCourse);
router.delete("/:id", authorize("AI-TEACHER", "admin"), deleteCourse);

export default router;
