import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "../models/User.js";
import AITeacher from "../models/AI-TEACHER.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

async function createAvatarAI() {
	try {
		if (!process.env.MONGO_URI) {
			throw new Error("MONGO_URI not set in Server/.env");
		}

		await mongoose.connect(process.env.MONGO_URI);
		console.log("MongoDB connected for Avatar AI creation");

		const email = "avatar@ai.mr5school";
		const existing = await User.findOne({ email });
		if (existing) {
			console.log("Avatar AI user already exists:", email);
			process.exit(0);
		}

		const password = "AvatarAI#2025";
		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt);

		const user = await User.create({
			name: "Avatar AI",
			email,
			password: hashed,
			role: "AI-TEACHER",
			status: "approved",
		});

		const aiTeacher = await AITeacher.create({
			user: user._id,
			specialization: "AI Teaching Assistant",
			bio: "Avatar AI automated AI-TEACHER",
			isAvatarAI: true,
			approvedAt: new Date(),
			approvedBy: "system",
		});

		console.log("  Created Avatar AI user and AI-TEACHER:");
		console.log("   email:", email);
		console.log("   password:", password);
		console.log("   userId:", user._id.toString());
		console.log("   AI-TEACHERId:", aiTeacher._id.toString());

		process.exit(0);
	} catch (err) {
		console.error("Error creating Avatar AI:", err);
		process.exit(1);
	}
}

createAvatarAI();
