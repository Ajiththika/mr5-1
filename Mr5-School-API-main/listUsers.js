import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = mongoose.model("User", new mongoose.Schema({ email: String, role: String, name: String }));
        const users = await User.find({}, "email role name");
        console.log(JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
