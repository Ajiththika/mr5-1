import mongoose from "mongoose";

const contentVersionSchema = new mongoose.Schema(
	{
		contentType: {
			type: String,
			enum: ["course", "lesson"],
			required: true,
		},
		contentId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		version: { type: Number, required: true },
		snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
		changedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		changeNote: { type: String },
	},
	{ timestamps: true },
);

contentVersionSchema.index({ contentType: 1, contentId: 1, version: -1 });

export default mongoose.model("ContentVersion", contentVersionSchema);
