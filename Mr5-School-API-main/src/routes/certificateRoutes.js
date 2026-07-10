/**
 * certificateRoutes.js
 * MR5 Academy Certification Standard — Certificate API Routes
 */
import express from "express";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import {
	getMyCertificates,
	getCertificateById,
	requestCertificate,
	instructorApproveCertificate,
	adminApproveCertificate,
	rejectCertificate,
	getPendingCertificates,
	getCertificateStats,
	downloadCertificatePdf,
} from "../controllers/certificateController.js";

const router = express.Router();

// ─── Student Routes ────────────────────────────────────────────────────────────
router.get("/my", verifyToken, getMyCertificates);
router.post("/request", verifyToken, authorize("student"), requestCertificate);

// ─── Shared (student owns + admin) ────────────────────────────────────────────
router.get("/:id", verifyToken, getCertificateById);
router.get("/:id/download", verifyToken, downloadCertificatePdf);

// ─── Instructor Routes ─────────────────────────────────────────────────────────
router.patch("/:id/instructor-approve", verifyToken, authorize("AI-TEACHER", "instructor", "admin"), instructorApproveCertificate);

// ─── Admin Routes ──────────────────────────────────────────────────────────────
router.get("/admin/pending", verifyToken, authorize("admin"), getPendingCertificates);
router.get("/admin/stats", verifyToken, authorize("admin"), getCertificateStats);
router.patch("/:id/admin-approve", verifyToken, authorize("admin"), adminApproveCertificate);
router.patch("/:id/reject", verifyToken, authorize("AI-TEACHER", "instructor", "admin"), rejectCertificate);

export default router;
