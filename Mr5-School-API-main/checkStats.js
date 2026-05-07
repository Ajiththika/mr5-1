import mongoose from "mongoose";
import User from "./src/models/User.js";
import Course from "./src/models/Course.js";
import Enrollment from "./src/models/Enrollment.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, ".env") });

const checkStats = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("  MongoDB Connected");

        // Get statistics
        const [
            totalStudents,
            totalAITeachers,
            totalCourses,
            totalEnrollments,
            recentEnrollments
        ] = await Promise.all([
            User.countDocuments({ role: "student", status: "approved" }),
            User.countDocuments({ role: "AI-TEACHER", status: "approved" }),
            Course.countDocuments({ isApproved: true }),
            Enrollment.countDocuments(),
            Enrollment.countDocuments({
                enrolledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            })
        ]);

        console.log("Platform Statistics:");
        console.log("===================");
        console.log(`Total Students: ${totalStudents}`);
        console.log(`Total AI-TEACHERs: ${totalAITeachers}`);
        console.log(`Active Courses: ${totalCourses}`);
        console.log(`Total Enrollments: ${totalEnrollments}`);
        console.log(`Recent Enrollments (30 days): ${recentEnrollments}`);

        // Get recent activity (last 5 enrollments)
        const recentActivity = await Enrollment.find()
            .sort({ enrolledAt: -1 })
            .limit(5)
            .populate("userId", "name")
            .populate("courseId", "title");

        console.log("\nRecent Activity:");
        console.log("================");
        recentActivity.forEach((enrollment, index) => {
            console.log(`${index + 1}. ${enrollment.userId?.name || 'Unknown User'} enrolled in "${enrollment.courseId?.title || 'Unknown Course'}" on ${enrollment.enrolledAt.toLocaleDateString()}`);
        });

        // Get top courses by enrollment
        const topCourses = await Enrollment.aggregate([
            {
                $group: {
                    _id: "$courseId",
                    enrollmentCount: { $sum: 1 }
                }
            },
            {
                $sort: { enrollmentCount: -1 }
            },
            {
                $limit: 5
            }
        ]).exec();

        // Populate course details
        const courseIds = topCourses.map(item => item._id);
        const courses = await Course.find({ _id: { $in: courseIds } }).select("title");

        console.log("\nTop Courses:");
        console.log("============");
        topCourses.forEach((item, index) => {
            const course = courses.find(c => c._id.toString() === item._id.toString());
            console.log(`${index + 1}. "${course?.title || 'Unknown Course'}" - ${item.enrollmentCount} enrollments`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error checking stats:", error);
        process.exit(1);
    }
};

checkStats();