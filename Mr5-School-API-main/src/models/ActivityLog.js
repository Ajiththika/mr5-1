import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
	{
		actor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		action: { type: String, required: true },
		module: {
			type: String,
			enum: [
				"teachers",
				"courses",
				"classrooms",
				"approvals",
				"roles",
				"analytics",
				"system",
			],
			default: "system",
		},
		targetType: { type: String },
		targetId: { type: mongoose.Schema.Types.ObjectId },
		summary: { type: String, required: true },
		metadata: { type: mongoose.Schema.Types.Mixed },
	},
	{ timestamps: true },
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ actor: 1 });

export default mongoose.model("ActivityLog", activityLogSchema);
