import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const checkUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("  MongoDB Connected");

        // Check the admin user
        const admin = await User.findOne({ email: "admin@mr5school.com" });
        
        if (admin) {
            console.log("User found:");
            console.log("ID:", admin._id);
            console.log("Name:", admin.name);
            console.log("Email:", admin.email);
            console.log("Role:", admin.role);
            console.log("Status:", admin.status);
            console.log("isActive:", admin.isActive);
        } else {
            console.log("❌ Admin user not found");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error checking user:", error);
        process.exit(1);
    }
};

checkUser();