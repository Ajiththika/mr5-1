import mongoose from "mongoose";

/**
 * Immutable versioned legal content. Never edit in place — publish new version.
 * LEGAL REVIEW REQUIRED: requiresReacceptance and effectiveAt per counsel guidance.
 */
const legalDocumentVersionSchema = new mongoose.Schema(
	{
		document: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "LegalDocument",
			required: true,
			index: true,
		},
		versionNumber: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			required: true,
		},
		contentFormat: {
			type: String,
			enum: ["markdown", "html"],
			default: "markdown",
		},
		summaryOfChanges: { type: String, trim: true },
		effectiveAt: { type: Date, required: true },
		requiresReacceptance: { type: Boolean, default: true },
		isCurrent: { type: Boolean, default: false, index: true },
		publishedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true },
);

legalDocumentVersionSchema.index(
	{ document: 1, versionNumber: 1 },
	{ unique: true },
);
legalDocumentVersionSchema.index({ document: 1, isCurrent: 1 });
legalDocumentVersionSchema.index({ effectiveAt: 1 });

export default mongoose.models.LegalDocumentVersion ||
	mongoose.model("LegalDocumentVersion", legalDocumentVersionSchema);
