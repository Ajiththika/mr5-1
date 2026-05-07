import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log(" MongoDB Connected");

        const users = [
            {
                name: "Admin User",
                email: "admin@mr5school.com",
                password: "Admin@123456",
                role: "admin",
                status: "approved",
                isActive: true,
            },

            {
                name: "Student User",
                email: "student@mr5school.com",
                password: "Student@123456",
                role: "student",
                status: "approved",
                isActive: true,
            }
        ];

        for (const userData of users) {
            let user = await User.findOne({ email: userData.email });

            if (user) {
                console.log(`  ${userData.role} already exists. Updating password...`);
                user.password = userData.password;
                user.name = userData.name;
                user.status = userData.status;
                user.isActive = userData.isActive;
                await user.save();
                console.log(` ${userData.role} password updated.`);
            } else {
                await User.create(userData);
                console.log(` ${userData.role} created successfully!`);
            }
        }

        console.log("\nLOGIN CREDENTIALS:");
        console.log("------------------");
        users.forEach(u => {
            console.log(`${u.role.toUpperCase()}: ${u.email} / ${u.password}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error seeding users:", error);
        process.exit(1);
    }
};

seedUsers();
