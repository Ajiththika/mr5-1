import crypto from "crypto";
import LegalDocument from "../models/legal/LegalDocument.js";
import LegalDocumentVersion from "../models/legal/LegalDocumentVersion.js";
import LegalAcceptance from "../models/legal/LegalAcceptance.js";
import UserConsentPreferences from "../models/legal/UserConsentPreferences.js";
import ConsentAuditLog from "../models/legal/ConsentAuditLog.js";
import { LEGAL_SEED_DOCUMENTS } from "../data/legalSeedContent.js";

export async function seedLegalDocumentsIfEmpty() {
	const existing = await LegalDocument.countDocuments();
	if (existing > 0) return;

	const effectiveAt = new Date("2025-06-15T00:00:00.000Z");

	for (const doc of LEGAL_SEED_DOCUMENTS) {
		const created = await LegalDocument.create({
			slug: doc.slug,
			type: doc.type,
			title: doc.title,
			description: doc.description,
			isMandatory: doc.isMandatory,
			isPublished: doc.isPublished,
		});

		await LegalDocumentVersion.create({
			document: created._id,
			versionNumber: doc.versionNumber,
			content: doc.content,
			contentFormat: "markdown",
			summaryOfChanges: doc.summaryOfChanges,
			effectiveAt,
			requiresReacceptance: true,
			isCurrent: true,
		});
	}

	console.log("Seeded legal documents for development");
}

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

export async function getConsentStatus(userId) {
	const pendingDocuments = await getPendingMandatoryDocuments(userId);
	return {
		satisfied: hasSatisfiedMandatoryConsent(pendingDocuments),
		pendingDocuments,
	};
}

export async function getPublishedDocuments() {
	const docs = await LegalDocument.find({ isPublished: true })
		.sort({ title: 1 })
		.lean();

	const result = [];
	for (const doc of docs) {
		const version = await LegalDocumentVersion.findOne({
			document: doc._id,
			isCurrent: true,
		}).lean();
		if (!version) continue;
		result.push({
			slug: doc.slug,
			title: doc.title,
			type: doc.type,
			isMandatory: doc.isMandatory,
			versionNumber: version.versionNumber,
			effectiveAt: version.effectiveAt,
		});
	}
	return result;
}

export async function getDocumentBySlug(slug) {
	const doc = await LegalDocument.findOne({
		slug: slug.toLowerCase(),
		isPublished: true,
	}).lean();
	if (!doc) return null;

	const version = await LegalDocumentVersion.findOne({
		document: doc._id,
		isCurrent: true,
	}).lean();
	if (!version) return null;

	return {
		slug: doc.slug,
		title: doc.title,
		type: doc.type,
		isMandatory: doc.isMandatory,
		versionNumber: version.versionNumber,
		content: version.content,
		contentFormat: version.contentFormat,
		effectiveAt: version.effectiveAt,
		documentVersionId: version._id.toString(),
	};
}

export async function getMandatoryVersionIds() {
	const docs = await LegalDocument.find({
		isMandatory: true,
		isPublished: true,
	}).lean();

	const ids = [];
	for (const doc of docs) {
		const version = await LegalDocumentVersion.findOne({
			document: doc._id,
			isCurrent: true,
		}).lean();
		if (version) ids.push(version._id.toString());
	}
	return ids;
}

export async function recordAcceptances(
	userId,
	documentVersionIds,
	{ acceptanceMethod = "clickwrap", locale = "en", source = "web", ipAddress, userAgent } = {},
) {
	if (!Array.isArray(documentVersionIds) || documentVersionIds.length === 0) {
		const error = new Error("At least one document version is required");
		error.statusCode = 400;
		throw error;
	}

	const ipHash =
		process.env.CONSENT_IP_LOGGING === "true"
			? hashIpAddress(ipAddress)
			: undefined;
	const ua = truncateUserAgent(userAgent);

	for (const versionId of documentVersionIds) {
		const version = await LegalDocumentVersion.findById(versionId).populate("document");
		if (!version?.isCurrent) {
			const error = new Error("Invalid or outdated document version");
			error.statusCode = 400;
			throw error;
		}

		const existing = await LegalAcceptance.findOne({
			user: userId,
			documentVersion: versionId,
			isRevoked: false,
		});
		if (existing) continue;

		await LegalAcceptance.create({
			user: userId,
			documentVersion: versionId,
			acceptanceMethod,
			locale,
			source,
			ipAddressHash: ipHash,
			userAgentTruncated: ua,
		});

		await ConsentAuditLog.create({
			user: userId,
			eventType: "accepted",
			documentSlug: version.document?.slug,
			versionNumber: version.versionNumber,
			ipAddressHash: ipHash,
		});
	}

	return getConsentStatus(userId);
}

export async function getUserConsentPreferences(userId) {
	let prefs = await UserConsentPreferences.findOne({ user: userId });
	if (!prefs) {
		prefs = await UserConsentPreferences.create({ user: userId });
	}
	return prefs;
}

export async function updateUserConsentPreferences(userId, updates) {
	const allowed = ["aiFeatures", "spatialTelemetry", "marketingEmail", "analyticsEnhanced"];
	const payload = {};
	for (const key of allowed) {
		if (typeof updates[key] === "boolean") payload[key] = updates[key];
	}

	const prefs = await UserConsentPreferences.findOneAndUpdate(
		{ user: userId },
		{ $set: payload },
		{ new: true, upsert: true },
	);

	await ConsentAuditLog.create({
		user: userId,
		eventType: "preference_updated",
		metadata: payload,
	});

	return prefs;
}

export function hashIpAddress(ip, secret = process.env.CONSENT_IP_SALT || "") {
	if (!ip) return undefined;
	return crypto.createHash("sha256").update(`${secret}:${ip}`).digest("hex");
}

export function truncateUserAgent(userAgent) {
	if (!userAgent) return undefined;
	return userAgent.slice(0, 256);
}
