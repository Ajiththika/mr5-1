// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		description: String,
		category: String,
		teacher: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		level: {
			type: String,
			enum: ["Beginner", "Intermediate", "Advanced"],
			default: "Beginner",
		},
		price: { type: Number, default: 0 },
		thumbnail: String,
		language: {
			type: String,
			enum: ["English", "Tamil", "Sinhala"],
			default: "English",
		},
		isApproved: { type: Boolean, default: false },
		prerequisites: [{ type: String }],
		tags: [{ type: String }],
		learningOutcomes: [{ type: String }],
		estimatedWeeks: { type: Number },
		isGenerated: { type: Boolean, default: false },
		generationJob: { type: mongoose.Schema.Types.ObjectId, ref: "CourseGenerationJob" },
		syllabusSnapshot: { type: mongoose.Schema.Types.Mixed },
	},
	{ timestamps: true },
);

// Add indexes for common query fields
courseSchema.index({ teacher: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ language: 1 });
courseSchema.index({ isApproved: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: "text", description: "text", category: "text" });

export default mongoose.model("Course", courseSchema);