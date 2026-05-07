import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const MONGO_URI =
	process.env.MONGO_URI || "mongodb://localhost:27017/mr5school";

const createAdmin = async () => {
	try {
		await mongoose.connect(MONGO_URI);
		console.log("  Connected to MongoDB");

		const User = mongoose.model(
			"User",
			new mongoose.Schema({
				name: String,
				email: String,
				password: String,
				role: String,
				status: String,
				isActive: Boolean,
			}),
		);

		// Check if admin already exists
		const existingAdmin = await User.findOne({ email: "admin@mr5school.com" });
		if (existingAdmin) {
			console.log("⚠️  Admin user already exists!");
			console.log("Email: admin@mr5school.com");
			process.exit(0);
		}

		// Create admin user
		const hashedPassword = await bcrypt.hash("Admin1234!", 10);

		const admin = await User.create({
			name: "Admin User",
			email: "admin@mr5school.com",
			password: hashedPassword,
			role: "admin",
			status: "approved",
			isActive: true,
		});

		console.log("  Admin user created successfully!");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("📧 Email: admin@mr5school.com");
		console.log("🔑 Password: Admin1234!");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("⚠️  Please change the password after first login!");

		process.exit(0);
	} catch (error) {
		console.error("❌ Error creating admin:", error);
		process.exit(1);
	}
};

createAdmin();
