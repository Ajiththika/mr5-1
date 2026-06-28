/**
 * Backfill MR5 UIDs and identity records for existing users.
 * Usage: node scripts/backfillMr5Uids.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import { ensureIdentityForUser } from "../src/services/identityService.js";

dotenv.config();

async function main() {
	await connectDB();
	const users = await User.find({ $or: [{ mr5Uid: null }, { mr5Uid: { $exists: false } }] });
	console.log(`Backfilling ${users.length} users...`);

	for (const user of users) {
		const uid = await ensureIdentityForUser(user);
		console.log(`  ${user.email} -> ${uid}`);
	}

	console.log("Backfill complete.");
	await mongoose.connection.close();
}

main().catch(async (error) => {
	console.error(error);
	await mongoose.connection.close();
	process.exit(1);
});
