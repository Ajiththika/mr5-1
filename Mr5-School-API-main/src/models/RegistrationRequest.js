import mongoose from "mongoose";

const registrationRequestSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: ["AI-TEACHER_upgrade", "student_registration", "avatar_skill"],
			required: true,
		},
		data: {
			type: mongoose.Schema.Types.Mixed, // Store form data (e.g. bio, qualifications)
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
		submittedAt: {
			type: Date,
			default: Date.now,
		},
		approvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		approvedAt: Date,
		rejectedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		rejectedAt: Date,
		reason: String, // Rejection reason
		note: String, // Approval note
	},
	{ timestamps: true },
);

export default mongoose.model("RegistrationRequest", registrationRequestSchema);
