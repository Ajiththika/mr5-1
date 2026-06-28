import mongoose from "mongoose";

const userCertificateSchema = new mongoose.Schema(
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
		verificationId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		issuedAt: {
			type: Date,
			default: Date.now,
		},
		watermarkHash: String,
	},
	{ timestamps: true },
);

export default mongoose.model("UserCertificate", userCertificateSchema);
