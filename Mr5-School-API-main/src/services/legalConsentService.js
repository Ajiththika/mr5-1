import crypto from "crypto";
import LegalDocument from "../models/legal/LegalDocument.js";
import LegalDocumentVersion from "../models/legal/LegalDocumentVersion.js";
import LegalAcceptance from "../models/legal/LegalAcceptance.js";

/**
 * Returns mandatory published documents whose current version is not yet accepted.
 */
export async function getPendingMandatoryDocuments(userId) {
	const mandatoryDocs = await LegalDocument.find({
		isMandatory: true,
		isPublished: true,
	}).lean();

	const pending = [];

	for (const doc of mandatoryDocs) {
		const currentVersion = await LegalDocumentVersion.findOne({
			document: doc._id,
			isCurrent: true,
		}).lean();

		if (!currentVersion) continue;

		const acceptance = await LegalAcceptance.findOne({
			user: userId,
			documentVersion: currentVersion._id,
			isRevoked: false,
		})
			.sort({ acceptedAt: -1 })
			.lean();

		if (!acceptance) {
			pending.push({
				slug: doc.slug,
				title: doc.title,
				type: doc.type,
				versionNumber: currentVersion.versionNumber,
				documentVersionId: currentVersion._id.toString(),
				effectiveAt: currentVersion.effectiveAt,
			});
		}
	}

	return pending;
}

export function hasSatisfiedMandatoryConsent(pendingDocuments) {
	return pendingDocuments.length === 0;
}

/**
 * Hash IP for audit storage when CONSENT_IP_LOGGING=true.
 * LEGAL REVIEW REQUIRED: Confirm hashing meets jurisdictional requirements.
 */
export function hashIpAddress(ip, secret = process.env.CONSENT_IP_SALT || "") {
	if (!ip) return undefined;
	return crypto
		.createHash("sha256")
		.update(`${secret}:${ip}`)
		.digest("hex");
}

export function truncateUserAgent(userAgent) {
	if (!userAgent) return undefined;
	return userAgent.slice(0, 256);
}
