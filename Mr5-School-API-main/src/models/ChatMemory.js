import mongoose from "mongoose";

const chatMemorySchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		role: {
			type: String,
			enum: ["user", "assistant", "system"],
			required: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
		source: {
			type: String,
			enum: ["welcome", "teaching", "classroom", "homepage", "lesson"],
			default: "teaching",
		},
		mode: {
			type: String,
			enum: ["text", "voice"],
			default: "text",
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
		},
	},
	{ timestamps: true },
);

chatMemorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("ChatMemory", chatMemorySchema);
