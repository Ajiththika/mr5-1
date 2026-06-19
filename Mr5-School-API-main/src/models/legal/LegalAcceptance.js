import mongoose from "mongoose";

/**
 * Immutable acceptance record. Do not update — append new row on re-consent.
 * LEGAL REVIEW REQUIRED: ipAddressHash retention and collection rules.
 */
const legalAcceptanceSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		documentVersion: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "LegalDocumentVersion",
			required: true,
			index: true,
		},
		acceptedAt: { type: Date, default: Date.now, required: true },
		acceptanceMethod: {
			type: String,
			enum: ["clickwrap", "oauth_register", "api", "admin_override"],
			required: true,
		},
		locale: { type: String, default: "en", trim: true },
		source: { type: String, default: "web", trim: true },
		ipAddressHash: { type: String, trim: true },
		userAgentTruncated: { type: String, maxlength: 256 },
		isRevoked: { type: Boolean, default: false },
		revokedAt: { type: Date },
	},
	{ timestamps: true },
);

legalAcceptanceSchema.index({ user: 1, acceptedAt: -1 });
legalAcceptanceSchema.index({ user: 1, documentVersion: 1, isRevoked: 1 });

export default mongoose.models.LegalAcceptance ||
	mongoose.model("LegalAcceptance", legalAcceptanceSchema);
