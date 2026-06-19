import express from "express";
import { completeLesson, getCourseProgress } from "../controllers/progressController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();

router.use(verifyToken);
router.use(requireLegalConsent);

router.post("/lessons/:lessonId/complete", completeLesson);
router.get("/courses/:courseId", getCourseProgress);

export default router;
