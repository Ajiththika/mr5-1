import mongoose from "mongoose";

const userLearningStatsSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		xp: { type: Number, default: 0, min: 0 },
		level: { type: Number, default: 1, min: 1 },
		studyStreak: { type: Number, default: 0, min: 0 },
		consistencyScore: { type: Number, default: 0, min: 0, max: 100 },
		completedCourses: { type: Number, default: 0, min: 0 },
		projects: [
			{
				title: String,
				summary: String,
				url: String,
				thumbnailUrl: String,
				completedAt: Date,
			},
		],
		achievements: [
			{
				title: String,
				description: String,
				earnedAt: Date,
				icon: String,
			},
		],
		lastActiveAt: Date,
	},
	{ timestamps: true },
);

export default mongoose.model("UserLearningStats", userLearningStatsSchema);
