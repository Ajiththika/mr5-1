
import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

async function checkUser(email) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("  MongoDB Connected");

        const User = mongoose.model("User", new mongoose.Schema({
            email: String,
            name: String,
            role: String,
            status: String,
            isActive: Boolean
        }), "users");

        const user = await User.findOne({ email });
        if (user) {
            console.log("User found:");
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log("User not found: " + email);
            const allUsers = await User.find({}, { email: 1 }).limit(10);
            console.log("Other users in DB:", allUsers.map(u => u.email));
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

const emailToCheck = process.argv[2] || "ushanthamr@gmail.com";
checkUser(emailToCheck);
