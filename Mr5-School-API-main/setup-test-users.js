import mongoose from "mongoose";
import User from "./src/models/User.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const setupTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // 1. Setup Admin
        const adminEmail = "admin@test.local";
        const adminPass = "AdminPass123!";
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            admin.password = adminPass;
            admin.role = "admin";
            admin.status = "approved";
            admin.isActive = true;
            await admin.save();
            console.log("Admin updated");
        } else {
            await User.create({
                name: "Test Admin",
                email: adminEmail,
                password: adminPass,
                role: "admin",
                status: "approved",
                isActive: true
            });
            console.log("Admin created");
        }

        // 2. Setup Student
        const studentEmail = "student@test.local";
        const studentPass = "StudentPass123!";
        let student = await User.findOne({ email: studentEmail });

        if (student) {
            student.password = studentPass;
            student.role = "student";
            student.status = "approved";
            student.isActive = true;
            await student.save();
            console.log("Student updated");
        } else {
            await User.create({
                name: "Test Student",
                email: studentEmail,
                password: studentPass,
                role: "student",
                status: "approved",
                isActive: true
            });
            console.log("Student created");
        }

        // 3. Setup Course X
        let course = await import("./src/models/Course.js").then(m => m.default.findOne({ title: "Course X" }));

        if (!course) {
            const Course = (await import("./src/models/Course.js")).default;
            await Course.create({
                title: "Course X",
                description: "Test Course for E2E",
                category: "Testing",
                teacher: admin._id,
                price: 10,
                isApproved: true,
                language: "English"
            });
            console.log("Course X created");
        } else {
            console.log("Course X already exists");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error setting up users:", error);
        process.exit(1);
    }
};

setupTestUsers();
