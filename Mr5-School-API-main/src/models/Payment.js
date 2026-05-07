// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		},
		amount: { type: Number, required: true },
		method: {
			type: String,
			enum: ["PayHere", "Stripe", "WebXPay", "Demo/Mock"],
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "completed", "failed"],
			default: "pending",
		},
		transactionId: String,
		paymentDate: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
