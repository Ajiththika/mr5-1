import mongoose from "mongoose";

/**
 * Privacy-safe 3D interaction log — ONLY written when user.consent.spatialTelemetry = true.
 * LEGAL REVIEW REQUIRED: Define retention window and anonymization policy.
 */
const spatialInteractionLogSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
		roomType: {
			type: String,
			required: true,
			trim: true,
		},
		eventType: {
			type: String,
			required: true,
			trim: true,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
		},
		recordedAt: { type: Date, default: Date.now, index: true },
	},
	{ timestamps: false },
);

spatialInteractionLogSchema.index({ user: 1, recordedAt: -1 });
spatialInteractionLogSchema.index({ course: 1, recordedAt: -1 });

export default mongoose.models.SpatialInteractionLog ||
	mongoose.model("SpatialInteractionLog", spatialInteractionLogSchema);
