/**
 * Certificate.js
 * MR5 Academy Certification Standard — Full Certificate Model
 *
 * This replaces the thin UserCertificate model.
 * Supports the complete approval workflow and blockchain-style verification.
 */
import mongoose from "mongoose";
import crypto from "crypto";

const blockchainRecordSchema = new mongoose.Schema(
	{
		verificationHash: {
			type: String,
			required: true,
		},
		previousHash: {
			type: String,
			default: "GENESIS",
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
		nonce: {
			type: String,
		},
		blockIndex: {
			type: Number,
			default: 0,
		},
	},
	{ _id: false },
);

const certificateSchema = new mongoose.Schema(
	{
		// ─── Identification ────────────────────────────────────────────────────
		certificateId: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			uppercase: true,
			index: true,
			// Format: MR5-CERT-2026-SL-000001
		},
		certificationId: {
			type: String,
			required: true,
			trim: true,
			uppercase: true,
			index: true,
			// Student's permanent ID: MR5-2026-SL-000001
		},

		// ─── Relationships ─────────────────────────────────────────────────────
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		instructor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		// ─── Certificate Content ───────────────────────────────────────────────
		title: {
			type: String,
			required: true,
			trim: true,
			// e.g. "Certificate of Completion — Introduction to AI"
		},
		courseName: {
			type: String,
			required: true,
			trim: true,
		},
		instructorName: {
			type: String,
			trim: true,
		},
		studentName: {
			type: String,
			required: true,
			trim: true,
		},
		institution: {
			type: String,
			default: "MR5 Academy",
			trim: true,
		},
		country: {
			type: String,
			default: "",
			trim: true,
		},

		// ─── Academic Results ──────────────────────────────────────────────────
		finalScore: {
			type: Number,
			min: 0,
			max: 100,
		},
		grade: {
			type: String,
			enum: ["A+", "A", "B+", "B", "C", "D", "F", "Pass", "Distinction", "Pending"],
			default: "Pending",
		},
		completionDate: {
			type: Date,
			required: true,
		},
		durationHours: {
			type: Number,
			default: 0,
		},

		// ─── Approval Workflow ─────────────────────────────────────────────────
		status: {
			type: String,
			enum: [
				"pending_instructor",  // Awaiting instructor review
				"pending_admin",       // Instructor approved, awaiting admin
				"issued",              // Fully approved and issued
				"rejected",            // Rejected at any stage
				"revoked",             // Previously issued but revoked
				"expired",             // Past expiry date
			],
			default: "pending_instructor",
			index: true,
		},
		instructorApprovedAt: {
			type: Date,
		},
		instructorApprovedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		adminApprovedAt: {
			type: Date,
		},
		adminApprovedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		issuedAt: {
			type: Date,
		},
		rejectionReason: {
			type: String,
			trim: true,
		},
		rejectedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		rejectedAt: {
			type: Date,
		},
		revokedAt: {
			type: Date,
		},
		revokedReason: {
			type: String,
		},
		expiresAt: {
			type: Date,
			default: null, // null = never expires
		},

		// ─── Blockchain-Style Verification ────────────────────────────────────
		verificationHash: {
			type: String,
			unique: true,
			sparse: true,
			index: true,
			// Format: MR5-HASH-[8 char hex uppercase]
		},
		blockchainRecord: {
			type: blockchainRecordSchema,
		},

		// ─── Asset URLs ────────────────────────────────────────────────────────
		pdfUrl: {
			type: String, // Cloudinary URL
		},
		qrCodeUrl: {
			type: String, // Cloudinary URL or base64
		},
		qrCodeData: {
			type: String, // The URL encoded in the QR: /verify/[certificateId]
		},

		// ─── Metadata ──────────────────────────────────────────────────────────
		certificateType: {
			type: String,
			enum: ["completion", "achievement", "ai_specialist", "professional", "partner"],
			default: "completion",
		},
		isPublic: {
			type: Boolean,
			default: true, // Public = anyone can verify via QR
		},
		verificationCount: {
			type: Number,
			default: 0, // How many times this cert has been verified
		},
		tags: [{ type: String }],
	},
	{ timestamps: true },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
certificateSchema.index({ student: 1, course: 1 });
certificateSchema.index({ certificationId: 1 });
certificateSchema.index({ status: 1, createdAt: -1 });
certificateSchema.index({ verificationHash: 1 });
certificateSchema.index({ issuedAt: -1 });

// ─── Static: Generate Certificate ID ──────────────────────────────────────────
certificateSchema.statics.generateCertificateId = function (country, year, sequence) {
	const countryCode = (country || "GL").toUpperCase().substring(0, 2);
	const yr = year || new Date().getFullYear();
	const seq = String(sequence).padStart(6, "0");
	return `MR5-CERT-${yr}-${countryCode}-${seq}`;
};

// ─── Static: Generate Verification Hash ───────────────────────────────────────
certificateSchema.statics.generateVerificationHash = function (data) {
	const payload = `${data.studentId}|${data.courseId}|${data.completionDate}|${data.grade}|${data.certificationId}|${Date.now()}`;
	const fullHash = crypto.createHash("sha256").update(payload).digest("hex").toUpperCase();
	return `MR5-HASH-${fullHash.substring(0, 8)}`;
};

export default mongoose.model("Certificate", certificateSchema);
