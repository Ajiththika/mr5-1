import mongoose from "mongoose";

/**
 * Append-only audit trail for consent and legal events.
 */
const consentAuditLogSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			index: true,
		},
		actorUser: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		eventType: {
			type: String,
			required: true,
			enum: [
				"accepted",
				"revoked",
				"reconsent_required",
				"reconsent_completed",
				"preference_updated",
				"document_published",
				"document_retired",
			],
			index: true,
		},
		documentSlug: { type: String, trim: true, lowercase: true },
		versionNumber: { type: String, trim: true },
		metadata: { type: mongoose.Schema.Types.Mixed },
		ipAddressHash: { type: String, trim: true },
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
);

consentAuditLogSchema.index({ user: 1, createdAt: -1 });
consentAuditLogSchema.index({ eventType: 1, createdAt: -1 });

export default mongoose.models.ConsentAuditLog ||
	mongoose.model("ConsentAuditLog", consentAuditLogSchema);
