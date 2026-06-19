import { asyncHandler } from "../middleware/errorHandler.js";
import {
	getConsentStatus,
	getPublishedDocuments,
	getDocumentBySlug,
	recordAcceptances,
	getUserConsentPreferences,
	updateUserConsentPreferences,
	getMandatoryVersionIds,
} from "../services/legalConsentService.js";

const getClientIp = (req) =>
	req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || null;

const consentCookieOptions = () => ({
	expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
	path: "/",
});

const setConsentCookie = (res, satisfied) => {
	if (satisfied) {
		res.cookie("mr5_consent_ok", "1", consentCookieOptions());
	} else {
		res.cookie("mr5_consent_ok", "", { expires: new Date(0), httpOnly: true, path: "/" });
	}
};

export const listDocuments = asyncHandler(async (_req, res) => {
	const documents = await getPublishedDocuments();
	res.json({ success: true, data: documents });
});

export const getDocument = asyncHandler(async (req, res) => {
	const document = await getDocumentBySlug(req.params.slug);
	if (!document) {
		const error = new Error("Document not found");
		error.statusCode = 404;
		throw error;
	}
	res.json({ success: true, data: document });
});

export const getStatus = asyncHandler(async (req, res) => {
	const status = await getConsentStatus(req.user._id);
	setConsentCookie(res, status.satisfied);
	res.json({ success: true, data: status });
});

export const acceptDocuments = asyncHandler(async (req, res) => {
	const { documentVersionIds, locale, source } = req.body;
	const status = await recordAcceptances(req.user._id, documentVersionIds, {
		acceptanceMethod: "clickwrap",
		locale: locale || "en",
		source: source || "web",
		ipAddress: getClientIp(req),
		userAgent: req.headers["user-agent"],
	});
	setConsentCookie(res, status.satisfied);
	res.status(201).json({ success: true, data: status });
});

export const getRequired = asyncHandler(async (req, res) => {
	const status = await getConsentStatus(req.user._id);
	res.json({ success: true, data: status.pendingDocuments });
});

export const getPreferences = asyncHandler(async (req, res) => {
	const prefs = await getUserConsentPreferences(req.user._id);
	res.json({ success: true, data: prefs });
});

export const patchPreferences = asyncHandler(async (req, res) => {
	const prefs = await updateUserConsentPreferences(req.user._id, req.body);
	res.json({ success: true, data: prefs });
});

export const getMandatoryIds = asyncHandler(async (_req, res) => {
	const ids = await getMandatoryVersionIds();
	res.json({ success: true, data: ids });
});
