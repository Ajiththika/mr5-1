/**
 * verificationController.js
 * MR5 Academy Certification Standard — Public Certificate Verification
 *
 * Handles the public-facing verification endpoint that anyone
 * (employer, university, public) can use to verify a certificate.
 * No authentication required. Logs every verification attempt.
 */
import Certificate from "../models/Certificate.js";
import VerificationLog from "../models/VerificationLog.js";
import CertificationProfile from "../models/CertificationProfile.js";
import { verifyCertificateHash } from "../utils/certificateHasher.js";

/**
 * GET /api/verify/:certificateId
 * Public: verify a certificate by its ID or verification hash.
 * Logs the verification attempt regardless of outcome.
 */
export const verifyCertificate = async (req, res) => {
	const { certificateId } = req.params;
	const ip = req.ip || req.connection?.remoteAddress || "unknown";
	const userAgent = req.headers["user-agent"] || "unknown";
	const method = req.query.method || "direct_url";

	if (!certificateId || certificateId.trim().length < 5) {
		return res.status(400).json({
			success: false,
			verified: false,
			error: "Invalid certificate ID",
		});
	}

	const cleanId = certificateId.trim().toUpperCase();

	try {
		// Search by certificateId OR verificationHash
		const certificate = await Certificate.findOne({
			$or: [{ certificateId: cleanId }, { verificationHash: cleanId }],
		})
			.populate("student", "name email profileImage country certificationId")
			.populate("course", "title category level language estimatedWeeks")
			.populate("instructor", "name")
			.populate("adminApprovedBy", "name")
			.lean();

		// ─── Not Found ─────────────────────────────────────────────────────────
		if (!certificate) {
			await logVerification({
				certificateId: cleanId,
				method,
				result: "not_found",
				ip,
				userAgent,
			});
			return res.status(404).json({
				success: false,
				verified: false,
				result: "not_found",
				message: "No certificate found with this ID. It may be invalid or was never issued by MR5 Academy.",
			});
		}

		// ─── Status Checks ─────────────────────────────────────────────────────
		if (certificate.status === "revoked") {
			await logVerification({
				certificateId: cleanId,
				certificate: certificate._id,
				certificationId: certificate.certificationId,
				method,
				result: "revoked",
				ip,
				userAgent,
			});
			return res.status(200).json({
				success: true,
				verified: false,
				result: "revoked",
				message: "This certificate has been revoked by MR5 Academy.",
				revokedAt: certificate.revokedAt,
				revokedReason: certificate.revokedReason,
			});
		}

		if (certificate.status !== "issued") {
			await logVerification({
				certificateId: cleanId,
				certificate: certificate._id,
				certificationId: certificate.certificationId,
				method,
				result: "invalid",
				ip,
				userAgent,
			});
			return res.status(200).json({
				success: true,
				verified: false,
				result: "pending",
				message: "This certificate has not yet been officially issued.",
			});
		}

		// ─── Expiry Check ──────────────────────────────────────────────────────
		if (certificate.expiresAt && new Date(certificate.expiresAt) < new Date()) {
			await logVerification({
				certificateId: cleanId,
				certificate: certificate._id,
				certificationId: certificate.certificationId,
				method,
				result: "expired",
				ip,
				userAgent,
			});
			return res.status(200).json({
				success: true,
				verified: false,
				result: "expired",
				message: "This certificate has expired.",
				expiresAt: certificate.expiresAt,
			});
		}

		// ─── Hash Integrity Check ──────────────────────────────────────────────
		const hashValid = verifyCertificateHash(certificate.verificationHash, {
			studentId: certificate.student?._id?.toString(),
			courseId: certificate.course?._id?.toString(),
			certificationId: certificate.certificationId,
			completionDate: certificate.completionDate?.toISOString(),
			grade: certificate.grade,
			institution: certificate.institution,
			instructorId: certificate.instructor?._id?.toString(),
		});

		// Increment verification counter
		await Certificate.findByIdAndUpdate(certificate._id, {
			$inc: { verificationCount: 1 },
		});

		// Log successful verification
		await logVerification({
			certificateId: cleanId,
			certificate: certificate._id,
			certificationId: certificate.certificationId,
			method,
			result: "valid",
			ip,
			userAgent,
		});

		// ─── Build Safe Public Response ────────────────────────────────────────
		// IMPORTANT: Do not expose student email or private data
		return res.status(200).json({
			success: true,
			verified: true,
			result: "valid",
			hashIntegrity: hashValid,
			certificate: {
				certificateId: certificate.certificateId,
				certificationId: certificate.certificationId,
				title: certificate.title,
				studentName: certificate.studentName,
				studentCountry: certificate.country,
				courseName: certificate.courseName,
				courseLevel: certificate.course?.level,
				courseCategory: certificate.course?.category,
				instructorName: certificate.instructorName,
				institution: certificate.institution,
				grade: certificate.grade,
				finalScore: certificate.finalScore,
				completionDate: certificate.completionDate,
				issuedAt: certificate.issuedAt,
				expiresAt: certificate.expiresAt,
				verificationHash: certificate.verificationHash,
				certificateType: certificate.certificateType,
				blockchainRecord: certificate.blockchainRecord
					? {
							verificationHash: certificate.blockchainRecord.verificationHash,
							timestamp: certificate.blockchainRecord.timestamp,
							blockIndex: certificate.blockchainRecord.blockIndex,
					  }
					: null,
				verificationCount: certificate.verificationCount,
				qrCodeUrl: certificate.qrCodeUrl,
			},
		});
	} catch (error) {
		console.error("Verification error:", error);
		return res.status(500).json({
			success: false,
			verified: false,
			error: "Verification service temporarily unavailable.",
		});
	}
};

/**
 * GET /api/verify/student/:certificationId
 * Public: get all issued certificates for a student's certificationId.
 * Used by employers to view a student's full certificate list.
 */
export const getStudentPublicCertificates = async (req, res) => {
	const { certificationId } = req.params;
	const cleanId = certificationId?.trim().toUpperCase();

	if (!cleanId) {
		return res.status(400).json({ success: false, error: "Invalid certification ID" });
	}

	try {
		// Verify student exists
		const profile = await CertificationProfile.findOne({ certificationId: cleanId }).lean();
		if (!profile) {
			return res.status(404).json({
				success: false,
				error: "No student found with this certification ID",
			});
		}

		const certificates = await Certificate.find({
			certificationId: cleanId,
			status: "issued",
			isPublic: true,
		})
			.select(
				"certificateId certificationId title courseName instructorName institution grade finalScore completionDate issuedAt verificationHash certificateType qrCodeUrl",
			)
			.sort({ issuedAt: -1 })
			.lean();

		return res.status(200).json({
			success: true,
			certificationId: cleanId,
			country: profile.countryName,
			totalCertificates: certificates.length,
			certificates,
		});
	} catch (error) {
		console.error("Public certificates fetch error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── Internal Helper ───────────────────────────────────────────────────────────
async function logVerification({ certificate, certificateId, certificationId, method, result, ip, userAgent }) {
	try {
		await VerificationLog.create({
			certificate,
			certificateId,
			certificationId,
			method,
			result,
			ipAddress: ip,
			userAgent,
			verifiedAt: new Date(),
		});
	} catch (logError) {
		// Never let logging failure break the verification response
		console.error("Failed to write verification log:", logError.message);
	}
}
