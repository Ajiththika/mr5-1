import mongoose from "mongoose";

const studentLearningStateSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		lesson: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Lesson",
			required: false, // Optional, can be global to a course
		},
		skill: {
			type: String,
			required: true,
			trim: true,
		},
		mastery: {
			type: Number,
			default: 0.0,
			min: 0.0,
			max: 1.0,
		},
		accuracy: {
			type: Number,
			default: 0,
		},
		attempts: {
			type: Number,
			default: 0,
		},
		errors: [
			{
				type: String,
				trim: true,
			}
		],
		strategy: {
			type: String,
			default: "simpler explanation",
			trim: true,
		},
		lastUpdated: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true },
);

// Compound index for querying a specific student's mastery in a specific skill for a specific course/lesson
studentLearningStateSchema.index({ user: 1, course: 1, lesson: 1, skill: 1 }, { unique: true });

export default mongoose.model("StudentLearningState", studentLearningStateSchema);
