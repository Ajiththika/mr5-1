import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./src/config/db.js";
import { ensureIdentityForUser } from "./src/services/identityService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const users = [
	{
		name: "Admin User",
		email: "admin@mr5school.com",
		password: "Admin@123456",
		role: "admin",
		status: "approved",
		isActive: true,
		onboardingCompleted: true,
	},
	{
		name: "Alex Rivera",
		email: "student@mr5school.com",
		password: "Student@123456",
		role: "student",
		status: "approved",
		isActive: true,
		avatarPreset: "cadet-blue",
		onboardingCompleted: true,
	},
	{
		name: "New Student",
		email: "onboard@mr5school.com",
		password: "Onboard@123456",
		role: "student",
		status: "approved",
		isActive: true,
		onboardingCompleted: false,
	},
];

const seedUsers = async () => {
	try {
		await connectDB();
		console.log("MongoDB connected for seeding");

		for (const userData of users) {
			let user = await User.findOne({ email: userData.email });

			if (user) {
				console.log(`  ${userData.role} already exists. Updating...`);
				user.password = userData.password;
				user.name = userData.name;
				user.status = userData.status;
				user.isActive = userData.isActive;
				if (typeof userData.onboardingCompleted === "boolean") {
					user.onboardingCompleted = userData.onboardingCompleted;
				}
				if (userData.avatarPreset) user.avatarPreset = userData.avatarPreset;
				await user.save();
			} else {
				user = await User.create(userData);
				console.log(`  ${userData.role} created successfully`);
			}

			await ensureIdentityForUser(user);
			console.log(`  UID: ${user.mr5Uid}`);
		}

		console.log("\nLOGIN CREDENTIALS:");
		console.log("------------------");
		for (const u of users) {
			console.log(`${u.role.toUpperCase()}: ${u.email} / ${u.password}`);
		}

		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error("Error seeding users:", error);
		await mongoose.connection.close().catch(() => {});
		process.exit(1);
	}
};

seedUsers();
