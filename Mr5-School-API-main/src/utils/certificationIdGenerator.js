/**
 * certificationIdGenerator.js
 * MR5 Academy Certification Standard — Unique ID Generator
 *
 * Generates globally unique certification IDs in the format:
 *   MR5-YEAR-COUNTRY-SEQUENCE
 *   e.g. MR5-2026-SL-000001
 *
 * Uses a MongoDB-based atomic counter to prevent duplicate sequences
 * per (year, country) combination.
 */
import mongoose from "mongoose";

// ─── Atomic Counter Schema ─────────────────────────────────────────────────────
// Using a simple counter collection with findOneAndUpdate for atomic increments.
const counterSchema = new mongoose.Schema({
	_id: { type: String, required: true }, // Key: "MR5-2026-SL"
	seq: { type: Number, default: 0 },
});

// Use existing mongoose connection — model is created lazily
let Counter;
try {
	Counter = mongoose.model("CertificationCounter");
} catch {
	Counter = mongoose.model("CertificationCounter", counterSchema);
}

// ─── Country Code Mapping ──────────────────────────────────────────────────────
export const SUPPORTED_COUNTRIES = {
	LK: "Sri Lanka",   // ISO uses LK for Sri Lanka (not SL)
	SL: "Sierra Leone",
	IN: "India",
	DE: "Germany",
	GB: "United Kingdom",
	US: "United States",
	CA: "Canada",
	AU: "Australia",
	SG: "Singapore",
	AE: "United Arab Emirates",
	MY: "Malaysia",
	PK: "Pakistan",
	BD: "Bangladesh",
	NP: "Nepal",
	PH: "Philippines",
	NG: "Nigeria",
	ZA: "South Africa",
	KE: "Kenya",
	// Default for unrecognised countries
	GL: "Global",
};

/**
 * Normalise a country name or code to a 2-letter ISO code.
 * Falls back to "GL" (Global) if unrecognised.
 */
export function resolveCountryCode(input) {
	if (!input) return "GL";

	const upperInput = input.toUpperCase().trim();

	// Direct code match
	if (SUPPORTED_COUNTRIES[upperInput]) return upperInput;

	// Name-to-code lookup
	const nameMap = {
		"SRI LANKA": "LK",
		"INDIA": "IN",
		"GERMANY": "DE",
		"UNITED KINGDOM": "GB",
		"UK": "GB",
		"UNITED STATES": "US",
		"USA": "US",
		"CANADA": "CA",
		"AUSTRALIA": "AU",
		"SINGAPORE": "SG",
		"MALAYSIA": "MY",
		"PAKISTAN": "PK",
		"BANGLADESH": "BD",
		"NEPAL": "NP",
		"PHILIPPINES": "PH",
		"NIGERIA": "NG",
		"SOUTH AFRICA": "ZA",
		"KENYA": "KE",
	};

	return nameMap[upperInput] || "GL";
}

/**
 * Generate a unique Certification ID.
 *
 * @param {string} countryInput - Country name or ISO code (e.g. "Sri Lanka", "LK", "SL")
 * @param {number} [year]       - Year override (defaults to current year)
 * @returns {Promise<{ certificationId: string, country: string, countryName: string, year: number, sequence: number }>}
 */
export async function generateCertificationId(countryInput, year) {
	const countryCode = resolveCountryCode(countryInput);
	const countryName = SUPPORTED_COUNTRIES[countryCode] || "Global";
	const yr = year || new Date().getFullYear();

	// Atomic increment — safe under concurrent requests
	const counterKey = `MR5-${yr}-${countryCode}`;
	const counter = await Counter.findOneAndUpdate(
		{ _id: counterKey },
		{ $inc: { seq: 1 } },
		{ upsert: true, new: true },
	);

	const sequence = counter.seq;
	const paddedSeq = String(sequence).padStart(6, "0");
	const certificationId = `MR5-${yr}-${countryCode}-${paddedSeq}`;

	return {
		certificationId,
		country: countryCode,
		countryName,
		year: yr,
		sequence,
	};
}

/**
 * Generate a Certificate-specific ID (separate from the student's certificationId).
 *
 * @param {string} certificationId - Student's permanent ID (MR5-2026-LK-000001)
 * @param {number} certCount       - Student's certificate count (1, 2, 3...)
 * @returns {string}               - e.g. MR5-CERT-2026-LK-000001-01
 */
export function generateCertificateId(certificationId, certCount) {
	const certSuffix = String(certCount).padStart(2, "0");
	return `${certificationId}-C${certSuffix}`;
}
