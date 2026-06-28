import mongoose from "mongoose";

const identityFriendSchema = new mongoose.Schema(
	{
		requester: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "blocked"],
			default: "pending",
		},
	},
	{ timestamps: true },
);

identityFriendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model("IdentityFriend", identityFriendSchema);
