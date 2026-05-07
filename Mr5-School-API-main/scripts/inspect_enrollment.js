import mongoose from "mongoose";
import Enrollment from "../src/models/Enrollment.js";
import Course from "../src/models/Course.js";
import User from "../src/models/User.js"; // Needed for ref population
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const enrollments = await Enrollment.find({}).populate('course');
        console.log(`Found ${enrollments.length} enrollments`);

        enrollments.forEach(e => {
            console.log("Enrollment:");
            console.log("  ID:", e._id);
            console.log("  Student:", e.student);
            console.log("  Course ID:", e.course?._id);
            console.log("  Course Title:", e.course?.title);
            console.log("  Course populated?", !!e.course);
            if (!e.course) console.log("  WARNING: Course not populated/found!");
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
