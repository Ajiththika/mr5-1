import mongoose from "mongoose";

const STATUSES = [
	"draft",
	"pending_review",
	"approved",
	"published",
	"rejected",
	"archived",
];

const contentApprovalSchema = new mongoose.Schema(
	{
		contentType: {
			type: String,
			enum: ["course", "lesson", "quiz", "assignment"],
			required: true,
		},
		contentId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			refPath: "contentModel",
		},
		contentModel: {
			type: String,
			enum: ["Course", "Lesson", "Assignment"],
			required: true,
		},
		title: { type: String, required: true },
		status: {
			type: String,
			enum: STATUSES,
			default: "pending_review",
		},
		submittedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		reviewedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		reviewComments: [
			{
				author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				text: String,
				createdAt: { type: Date, default: Date.now },
			},
		],
		rejectionReason: { type: String },
		version: { type: Number, default: 1 },
		priority: {
			type: String,
			enum: ["low", "normal", "high"],
			default: "normal",
		},
	},
	{ timestamps: true },
);

contentApprovalSchema.index({ status: 1, createdAt: -1 });
contentApprovalSchema.index({ contentType: 1, contentId: 1 });

export default mongoose.model("ContentApproval", contentApprovalSchema);
