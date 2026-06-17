import mongoose from "mongoose";

const userInventorySchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		item: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ShopItem",
			required: true,
		},
		equipped: { type: Boolean, default: false },
		purchasedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

userInventorySchema.index({ user: 1, item: 1 }, { unique: true });

export default mongoose.model("UserInventory", userInventorySchema);
