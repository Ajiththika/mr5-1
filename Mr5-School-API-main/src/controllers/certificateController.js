/**
 * certificateController.js
 * MR5 Academy Certification Standard — Certificate Management
 *
 * Handles:
 *  - Certificate creation (triggered by enrollment completion)
 *  - Admin approval/rejection workflow
 *  - Certificate retrieval for students/admins
 *  - QR code generation
 *  - Grade computation
 */
import Certificate from "../models/Certificate.js";
import CertificationProfile from "../models/CertificationProfile.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import {
	generateCertificationId,
	generateCertificateId,
} from "../utils/certificationIdGenerator.js";
import {
	generateVerificationHash,
	buildBlockchainRecord,
	generateFullHash,
} from "../utils/certificateHasher.js";
import {
	generateCertificateQR,
	generateStudentIdQR,
} from "../utils/qrCodeGenerator.js";
import { generateCertificatePdf } from "../utils/pdfGenerator.js";

const GRADE_MAP = [
	{ min: 90, grade: "A+" },
	{ min: 80, grade: "A" },
	{ min: 75, grade: "B+" },
	{ min: 70, grade: "B" },
	{ min: 60, grade: "C" },
	{ min: 50, grade: "D" },
	{ min: 0, grade: "F" },
];

function computeGrade(score) {
	if (score == null) return "Pending";
	for (const { min, grade } of GRADE_MAP) {
		if (score >= min) return grade;
	}
	return "F";
}

