import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "./src/models/Course.js";
import User from "./src/models/User.js";

dotenv.config();

const categories = [
    "Programming", "Business", "Design", "Marketing",
    "Personal Development", "Photography", "Music", "Aviation"
];

const levels = ["Beginner", "Intermediate", "Advanced"];
const languages = ["English", "Tamil", "Sinhala"];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        const admin = await User.findOne({ role: "admin" });
        if (!admin) {
            console.error("Admin user not found. Please run seedAdmin.js first.");
            process.exit(1);
        }

        console.log("Found Admin:", admin.email);

        // Delete existing courses to avoid duplicates if preferred, 
        // or just add more. Let's add more to reach 100.
        const currentCount = await Course.countDocuments();
        const target = 100;
        const toCreate = Math.max(0, target - currentCount);

        if (toCreate === 0) {
            console.log("Already have 100 or more courses.");
            process.exit(0);
        }

        console.log(`Creating ${toCreate} courses...`);

        const courses = [];
        for (let i = 1; i <= toCreate; i++) {
            const courseNum = currentCount + i;
            courses.push({
                title: `Premium Course ${courseNum}: ${categories[i % categories.length]} Mastery`,
                description: `This is a comprehensive guide to mastering ${categories[i % categories.length]}. 
                Unlock your potential with course number ${courseNum} in our premium series. 
                Learn advanced techniques, industry standards, and practical applications in this deep-dive curriculum.`,
                category: categories[i % categories.length],
                teacher: admin._id,
                level: levels[i % levels.length],
                price: Math.floor(Math.random() * 100) + 19.99,
                language: languages[i % languages.length],
                isApproved: true,
                thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=800&q=80`,
                tags: ["premium", categories[i % categories.length].toLowerCase(), "pro"],
                prerequisites: ["Basic knowledge", "Interest in " + categories[i % categories.length]]
            });
        }

        await Course.insertMany(courses);
        console.log(`Successfully seeded ${toCreate} new courses!`);
        console.log(`Total courses now: ${await Course.countDocuments()}`);

        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seed();
