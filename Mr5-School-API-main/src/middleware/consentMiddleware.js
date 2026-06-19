import { getPendingMandatoryDocuments, hasSatisfiedMandatoryConsent } from "../services/legalConsentService.js";

const CONSENT_EXEMPT_PREFIXES = [
	"/api/auth/login",
	"/api/auth/register",
	"/api/auth/refresh",
	"/api/auth/google",
	"/api/legal",
	"/health",
];

const CONSENT_PROTECTED_PREFIXES = [
	"/api/courses",
	"/api/enrollments",
	"/api/students",
	"/api/admin",
	"/api/ai",
	"/api/ai-assistant-interactions",
	"/api/payments",
	"/api/assignments",
	"/api/submissions",
];

/**
 * Blocks protected LMS API routes until mandatory legal documents are accepted.
 * Mount after verifyToken on routes that require consent.
 *
 * LEGAL REVIEW REQUIRED: Confirm exempt/protected path lists per deployment.
 */
export async function requireLegalConsent(req, res, next) {
	try {
		const path = req.originalUrl.split("?")[0];

		if (CONSENT_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) {
			return next();
		}

		const needsConsentGate = CONSENT_PROTECTED_PREFIXES.some((prefix) =>
			path.startsWith(prefix),
		);

		if (!needsConsentGate || !req.user?._id) {
			return next();
		}

		if (process.env.LEGAL_RECONSENT_ENFORCED === "false") {
			return next();
		}

		const pending = await getPendingMandatoryDocuments(req.user._id);

		if (!hasSatisfiedMandatoryConsent(pending)) {
			return res.status(403).json({
				success: false,
				code: "CONSENT_REQUIRED",
				message: "Legal consent required before accessing this resource.",
				requiredDocuments: pending,
			});
		}

		return next();
	} catch (error) {
		return next(error);
	}
}
