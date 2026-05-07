import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';
import Lesson from '../src/models/Lesson.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function finalSeed() {
    try {
        await connectDB();
        console.log("✅ Database Connected for Final Seeding");

        // 1. Cleanup
        await User.deleteMany({ email: { $in: ["admin@mr5.com", "teacher@mr5.com"] } });
        await Course.deleteMany({});
        await Lesson.deleteMany({});
        console.log("🧹 Cleaned up existing data");

        // 2. Create Users
        const admin = await User.create({
            name: "MR5 Admin",
            email: "admin@mr5.com",
            password: "Password123",
            role: "admin",
            isActive: true,
            status: "approved"
        });
        console.log("👤 Created Admin");

        const teacher = await User.create({
            name: "Professor Nova",
            email: "teacher@mr5.com",
            password: "Password123",
            role: "AI-TEACHER",
            isActive: true,
            status: "approved"
        });
        console.log("👩‍🏫 Created Teacher");
        const student = await User.create({
            name: "Demo Student",
            email: "guest@mr5.com",
            password: "Password123",
            role: "student",
            isActive: true,
            status: "approved"
        });
        console.log("🎓 Created Demo Student");

        // 3. Create High-Quality Courses
        const courses = [
            {
                title: "Introduction to Metaverse Physics",
                description: "Master the fundamental forces of digital worlds. Learn how gravity, collisions, and light interact in the 3D web.",
                category: "Science",
                level: "Beginner",
                price: 49.99,
                teacher: teacher._id,
                thumbnail: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800",
                language: "English",
                isApproved: true
            },
            {
                title: "Generative AI for 3D Artists",
                description: "Leverage the power of Neural Networks to generate high-fidelity 3D assets, textures, and environments.",
                category: "Art",
                level: "Advanced",
                price: 199.99,
                teacher: teacher._id,
                thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
                language: "English",
                isApproved: true
            }
        ];

        const createdCourses = await Course.insertMany(courses);
        console.log(`📚 Created ${createdCourses.length} Courses`);

        // 4. Seed Detailed Lessons for RAG (AI Tutor Context)
        const lessons = [
            {
                course: createdCourses[0]._id,
                title: "The Simulated Gravity Vector",
                content: "In virtual environments, gravity is typically represented as a constant acceleration vector. For realism, MR5 School uses the Y-axis as the vertical vector. A gravity value of -9.81 m/s² simulates Earth-like conditions. However, in low-poly metaverse zones, we often reduce this to -5.0 to allow for 'floaty' parkour movements which feel more satisfying to players.",
                duration: 15,
                order: 1
            },
            {
                course: createdCourses[0]._id,
                title: "Collision Mechanics",
                content: "Collisions in the metaverse are calculated using Bounding Boxes (AABB) or Mesh Colliders. For performance, always prefer AABB. The physics engine checks for overlaps between two geometries every frame. MR5 School's core utilizes @react-three/rapier for real-time deterministic physics.",
                duration: 20,
                order: 2
            },
            {
                course: createdCourses[1]._id,
                title: "Latent Diffusion for Texturing",
                content: "Latent Diffusion Models (LDM) can be used to generate seamless 4K textures from text prompts. By projecting a 2D noise vector onto a 3D UV map, we can achieve high-fidelity skin, metal, and fabric finishes without manual painting. MR5 students use the Stable Diffusion API to automate this workflow.",
                duration: 25,
                order: 1
            }
        ];

        await Lesson.insertMany(lessons);
        console.log(`📖 Created ${lessons.length} Lessons with RAG context`);

        console.log("\n🚀 FINAL SEEDING COMPLETE!");
        console.log("--------------------------------------------------");
        console.log("Admin Email: admin@mr5.com");
        console.log("Teacher Email: teacher@mr5.com");
        console.log("Password: Password123");
        console.log("--------------------------------------------------");

        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Failed:", err);
        process.exit(1);
    }
}

finalSeed();
