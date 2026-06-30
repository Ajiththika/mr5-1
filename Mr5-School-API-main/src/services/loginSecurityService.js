import crypto from "crypto";
import bcrypt from "bcryptjs";
import LoginAttempt from "../models/LoginAttempt.js";
import User from "../models/User.js";
import {
	INVALID_CREDENTIALS_MESSAGE,
	TOO_MANY_ATTEMPTS_MESSAGE,
} from "../constants/authMessages.js";

const DUMMY_BCRYPT_HASH = bcrypt.hashSync("__mr5_constant_time_dummy__", 10);
const AUTH_TARGET_MS = 1000;
const AUTH_JITTER_MS = 50;

function hashIdentifier(email, ipAddress) {
	const normalized = `${String(email).trim().toLowerCase()}|${ipAddress || "unknown"}`;
	return crypto.createHash("sha256").update(normalized).digest("hex");
}

function cooldownMs(failureCount) {
	if (failureCount >= 25) return null;
	if (failureCount >= 20) return 15 * 60 * 1000;
	if (failureCount >= 15) return 5 * 60 * 1000;
	if (failureCount >= 10) return 60 * 1000;
	if (failureCount >= 5) return 30 * 1000;
	return 0;
}

async function normalizeTiming(startMs) {
	const elapsed = Date.now() - startMs;
	const jitter = Math.floor(Math.random() * AUTH_JITTER_MS * 2) - AUTH_JITTER_MS;
	const target = AUTH_TARGET_MS + jitter;
	const wait = Math.max(0, target - elapsed);
	if (wait > 0) {
		await new Promise((resolve) => setTimeout(resolve, wait));
	}
}

async function getAttemptRecord(identifierHash) {
	return LoginAttempt.findOne({ identifierHash });
}

export async function checkLoginLockout(email, ipAddress) {
	const identifierHash = hashIdentifier(email, ipAddress);
	const record = await getAttemptRecord(identifierHash);
	if (!record) return { locked: false, identifierHash };

	if (record.lockedUntil && record.lockedUntil > new Date()) {
		return { locked: true, identifierHash, message: TOO_MANY_ATTEMPTS_MESSAGE };
	}

	if (record.lastFailureAt && record.failureCount >= 5) {
		const waitMs = cooldownMs(record.failureCount);
		if (waitMs === null) {
			const lockUntil = new Date(Date.now() + 60 * 60 * 1000);
			record.lockedUntil = lockUntil;
			await record.save();
			return { locked: true, identifierHash, message: TOO_MANY_ATTEMPTS_MESSAGE };
		}
		const unlockAt = new Date(record.lastFailureAt.getTime() + waitMs);
		if (unlockAt > new Date()) {
			return { locked: true, identifierHash, message: TOO_MANY_ATTEMPTS_MESSAGE };
		}
	}

	return { locked: false, identifierHash, record };
}

export async function recordLoginFailure(identifierHash) {
	const record =
		(await LoginAttempt.findOne({ identifierHash })) ||
		(await LoginAttempt.create({ identifierHash, failureCount: 0 }));

	record.failureCount += 1;
	record.lastFailureAt = new Date();

	const waitMs = cooldownMs(record.failureCount);
	if (record.failureCount >= 25 && waitMs === null) {
		record.lockedUntil = new Date(Date.now() + 60 * 60 * 1000);
	}

	await record.save();
}

export async function clearLoginFailures(identifierHash) {
	await LoginAttempt.deleteOne({ identifierHash });
}

/**
 * Constant-time credential verification.
 * Always runs bcrypt.compare against a real hash (user or dummy).
 */
export async function verifyCredentialsSecurely(email, password) {
	const startMs = Date.now();

	try {
		const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
			"+password",
		);

		const hashToCompare = user?.password || DUMMY_BCRYPT_HASH;
		const passwordMatches = await bcrypt.compare(password, hashToCompare);

		let accountEligible = false;
		if (user && passwordMatches) {
			accountEligible =
				user.isActive !== false &&
				user.status !== "pending" &&
				user.status !== "rejected";
		}

		await normalizeTiming(startMs);

		if (!user || !passwordMatches || !accountEligible) {
			const err = new Error(INVALID_CREDENTIALS_MESSAGE);
			err.statusCode = 401;
			err.code = "AUTH_FAILED";
			throw err;
		}

		return user;
	} catch (error) {
		if (error.code === "AUTH_FAILED") throw error;
		await normalizeTiming(startMs);
		const err = new Error(INVALID_CREDENTIALS_MESSAGE);
		err.statusCode = 401;
		err.code = "AUTH_FAILED";
		throw err;
	}
}
