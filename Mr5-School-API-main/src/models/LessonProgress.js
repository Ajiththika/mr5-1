import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		lesson: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Lesson",
			required: true,
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		completedAt: {
			type: Date,
			default: Date.now,
		},
		watchPercent: {
			type: Number,
			default: 100,
			min: 0,
			max: 100,
		},
	},
	{ timestamps: true },
);

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ user: 1, course: 1 });

export default mongoose.model("LessonProgress", lessonProgressSchema);
