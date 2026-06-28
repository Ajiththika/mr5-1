import mongoose from "mongoose";

const identityNotificationSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		actor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		type: {
			type: String,
			enum: [
				"friend_request",
				"friend_accepted",
				"badge_earned",
				"certificate_earned",
				"course_completed",
				"level_up",
				"streak_milestone",
				"project_published",
				"leaderboard",
				"system",
			],
			required: true,
		},
		scope: {
			type: String,
			enum: ["global", "friends", "personal"],
			default: "personal",
			index: true,
		},
		title: { type: String, required: true, trim: true },
		message: { type: String, required: true, trim: true },
		href: String,
		icon: String,
		read: { type: Boolean, default: false, index: true },
		metadata: mongoose.Schema.Types.Mixed,
	},
	{ timestamps: true },
);

identityNotificationSchema.index({ user: 1, scope: 1, createdAt: -1 });

export default mongoose.model("IdentityNotification", identityNotificationSchema);
