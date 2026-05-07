// models/Assignment.js
import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
	{
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		teacher: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: { type: String, required: true },
		description: String,
		dueDate: Date,
	},
	{ timestamps: true },
);

export default mongoose.model("Assignment", assignmentSchema);
