import mongoose from "mongoose";

/**
 * Feature-level opt-in preferences (AI, spatial telemetry, marketing).
 * Separate from mandatory legal document acceptance.
 */
const userConsentPreferencesSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		aiFeatures: { type: Boolean, default: false },
		spatialTelemetry: { type: Boolean, default: false },
		marketingEmail: { type: Boolean, default: false },
		analyticsEnhanced: { type: Boolean, default: false },
		updatedViaVersion: { type: String, trim: true },
	},
	{ timestamps: true },
);

export default mongoose.models.UserConsentPreferences ||
	mongoose.model("UserConsentPreferences", userConsentPreferencesSchema);
