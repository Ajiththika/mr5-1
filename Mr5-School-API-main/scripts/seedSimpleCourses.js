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

// Course data with manual descriptions
const coursesData = [
    {
        title: "Course X",
        description: "Test Course for E2E Testing",
        category: "Programming",
        level: "Beginner",
        price: 0,
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop"
    },
    {
        title: "Full-Stack Web Development",
        description: "Master the art of building modern web applications from front-end to back-end. Learn React, Node.js, Express, MongoDB, and more.",
        category: "Programming",
        level: "Intermediate",
        price: 999,
        thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop"
    },
    {
        title: "Cybersecurity Fundamentals",
        description: "Learn the essential skills to protect systems and networks from cyber threats. Cover topics like encryption, network security, and ethical hacking.",
        category: "Security",
        level: "Beginner",
        price: 899,
        thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop"
    },
    {
        title: "UI/UX Design Masterclass",
        description: "Create stunning user interfaces and exceptional user experiences. Learn Figma, design principles, prototyping, and user research.",
        category: "Design",
        level: "Intermediate",
        price: 999,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop"
    },
    {
        title: "Ms Office Professional",
        description: "Become proficient in Microsoft Office Suite. Master Word, Excel, PowerPoint, and Outlook for professional productivity.",
        category: "Office Skills",
        level: "Beginner",
        price: 299,
        thumbnail: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=400&fit=crop"
    },
    {
        title: "Machine Learning Fundamentals",
        description: "Dive into the world of AI and machine learning. Learn Python, scikit-learn, neural networks, and deep learning basics.",
        category: "Artificial Intelligence",
        level: "Advanced",
        price: 999,
        thumbnail: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=400&fit=crop"
    },
    {
        title: "ChatGPT & Prompt Engineering",
        description: "Unlock the power of AI language models. Learn effective prompt engineering techniques to get the best results from ChatGPT and similar tools.",
        category: "Artificial Intelligence",
        level: "Beginner",
        price: 199,
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop"
    },
    {
        title: "Motion Graphics with After Effects",
        description: "Create stunning animations and motion graphics. Learn Adobe After Effects from basics to advanced techniques.",
        category: "Design",
        level: "Intermediate",
        price: 799,
        thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=400&fit=crop"
    },
    {
        title: "Logo Design Principles",
        description: "Design memorable and impactful logos. Learn design theory, typography, color psychology, and industry best practices.",
        category: "Design",
        level: "Beginner",
        price: 499,
        thumbnail: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=400&fit=crop"
    },
    {
        title: "3D Design with Blender",
        description: "Create stunning 3D models and animations. Master Blender, the industry-leading open-source 3D creation suite.",
        category: "Design",
        level: "Intermediate",
        price: 599,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop"
    },
    {
        title: "Cloud DevOps Engineering",
        description: "Build, deploy, and manage applications in the cloud. Learn Docker, Kubernetes, CI/CD, AWS, and modern DevOps practices.",
        category: "Cloud Computing",
        level: "Advanced",
        price: 699,
        thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop"
    },
    {
        title: "Video Editing Mastery",
        description: "Create professional videos with industry-standard editing techniques. Learn premiere pro, color grading, and storytelling through video.",
        category: "Media",
        level: "Intermediate",
        price: 399,
        thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=400&fit=crop"
    },
    {
        title: "Python Programming",
        description: "Learn Python from scratch to advanced concepts. Build real-world projects and understand programming fundamentals.",
        category: "Programming",
        level: "Beginner",
        price: 0,
        thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop"
    }
];

/**
 * Seed courses into the database
 */
async function seedSimpleCourses() {
    try {
        console.log("🌱 Starting course seeding process...\n");

        // Connect to database
        await connectDB();
        console.log("  Connected to database\n");

        // Find or create a default admin/AI-TEACHER user
        let aiTeacher = await User.findOne({ role: { $in: ["AI-TEACHER", "admin"] } });

        if (!aiTeacher) {
            console.log("👤 No AI-TEACHER/admin user found. Creating default AI-TEACHER...");
            aiTeacher = await User.create({
                name: "Course Administrator",
                email: "admin@courses.com",
                password: "Admin@123",
                role: "admin",
                isActive: true,
            });
            console.log("  Created default AI-TEACHER/admin user\n");
        } else {
            console.log(`👤 Using existing AI-TEACHER: ${aiTeacher.name}\n`);
        }

        // Clear existing courses
        const deleteResult = await Course.deleteMany({});
        console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing courses\n`);

        // Process each course
        const results = {
            created: 0,
            errors: [],
        };

        for (let i = 0; i < coursesData.length; i++) {
            const courseInfo = coursesData[i];
            const courseNumber = i + 1;

            try {
                console.log(`[${courseNumber}/${coursesData.length}] Creating: ${courseInfo.title}...`);

                // Prepare course data
                const courseData = {
                    title: courseInfo.title,
                    description: courseInfo.description,
                    category: courseInfo.category,
                    level: courseInfo.level,
                    price: courseInfo.price,
                    teacher: aiTeacher._id, // Fixed: was AITeacher
                    language: "English",
                    isApproved: true,
                    thumbnail: courseInfo.thumbnail,
                };

                // Create new course
                await Course.create(courseData);
                results.created++;
                console.log(`      Created - Price: $${courseInfo.price} - Level: ${courseInfo.level}\n`);

            } catch (error) {
                console.error(`    ❌ Error processing "${courseInfo.title}":`, error.message);
                results.errors.push({ course: courseInfo.title, error: error.message });
            }
        }

        // Print summary
        console.log("\n" + "=".repeat(60));
        console.log("📊 SEEDING SUMMARY");
        console.log("=".repeat(60));
        console.log(`  Created: ${results.created} courses`);

        if (results.errors.length > 0) {
            console.log(`\n❌ Errors encountered:`);
            results.errors.forEach((err) => {
                console.log(`   - ${err.course}: ${err.error}`);
            });
        }

        console.log("\n🎉 Course seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("💥 Fatal error during seeding:", error);
        process.exit(1);
    }
}

// Run the seed function
seedSimpleCourses();
