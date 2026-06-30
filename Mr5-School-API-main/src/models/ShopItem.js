import mongoose from "mongoose";

const shopItemSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		description: { type: String, default: "" },
		type: {
			type: String,
			enum: [
				"hat",
				"shirt",
				"accessory",
				"book",
				"teacher_avatar",
				"classroom_item",
				"audio_pack",
				"activity_pack",
				"transport",
			],
			default: "accessory",
		},
		category: {
			type: String,
			enum: ["teachers", "classroom", "audio", "activities", "transport", "cosmetic"],
			default: "cosmetic",
		},
		itemSlug: { type: String, trim: true, sparse: true },
		features: { type: [String], default: [] },
		metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
		comingSoon: { type: Boolean, default: false },
		priceCents: { type: Number, required: true, min: 0 },
		imageUrl: { type: String, default: "" },
		stripePriceId: { type: String, default: "" },
		isActive: { type: Boolean, default: true },
		teacherSlug: { type: String, trim: true, sparse: true, unique: true },
		modelUrl: { type: String, default: "" },
		personality: { type: String, default: "" },
		expertise: { type: [String], default: [] },
		isPremium: { type: Boolean, default: false },
		voiceStyle: { type: String, default: "" },
		teachingStyle: { type: String, default: "" },
		greeting: { type: String, default: "" },
		rating: { type: Number, default: 5, min: 0, max: 5 },
	},
	{ timestamps: true },
);

export default mongoose.model("ShopItem", shopItemSchema);
