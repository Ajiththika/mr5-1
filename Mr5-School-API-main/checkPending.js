import mongoose from "mongoose";
import User from "./src/models/User.js";
import RegistrationRequest from "./src/models/RegistrationRequest.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const checkPending = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("  MongoDB Connected");

        // Check for pending users
        const pendingUsers = await User.find({
            status: "pending"
        }).select("name email role status createdAt");

        console.log(`Found ${pendingUsers.length} pending users:`);
        pendingUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.createdAt}`);
        });

        // Check for pending registration requests
        const pendingRequests = await RegistrationRequest.find({
            status: "pending"
        }).populate("userId", "name email");

        console.log(`\nFound ${pendingRequests.length} pending registration requests:`);
        pendingRequests.forEach((request, index) => {
            console.log(`${index + 1}. ${request.userId?.name || 'Unknown'} (${request.userId?.email || 'Unknown'}) - ${request.type} - ${request.submittedAt}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error checking pending items:", error);
        process.exit(1);
    }
};

checkPending();