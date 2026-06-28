import mongoose from "mongoose";

const userPrivacySettingsSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		profileVisibility: {
			type: String,
			enum: ["public", "friends_only", "private"],
			default: "public",
		},
		showXp: { type: Boolean, default: true },
		showStreak: { type: Boolean, default: true },
		showBadges: { type: Boolean, default: true },
		showCertificates: { type: Boolean, default: true },
		showCourses: { type: Boolean, default: true },
		showProjects: { type: Boolean, default: true },
		showAchievements: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default mongoose.model("UserPrivacySettings", userPrivacySettingsSchema);
