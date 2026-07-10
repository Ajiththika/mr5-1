/**
 * certificateHasher.js
 * MR5 Academy Certification Standard — Blockchain-Style Hash Generator
 *
 * Creates tamper-evident SHA-256 hashes for certificates.
 * Any change to the certificate data will produce a completely different hash,
 * making forgery detectable.
 *
 * IMPORTANT: This is NOT a blockchain — it is blockchain-INSPIRED security
 * using cryptographic hashing and a hash chain pattern for tamper detection.
 */
import crypto from "crypto";

/**
 * Generate the primary verification hash for a certificate.
 * This hash is what gets printed on the certificate and encoded in the QR code.
 *
 * @param {object} data - Certificate data to hash
 * @returns {string} - Format: MR5-HASH-[8 CHAR HEX]
 */
export function generateVerificationHash(data) {
	const {
		studentId,       // MongoDB ObjectId as string
		courseId,        // MongoDB ObjectId as string
		certificationId, // MR5-2026-LK-000001
		completionDate,  // ISO date string
		grade,           // "A", "B+", etc.
		institution,     // "MR5 Academy"
		instructorId,    // MongoDB ObjectId as string (optional)
	} = data;

	// Deterministic payload — same data always produces same hash
	const payload = [
		studentId || "",
		courseId || "",
		certificationId || "",
		completionDate || "",
		grade || "",
		institution || "MR5 Academy",
		instructorId || "",
	].join("|");

	const fullHash = crypto
		.createHash("sha256")
		.update(payload)
		.digest("hex")
		.toUpperCase();

	// Short form for display: MR5-HASH-8A72F91X
	const shortHash = fullHash.substring(0, 8);
	return `MR5-HASH-${shortHash}`;
}

/**
 * Generate a full hash (hex) suitable for the blockchain record chain.
 * Used internally — not displayed on certificate.
 *
 * @param {object} data - Certificate data
 * @returns {string} - Full 64-char hex hash
 */
export function generateFullHash(data) {
	const payload = JSON.stringify({
		...data,
		_timestamp: data.timestamp || new Date().toISOString(),
	});
	return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Build a blockchain-style record for a certificate.
 * Chains to the previous certificate's hash, creating a verifiable sequence.
 *
 * @param {object} certData    - Certificate fields
 * @param {string} previousHash - Hash of the previous certificate (or "GENESIS")
 * @param {number} blockIndex  - Sequential block index
 * @returns {object} - Blockchain record to store in Certificate.blockchainRecord
 */
export function buildBlockchainRecord(certData, previousHash = "GENESIS", blockIndex = 0) {
	const timestamp = new Date();
	const nonce = crypto.randomBytes(8).toString("hex").toUpperCase();

	const blockPayload = {
		blockIndex,
		previousHash,
		timestamp: timestamp.toISOString(),
		nonce,
		certData: {
			certificationId: certData.certificationId,
			studentId: certData.studentId,
			courseId: certData.courseId,
			grade: certData.grade,
			completionDate: certData.completionDate,
		},
	};

	const verificationHash = generateFullHash(blockPayload);

	return {
		verificationHash,
		previousHash,
		timestamp,
		nonce,
		blockIndex,
	};
}

/**
 * Verify a certificate hash against its stored data.
 * Returns true if the hash is valid (data has not been tampered with).
 *
 * @param {string} storedHash - The hash stored in DB / printed on certificate
 * @param {object} data       - The current certificate data to verify against
 * @returns {boolean}
 */
export function verifyCertificateHash(storedHash, data) {
	if (!storedHash || !data) return false;

	const recomputed = generateVerificationHash(data);
	return recomputed === storedHash;
}

/**
 * Generate a secure public share token for transcripts.
 * 32 bytes of cryptographic randomness = 64 hex chars.
 *
 * @returns {string}
 */
export function generateShareToken() {
	return crypto.randomBytes(32).toString("hex");
}
