import User from "../models/User.js";
import { buildMr5Uid } from "../utils/uidGenerator.js";

/**
 * @param {'student' | 'AI-TEACHER' | 'admin'} role
 */
export async function generateUniqueMr5Uid(role) {
	for (let attempt = 0; attempt < 12; attempt += 1) {
		const candidate = buildMr5Uid(role);
		const exists = await User.exists({ mr5Uid: candidate });
		if (!exists) return candidate;
	}
	throw new Error("Unable to generate a unique MR5 UID");
}

/**
 * @param {import('mongoose').Document} user
 */
export async function ensureUserMr5Uid(user) {
	if (user.mr5Uid) return user.mr5Uid;
	const mr5Uid = await generateUniqueMr5Uid(user.role);
	user.mr5Uid = mr5Uid;
	await user.save();
	return mr5Uid;
}
