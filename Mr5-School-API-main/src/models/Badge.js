/**
 * Badge.js
 * MR5 Academy Certification Standard — Badge Definitions
 *
 * Master list of all available badges.
 * UserBadge (existing) links students to these badge definitions.
 */
import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
	{
		// ─── Identity ──────────────────────────────────────────────────────────
		badgeId: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			index: true,
			// e.g. "ai-beginner", "web-developer", "python-expert"
		},
		name: {
			type: String,
			required: true,
			trim: true,
			// e.g. "AI Beginner", "Web Developer"
		},
		description: {
			type: String,
			required: true,
			trim: true,
		},

		// ─── Visual ────────────────────────────────────────────────────────────
		imageUrl: {
			type: String,
			// Cloudinary URL of badge SVG/PNG
		},
		iconEmoji: {
			type: String,
			// Fallback emoji if no image: "🤖", "💻", "🐍"
		},
		color: {
			type: String,
			default: "#6366f1",
			// Primary color for badge theming
		},
		gradientFrom: {
			type: String,
			default: "#6366f1",
		},
		gradientTo: {
			type: String,
			default: "#8b5cf6",
		},

		// ─── Classification ────────────────────────────────────────────────────
		level: {
			type: String,
			enum: ["bronze", "silver", "gold", "platinum", "special"],
			default: "bronze",
		},
		category: {
			type: String,
			enum: [
				"ai-ml",
				"web-development",
				"programming",
				"data-science",
				"cybersecurity",
				"design",
				"business",
				"language",
				"achievement",
				"special",
			],
			required: true,
		},

		// ─── Earning Criteria ──────────────────────────────────────────────────
		criteria: {
			type: String,
			required: true,
			// Human-readable: "Complete any AI course with score ≥ 70%"
		},
		autoAward: {
			type: Boolean,
			default: true,
			// If true, awarded automatically on meeting criteria
		},
		requiredCourseIds: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
		],
		requiredCourseCount: {
			type: Number,
			default: 1,
		},
		requiredMinScore: {
			type: Number,
			default: 70,
		},
		requiredCategory: {
			type: String,
			// If set, any course in this category counts
		},

		// ─── Metadata ──────────────────────────────────────────────────────────
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		isShareable: {
			type: Boolean,
			default: true,
		},
		sortOrder: {
			type: Number,
			default: 100,
		},
		totalAwarded: {
			type: Number,
			default: 0,
			// Counter incremented when badge is awarded
		},
	},
	{ timestamps: true },
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
badgeSchema.index({ category: 1, level: 1 });
badgeSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model("Badge", badgeSchema);
