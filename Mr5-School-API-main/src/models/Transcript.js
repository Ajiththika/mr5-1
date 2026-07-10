/**
 * Transcript.js
 * MR5 Academy Certification Standard — Global Student Transcript
 *
 * A single document per student aggregating all completed courses,
 * grades, and certificates. Can be shared with employers and universities.
 */
import mongoose from "mongoose";

const transcriptCourseEntrySchema = new mongoose.Schema(
	{
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
		certificate: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Certificate",
		},
		certificateId: {
			type: String,
			trim: true,
		},
		courseName: {
			type: String,
			required: true,
			trim: true,
		},
		courseCategory: {
			type: String,
			trim: true,
		},
		instructorName: {
			type: String,
			trim: true,
		},
		institution: {
			type: String,
			default: "MR5 Academy",
		},
		completionDate: {
			type: Date,
			required: true,
		},
		finalScore: {
			type: Number,
			min: 0,
			max: 100,
		},
		grade: {
			type: String,
		},
		durationHours: {
			type: Number,
			default: 0,
		},
		level: {
			type: String,
			enum: ["Beginner", "Intermediate", "Advanced"],
		},
		status: {
			type: String,
			enum: ["verified", "pending_verification"],
			default: "pending_verification",
		},
	},
	{ _id: false },
);

const transcriptSchema = new mongoose.Schema(
	{
		// ─── Student Identity ──────────────────────────────────────────────────
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		certificationId: {
			type: String,
			required: true,
			trim: true,
			uppercase: true,
			index: true,
			// MR5-2026-SL-000001
		},
		studentName: {
			type: String,
			required: true,
			trim: true,
		},
		studentEmail: {
			type: String,
			trim: true,
		},
		country: {
			type: String,
			trim: true,
		},
		profileImageUrl: {
			type: String,
		},

		// ─── Academic Record ───────────────────────────────────────────────────
		courses: [transcriptCourseEntrySchema],
		totalCertificates: {
			type: Number,
			default: 0,
		},
		totalCoursesCompleted: {
			type: Number,
			default: 0,
		},
		totalStudyHours: {
			type: Number,
			default: 0,
		},
		gpa: {
			type: Number,
			min: 0,
			max: 4.0,
			// Computed from grades
		},

		// ─── Verification ──────────────────────────────────────────────────────
		verificationHash: {
			type: String,
			// Hash of the full transcript content for integrity check
		},
		lastGeneratedAt: {
			type: Date,
			default: Date.now,
		},
		pdfUrl: {
			type: String,
			// Cloudinary URL of generated transcript PDF
		},

		// ─── Access Control ────────────────────────────────────────────────────
		isPublic: {
			type: Boolean,
			default: false,
			// Student must explicitly make transcript public for employer access
		},
		publicShareToken: {
			type: String,
			unique: true,
			sparse: true,
			// One-time or persistent token for employer-specific sharing
		},
	},
	{ timestamps: true },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
transcriptSchema.index({ certificationId: 1 });
transcriptSchema.index({ publicShareToken: 1 });

export default mongoose.model("Transcript", transcriptSchema);
