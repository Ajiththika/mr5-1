/**
 * VerificationLog.js
 * MR5 Academy Certification Standard — Certificate Verification Audit Trail
 *
 * Every scan/lookup of a certificate is recorded here.
 * Used for security, analytics, and employer verification tracking.
 */
import mongoose from "mongoose";

const verificationLogSchema = new mongoose.Schema(
	{
		// ─── What was verified ─────────────────────────────────────────────────
		certificate: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Certificate",
			index: true,
		},
		certificateId: {
			type: String,
			trim: true,
			uppercase: true,
			index: true,
			// Stored separately so logs survive even if cert is deleted
		},
		certificationId: {
			type: String,
			trim: true,
			// Student's permanent ID
		},

		// ─── Who verified ─────────────────────────────────────────────────────
		verifiedByUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			// null if anonymous (employer/public)
		},
		verifiedByRole: {
			type: String,
			enum: ["student", "instructor", "employer", "admin", "public", "api"],
			default: "public",
		},
		verifierName: {
			type: String,
			trim: true,
			// Optional: employer name if provided
		},
		verifierOrganization: {
			type: String,
			trim: true,
		},

		// ─── Verification Details ──────────────────────────────────────────────
		method: {
			type: String,
			enum: ["qr_scan", "direct_url", "api_lookup", "manual_search"],
			default: "direct_url",
		},
		result: {
			type: String,
			enum: ["valid", "invalid", "not_found", "revoked", "expired"],
			default: "valid",
			index: true,
		},
		verifiedAt: {
			type: Date,
			default: Date.now,
			index: true,
		},

		// ─── Security Metadata ─────────────────────────────────────────────────
		ipAddress: {
			type: String,
			trim: true,
		},
		userAgent: {
			type: String,
			trim: true,
		},
		country: {
			type: String,
			trim: true,
			// Geo-resolved country of verifier (optional)
		},
		referrer: {
			type: String,
			trim: true,
		},
	},
	{ timestamps: true },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
verificationLogSchema.index({ certificateId: 1, verifiedAt: -1 });
verificationLogSchema.index({ verifiedAt: -1 });
verificationLogSchema.index({ result: 1 });

// TTL index: auto-delete logs older than 2 years (optional — remove if full audit required)
// verificationLogSchema.index({ verifiedAt: 1 }, { expireAfterSeconds: 63072000 });

export default mongoose.model("VerificationLog", verificationLogSchema);
