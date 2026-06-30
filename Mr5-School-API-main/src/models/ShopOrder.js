import mongoose from "mongoose";

const shopOrderSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		shopItem: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ShopItem",
			required: true,
		},
		amount: { type: Number, required: true },
		method: {
			type: String,
			enum: ["Stripe", "PayPal", "Demo/Mock"],
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "completed", "failed"],
			default: "pending",
		},
		transactionId: { type: String, default: "" },
		paymentDate: { type: Date },
	},
	{ timestamps: true },
);

export default mongoose.model("ShopOrder", shopOrderSchema);
