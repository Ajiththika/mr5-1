import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		specialization: {
			type: String,
			required: true,
		},
		bio: {
			type: String,
			default: "",
		},
		isAvatarAI: {
			type: Boolean,
			default: false,
		},
		approvedAt: {
			type: Date,
		},
		approvedBy: {
			type: String,
		},
		courses: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
		],
		rating: {
			type: Number,
			default: 0,
		},
		totalStudents: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("Teacher", teacherSchema);
