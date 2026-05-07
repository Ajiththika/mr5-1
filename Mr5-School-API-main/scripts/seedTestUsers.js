import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const testUsers = [
	{
		name: "Admin User",
		email: "admin@mr5school.com",
		password: "Admin@123456",
		role: "admin",
		status: "approved",
	},
	{
		name: "Test Admin",
		email: "admin@test.local",
		password: "AdminPass123!",
		role: "admin",
		status: "approved",
	},
	{
		name: "Test Student",
		email: "student@test.local",
		password: "StudentPass123!",
		role: "student",
		status: "approved",
	},
	{
		name: "Test Student 2",
		email: "student@test.com",
		password: "student123",
		role: "student",
		status: "approved",
	},
	{
		name: "Test AI-TEACHER",
		email: "AI-TEACHER@test.com",
		password: "AI-TEACHER123",
		role: "AI-TEACHER",
		status: "approved",
	},
	{
		name: "Second Student",
		email: "student2@test.com",
		password: "student123",
		role: "student",
		status: "approved",
	},
];

async function seedTestUsers() {
	try {
		if (!process.env.MONGO_URI) {
			console.error("MONGO_URI is not defined in .env");
			process.exit(1);
		}
		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB Connected for seeding...");

		// Clear existing test users
		await User.deleteMany({ email: { $in: testUsers.map((u) => u.email) } });
		console.log("Cleared existing test users");

		// Create test users
		for (const userData of testUsers) {
			const user = await User.create({
				...userData,
			});

			console.log(`  Created ${userData.role}: ${userData.email}`);
		}

		console.log("\n🎉 All test users created successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding test users:", error);
		process.exit(1);
	}
}

seedTestUsers();
