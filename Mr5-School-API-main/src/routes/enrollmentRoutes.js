import express from "express";
import {
	getAllEnrollments,
	getStudentEnrollments,
	updateEnrollment,

	deleteEnrollment,
	checkEnrollmentAccess,
	createEnrollment
} from "../controllers/enrollmentController.js";
import { verifyToken as protect, authorize } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(requireLegalConsent);

router.get("/check/:courseId", checkEnrollmentAccess);
router.get("/my", getStudentEnrollments); // New route for students to get their own enrollments

router.route("/")
	.get(authorize("admin", "AI-TEACHER"), getAllEnrollments)
	.post(authorize("admin"), createEnrollment);
router.put("/:id", updateEnrollment);
router.delete("/:id", deleteEnrollment);

export default router;