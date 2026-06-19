import mongoose from "mongoose";

/**
 * Master registry of legal documents (Terms, Privacy, Cookie Notice, etc.)
 * LEGAL REVIEW REQUIRED: Document titles and mandatory flags per jurisdiction.
 */
const legalDocumentSchema = new mongoose.Schema(
	{
		slug: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		type: {
			type: String,
			required: true,
			enum: [
				"platform_terms",
				"privacy_policy",
				"cookie_notice",
				"refund_policy",
				"acceptable_use",
				"parental_consent",
				"ai_features_addendum",
				"spatial_telemetry_addendum",
			],
		},
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		isMandatory: { type: Boolean, default: false },
		isPublished: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

legalDocumentSchema.index({ type: 1, isPublished: 1 });

export default mongoose.models.LegalDocument ||
	mongoose.model("LegalDocument", legalDocumentSchema);
