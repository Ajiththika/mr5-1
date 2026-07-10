/**
 * CertificationProfile.js
 * MR5 Academy Certification Standard — Student Certification Identity
 *
 * Manages the permanent MR5-YEAR-COUNTRY-SEQUENCE identity assigned to each student.
 * One profile per student. Created when they first earn a certificate.
 */
import mongoose from "mongoose";

const certificationProfileSchema = new mongoose.Schema(
	{
		// ─── Core Identity ─────────────────────────────────────────────────────
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		certificationId: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			uppercase: true,
			index: true,
			// Format: MR5-2026-SL-000001
		},

		// ─── ID Components ─────────────────────────────────────────────────────
		country: {
			type: String,
			required: true,
			trim: true,
			uppercase: true,
			maxlength: 2,
			// ISO 3166-1 alpha-2: SL, IN, GB, US, DE, CA ...
		},
		countryName: {
			type: String,
			trim: true,
			// "Sri Lanka", "India", "Germany" ...
		},
		yearIssued: {
			type: Number,
			required: true,
		},
		sequence: {
			type: Number,
			required: true,
			// The raw sequence number for this country+year
		},

		// ─── Verification Status ───────────────────────────────────────────────
		verificationStatus: {
			type: String,
			enum: ["active", "suspended", "revoked"],
			default: "active",
			index: true,
		},
		verificationStatusReason: {
			type: String,
			trim: true,
		},

		// ─── Profile Data ──────────────────────────────────────────────────────
		publicProfileUrl: {
			type: String,
			// e.g. /u/MR5-2026-SL-000001
		},
		totalCertificates: {
			type: Number,
			default: 0,
		},
		totalBadges: {
			type: Number,
			default: 0,
		},
		lastCertificateIssuedAt: {
			type: Date,
		},

		// ─── QR Code for Student ID Card ───────────────────────────────────────
		studentIdQrUrl: {
			type: String,
			// QR code pointing to student's public certification profile
		},
	},
	{ timestamps: true },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
certificationProfileSchema.index({ certificationId: 1 });
certificationProfileSchema.index({ country: 1, yearIssued: 1 });

export default mongoose.model("CertificationProfile", certificationProfileSchema);
