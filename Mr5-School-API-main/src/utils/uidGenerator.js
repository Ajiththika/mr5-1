import crypto from "crypto";

/** @typedef {'student' | 'AI-TEACHER' | 'admin'} UserRole */

const UID_PREFIX_BY_ROLE = {
	student: "MR5-STU",
	"AI-TEACHER": "MR5-TCH",
	admin: "MR5-ADM",
};

const UID_SUFFIX_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * @param {UserRole} role
 */
export function getUidPrefixForRole(role) {
	return UID_PREFIX_BY_ROLE[role] || UID_PREFIX_BY_ROLE.student;
}

function randomSuffix(length = 6) {
	const bytes = crypto.randomBytes(length);
	let suffix = "";
	for (let i = 0; i < length; i += 1) {
		suffix += UID_SUFFIX_CHARS[bytes[i] % UID_SUFFIX_CHARS.length];
	}
	return suffix;
}

/**
 * @param {UserRole} role
 */
export function buildMr5Uid(role) {
	return `${getUidPrefixForRole(role)}-${randomSuffix()}`;
}

const UID_PATTERN = /^MR5-(STU|TCH|ADM)-[A-Z0-9]{6}$/;

/**
 * @param {string} value
 */
export function normalizeMr5Uid(value) {
	if (typeof value !== "string") return null;
	const normalized = value.trim().toUpperCase();
	return UID_PATTERN.test(normalized) ? normalized : null;
}

/**
 * @param {string} value
 */
export function isMr5UidInput(value) {
	if (typeof value !== "string") return false;
	const trimmed = value.trim().toUpperCase();
	return /^MR5-(STU|TCH|ADM)(-|$)/.test(trimmed);
}

/**
 * @param {string} uid
 */
export function getRoleFromUid(uid) {
	const normalized = normalizeMr5Uid(uid);
	if (!normalized) return null;
	if (normalized.startsWith("MR5-STU-")) return "student";
	if (normalized.startsWith("MR5-TCH-")) return "AI-TEACHER";
	if (normalized.startsWith("MR5-ADM-")) return "admin";
	return null;
}
