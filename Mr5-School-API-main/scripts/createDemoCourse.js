import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "../src/config/db.js";
import Course from "../src/models/Course.js";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

// Demo course data
const demoCourseData = {
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start their journey in web development.",
    category: "Programming",
    level: "Beginner",
    price: 0, // Free course
    language: "English",
    isApproved: true,
    thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=400&fit=crop"
};

/**
 * Create a demo course in the database
 */
async function createDemoCourse() {
    try {
        console.log("🌱 Starting demo course creation...\n");

        // Connect to database
        await connectDB();
        console.log("  Connected to database\n");

        // Find or create a default admin/AI-TEACHER user
        let teacher = await User.findOne({ role: { $in: ["AI-TEACHER", "admin"] } });

        if (!teacher) {
            console.log("👤 No teacher user found. Creating default teacher...");
            teacher = await User.create({
                name: "Demo Instructor",
                email: "demo@instructor.com",
                password: "Demo@123",
                role: "admin",
                isActive: true,
            });
            console.log("  Created default teacher user\n");
        } else {
            console.log(`👤 Using existing teacher: ${teacher.name}\n`);
        }

        // Check if demo course already exists
        let existingCourse = await Course.findOne({ title: demoCourseData.title });

        if (existingCourse) {
            console.log("🔄 Demo course already exists. Updating...");
            // Update existing course
            Object.assign(existingCourse, {
                ...demoCourseData,
                teacher: teacher._id
            });
            await existingCourse.save();
            console.log("  Updated existing demo course\n");
        } else {
            // Create new demo course
            const courseData = {
                ...demoCourseData,
                teacher: teacher._id
            };
            await Course.create(courseData);
            console.log("  Created new demo course\n");
        }

        // Display course details
        const finalCourse = await Course.findOne({ title: demoCourseData.title }).populate('teacher', 'name');
        console.log("📋 Course Details:");
        console.log("━".repeat(50));
        console.log(`Title:       ${finalCourse.title}`);
        console.log(`Description: ${finalCourse.description}`);
        console.log(`Category:    ${finalCourse.category}`);
        console.log(`Level:       ${finalCourse.level}`);
        console.log(`Price:       $${finalCourse.price}`);
        console.log(`Language:    ${finalCourse.language}`);
        console.log(`Teacher:     ${finalCourse.teacher.name}`);
        console.log(`Approved:    ${finalCourse.isApproved ? 'Yes' : 'No'}`);
        console.log("━".repeat(50));

        console.log("\n🎉 Demo course creation completed!");
        process.exit(0);
    } catch (error) {
        console.error("💥 Error creating demo course:", error);
        process.exit(1);
    }
}

// Run the function
createDemoCourse();