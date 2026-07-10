// models/Enrollment.js
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
	{
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		progress: { type: Number, default: 0 }, // in %
		status: { type: String, enum: ["active", "completed"], default: "active" },
		enrolledAt: { type: Date, default: Date.now },
		completedAt: { type: Date },
		finalScore: {
			type: Number,
			min: 0,
			max: 100,
			// Computed from lesson progress + quiz + assignments
		},
		grade: {
			type: String,
			enum: ["A+", "A", "B+", "B", "C", "D", "F", "Pass", "Distinction", "Pending"],
			default: "Pending",
		},
		certificateEligible: {
			type: Boolean,
			default: false,
			// Set true automatically when progress + score meet course certificateRules
		},
		certificateRequestedAt: {
			type: Date,
			// When the certificate generation was triggered
		},
	},
	{ timestamps: true },
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true }); // prevent duplicate enrollment

export default mongoose.model("Enrollment", enrollmentSchema);
