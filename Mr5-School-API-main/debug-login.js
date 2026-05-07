import mongoose from "mongoose";
import dotenv from "dotenv";
import { loginUser } from "./src/services/authService.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const result = await loginUser("student@test.local", "StudentPass123!", "127.0.0.1", "TestBot");
        console.log("Login Success!", result.user.email);
        process.exit(0);
    } catch (e) {
        console.error("Login Failed!", e);
        process.exit(1);
    }
};

run();
