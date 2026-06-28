import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		badgeId: {
			type: String,
			required: true,
			index: true,
		},
		earnedAt: {
			type: Date,
			default: Date.now,
		},
		visible: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

userBadgeSchema.index({ user: 1, badgeId: 1 }, { unique: true });

export default mongoose.model("UserBadge", userBadgeSchema);
