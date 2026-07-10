/**
 * verificationRoutes.js
 * MR5 Academy Certification Standard — Public Verification Routes
 * No authentication required for these endpoints.
 */
import express from "express";
import rateLimit from "express-rate-limit";
import { verifyCertificate, getStudentPublicCertificates } from "../controllers/verificationController.js";

const router = express.Router();

// Rate limit: prevent verification endpoint DoS / credential stuffing
const verificationLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 30, // 30 verification lookups per minute per IP
	message: {
		success: false,
		verified: false,
		error: "Too many verification requests. Please wait a moment.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Public: verify a certificate by ID or hash
router.get("/:certificateId", verificationLimiter, verifyCertificate);

// Public: get all public certificates for a student (employer lookup)
router.get("/student/:certificationId", verificationLimiter, getStudentPublicCertificates);

export default router;
