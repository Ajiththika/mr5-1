// models/Submission.js
import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
	{
		assignment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Assignment",
			required: true,
		},
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		fileUrl: String, // e.g. uploaded file or Google Drive link
		grade: { type: String, default: "Pending" },
		feedback: String,
		submittedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true }); // one submission per student

export default mongoose.model("Submission", submissionSchema);
