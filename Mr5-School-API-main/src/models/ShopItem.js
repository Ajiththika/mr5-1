import mongoose from "mongoose";

const shopItemSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, default: "" },
		type: {
			type: String,
			enum: ["hat", "shirt", "accessory", "book"],
			default: "accessory",
		},
		priceCents: { type: Number, required: true, min: 0 },
		imageUrl: { type: String, default: "" },
		stripePriceId: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default mongoose.model("ShopItem", shopItemSchema);
