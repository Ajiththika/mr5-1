// models/AI Interaction.js
import mongoose from "mongoose";

const aiInteractionSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
		question: { type: String, required: true },
		response: String,
		mode: { type: String, enum: ["text", "voice"], default: "text" },
		timestamp: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

export default mongoose.model("AIInteraction", aiInteractionSchema);