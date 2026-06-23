// models/Lesson.js
import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
	{
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		title: { type: String, required: true },
		videoUrl: String,
		content: String,
		duration: Number, // in minutes
		order: Number, // for sorting lessons
		moduleTitle: String,
		objectives: [{ type: String }],
		example: String,
		practiceTask: String,
		quiz: [{ type: mongoose.Schema.Types.Mixed }],
		subtopics: [{ type: String }],
		recap: String,
		realLifeScenario: String,
		publishStatus: {
			type: String,
			enum: [
				"draft",
				"pending_review",
				"approved",
				"published",
				"rejected",
				"archived",
			],
			default: "draft",
		},
	},
	{ timestamps: true },
);

// Add indexes for common query fields
lessonSchema.index({ course: 1 });
lessonSchema.index({ order: 1 });
lessonSchema.index({ createdAt: -1 });

export default mongoose.model("Lesson", lessonSchema);