// ─── GET /api/certificates/my ──────────────────────────────────────────────────
export const getMyCertificates = async (req, res) => {
	try {
		const certificates = await Certificate.find({ student: req.user._id })
			.populate("course", "title category level thumbnail")
			.populate("instructor", "name")
			.sort({ createdAt: -1 })
			.lean();

		return res.status(200).json({
			success: true,
			total: certificates.length,
			certificates,
		});
	} catch (error) {
		console.error("getMyCertificates error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── GET /api/certificates/:id ─────────────────────────────────────────────────
export const getCertificateById = async (req, res) => {
	try {
		const certificate = await Certificate.findOne({
			$or: [{ _id: req.params.id }, { certificateId: req.params.id?.toUpperCase() }],
		})
			.populate("student", "name email profileImage country certificationId")
			.populate("course", "title description category level thumbnail language")
			.populate("instructor", "name")
			.lean();

		if (!certificate) {
			return res.status(404).json({ success: false, error: "Certificate not found" });
		}

		// Students can only view their own unless admin
		const isOwner = certificate.student?._id?.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";
		if (!isOwner && !isAdmin) {
			return res.status(403).json({ success: false, error: "Access denied" });
		}

		return res.status(200).json({ success: true, certificate });
	} catch (error) {
		console.error("getCertificateById error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── POST /api/certificates/request ───────────────────────────────────────────
// Triggered when a student's enrollment reaches completion threshold
export const requestCertificate = async (req, res) => {
	const { enrollmentId } = req.body;

	if (!enrollmentId) {
		return res.status(400).json({ success: false, error: "enrollmentId is required" });
	}

	try {
		const enrollment = await Enrollment.findById(enrollmentId)
			.populate("course")
			.populate("student");

		if (!enrollment) {
			return res.status(404).json({ success: false, error: "Enrollment not found" });
		}

		// Ensure requester is the enrolled student
		if (enrollment.student._id.toString() !== req.user._id.toString()) {
			return res.status(403).json({ success: false, error: "Access denied" });
		}

		const course = enrollment.course;

		// ── Check eligibility ─────────────────────────────────────────────────
		const rules = course.certificateRules || {};
		const minProgress = rules.minCompletionPercent || 80;
		const minScore = rules.minFinalScore || 70;

		if (enrollment.progress < minProgress) {
			return res.status(400).json({
				success: false,
				error: `Course must be at least ${minProgress}% complete. Current: ${enrollment.progress}%`,
			});
		}

		if (rules.requireQuizPass && enrollment.finalScore != null && enrollment.finalScore < minScore) {
			return res.status(400).json({
				success: false,
				error: `Minimum score of ${minScore}% required. Your score: ${enrollment.finalScore}%`,
			});
		}

		// Check for existing certificate
		const existing = await Certificate.findOne({
			student: req.user._id,
			course: course._id,
		});
		if (existing) {
			return res.status(409).json({
				success: false,
				error: "A certificate for this course already exists",
				certificate: { certificateId: existing.certificateId, status: existing.status },
			});
		}

		// ── Get or create student certification profile ────────────────────────
		const student = await User.findById(req.user._id);
		let profile = await CertificationProfile.findOne({ user: req.user._id });

		if (!profile) {
			const countryInput = student.countryName || student.country || "GL";
			const generated = await generateCertificationId(countryInput);

			profile = await CertificationProfile.create({
				user: req.user._id,
				certificationId: generated.certificationId,
				country: generated.country,
				countryName: generated.countryName,
				yearIssued: generated.year,
				sequence: generated.sequence,
				publicProfileUrl: `/u/${generated.certificationId}`,
			});

			// Update user model with certificationId
			await User.findByIdAndUpdate(req.user._id, {
				certificationId: generated.certificationId,
			});
		}

		// ── Generate Certificate ID ────────────────────────────────────────────
		const certCount = (profile.totalCertificates || 0) + 1;
		const certificateId = generateCertificateId(profile.certificationId, certCount);

		// ── Build certificate data ─────────────────────────────────────────────
		const grade = computeGrade(enrollment.finalScore);
		const completionDate = enrollment.completedAt || new Date();

		const verificationHash = generateVerificationHash({
			studentId: req.user._id.toString(),
			courseId: course._id.toString(),
			certificationId: profile.certificationId,
			completionDate: completionDate.toISOString(),
			grade,
			institution: "MR5 Academy",
			instructorId: course.teacher?.toString(),
		});

		const blockchainRecord = buildBlockchainRecord(
			{
				certificationId: profile.certificationId,
				studentId: req.user._id.toString(),
				courseId: course._id.toString(),
				grade,
				completionDate: completionDate.toISOString(),
			},
			"GENESIS",
			certCount,
		);

		// ── Generate QR code ──────────────────────────────────────────────────
		const { dataUrl: qrCodeUrl, verificationUrl } = await generateCertificateQR(certificateId);

		// ── Create Certificate ─────────────────────────────────────────────────
		const instructorUser = course.teacher
			? await User.findById(course.teacher).select("name").lean()
			: null;

		const certificate = await Certificate.create({
			certificateId,
			certificationId: profile.certificationId,
			student: req.user._id,
			course: course._id,
			instructor: course.teacher,
			title: `Certificate of Completion — ${course.title}`,
			courseName: course.title,
			studentName: student.name,
			instructorName: instructorUser?.name || "MR5 Academy",
			institution: "MR5 Academy",
			country: profile.countryName,
			finalScore: enrollment.finalScore,
			grade,
			completionDate,
			durationHours: (course.estimatedWeeks || 1) * 10,
			status: "pending_instructor",
			verificationHash,
			blockchainRecord,
			qrCodeUrl,
			qrCodeData: verificationUrl,
			certificateType: course.category?.toLowerCase().includes("ai") ? "ai_specialist" : "completion",
		});

		// Update enrollment
		await Enrollment.findByIdAndUpdate(enrollmentId, {
			certificateEligible: true,
			certificateRequestedAt: new Date(),
		});

		// Update profile count
		await CertificationProfile.findByIdAndUpdate(profile._id, {
			$inc: { totalCertificates: 1 },
		});

		return res.status(201).json({
			success: true,
			message: "Certificate request submitted. Awaiting instructor review.",
			certificate: {
				certificateId: certificate.certificateId,
				status: certificate.status,
				verificationHash: certificate.verificationHash,
			},
		});
	} catch (error) {
		console.error("requestCertificate error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── PATCH /api/certificates/:id/instructor-approve ───────────────────────────
export const instructorApproveCertificate = async (req, res) => {
	try {
		const cert = await Certificate.findOne({ certificateId: req.params.id?.toUpperCase() });
		if (!cert) return res.status(404).json({ success: false, error: "Certificate not found" });

		if (cert.status !== "pending_instructor") {
			return res.status(400).json({ success: false, error: `Cannot approve — status is '${cert.status}'` });
		}

		cert.status = "pending_admin";
		cert.instructorApprovedAt = new Date();
		cert.instructorApprovedBy = req.user._id;
		await cert.save();

		return res.status(200).json({
			success: true,
			message: "Certificate approved by instructor. Pending admin final approval.",
			certificateId: cert.certificateId,
			status: cert.status,
		});
	} catch (error) {
		console.error("instructorApproveCertificate error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── PATCH /api/certificates/:id/admin-approve ────────────────────────────────
export const adminApproveCertificate = async (req, res) => {
	try {
		const cert = await Certificate.findOne({ certificateId: req.params.id?.toUpperCase() });
		if (!cert) return res.status(404).json({ success: false, error: "Certificate not found" });

		if (cert.status !== "pending_admin") {
			return res.status(400).json({ success: false, error: `Cannot approve — status is '${cert.status}'` });
		}

		cert.status = "issued";
		cert.adminApprovedAt = new Date();
		cert.adminApprovedBy = req.user._id;
		cert.issuedAt = new Date();
		await cert.save();

		// Update student's certification profile
		await CertificationProfile.findOneAndUpdate(
			{ certificationId: cert.certificationId },
			{ lastCertificateIssuedAt: new Date() },
		);

		return res.status(200).json({
			success: true,
			message: "Certificate officially issued! ✅",
			certificateId: cert.certificateId,
			status: cert.status,
			issuedAt: cert.issuedAt,
		});
	} catch (error) {
		console.error("adminApproveCertificate error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── PATCH /api/certificates/:id/reject ───────────────────────────────────────
export const rejectCertificate = async (req, res) => {
	const { reason } = req.body;

	try {
		const cert = await Certificate.findOne({ certificateId: req.params.id?.toUpperCase() });
		if (!cert) return res.status(404).json({ success: false, error: "Certificate not found" });

		if (!["pending_instructor", "pending_admin"].includes(cert.status)) {
			return res.status(400).json({ success: false, error: `Cannot reject — status is '${cert.status}'` });
		}

		cert.status = "rejected";
		cert.rejectionReason = reason || "No reason provided";
		cert.rejectedBy = req.user._id;
		cert.rejectedAt = new Date();
		await cert.save();

		return res.status(200).json({
			success: true,
			message: "Certificate rejected.",
			certificateId: cert.certificateId,
			reason: cert.rejectionReason,
		});
	} catch (error) {
		console.error("rejectCertificate error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── GET /api/certificates/pending ────────────────────────────────────────────
export const getPendingCertificates = async (req, res) => {
	try {
		const { status = "pending_admin", page = 1, limit = 20 } = req.query;
		const skip = (Number(page) - 1) * Number(limit);

		const validStatuses = ["pending_instructor", "pending_admin", "issued", "rejected", "revoked"];
		const filterStatus = validStatuses.includes(status) ? status : "pending_admin";

		const [certificates, total] = await Promise.all([
			Certificate.find({ status: filterStatus })
				.populate("student", "name email profileImage country certificationId")
				.populate("course", "title category level thumbnail")
				.populate("instructor", "name")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit))
				.lean(),
			Certificate.countDocuments({ status: filterStatus }),
		]);

		return res.status(200).json({
			success: true,
			total,
			page: Number(page),
			pages: Math.ceil(total / Number(limit)),
			certificates,
		});
	} catch (error) {
		console.error("getPendingCertificates error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── GET /api/certificates/stats ──────────────────────────────────────────────
export const getCertificateStats = async (req, res) => {
	try {
		const [total, issued, pending, rejected] = await Promise.all([
			Certificate.countDocuments(),
			Certificate.countDocuments({ status: "issued" }),
			Certificate.countDocuments({ status: { $in: ["pending_instructor", "pending_admin"] } }),
			Certificate.countDocuments({ status: "rejected" }),
		]);

		// Countries breakdown
		const byCountry = await Certificate.aggregate([
			{ $match: { status: "issued" } },
			{ $group: { _id: "$country", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
		]);

		// Monthly issued (last 12 months)
		const twelveMonthsAgo = new Date();
		twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

		const monthlyIssued = await Certificate.aggregate([
			{ $match: { status: "issued", issuedAt: { $gte: twelveMonthsAgo } } },
			{
				$group: {
					_id: { year: { $year: "$issuedAt" }, month: { $month: "$issuedAt" } },
					count: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
		]);

		return res.status(200).json({
			success: true,
			stats: {
				total,
				issued,
				pending,
				rejected,
				byCountry,
				monthlyIssued,
			},
		});
	} catch (error) {
		console.error("getCertificateStats error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};

// ─── GET /api/certificates/:id/download ────────────────────────────────────────
export const downloadCertificatePdf = async (req, res) => {
	try {
		const cert = await Certificate.findOne({
			$or: [{ _id: req.params.id }, { certificateId: req.params.id?.toUpperCase() }],
		})
			.populate("student", "name email profileImage country certificationId")
			.populate("course", "title description category level thumbnail language")
			.populate("instructor", "name")
			.lean();

		if (!cert) {
			return res.status(404).json({ success: false, error: "Certificate not found" });
		}

		// Access Control: Owner or Admin
		const isOwner = cert.student?._id?.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";
		if (!isOwner && !isAdmin) {
			return res.status(403).json({ success: false, error: "Access denied" });
		}

		// Security Check: Only download if officially issued
		if (cert.status !== "issued") {
			return res.status(400).json({
				success: false,
				error: `This certificate is not yet issued (current status: ${cert.status}). Only fully approved certificates can be downloaded.`,
			});
		}

		// Extract QR image base64 and convert to Buffer
		let qrBuffer = null;
		if (cert.qrCodeUrl && cert.qrCodeUrl.startsWith("data:image")) {
			const base64Data = cert.qrCodeUrl.split(",")[1];
			qrBuffer = Buffer.from(base64Data, "base64");
		}

		// Generate PDF buffer
		const pdfBuffer = await generateCertificatePdf(cert, qrBuffer);

		// Stream to client
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=MR5-Certificate-${cert.certificateId}.pdf`
		);
		res.setHeader("Content-Length", pdfBuffer.length);
		return res.end(pdfBuffer);
	} catch (error) {
		console.error("downloadCertificatePdf error:", error);
		return res.status(500).json({ success: false, error: "Internal server error" });
	}
};
