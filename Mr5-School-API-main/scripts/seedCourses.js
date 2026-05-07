import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "../src/config/db.js";
import Course from "../src/models/Course.js";
import User from "../src/models/User.js";
import { generateCourseDetails } from "../src/utils/geminiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

// Course data with prices (in Rupees)
const coursesData = [
	{ title: "Full-Stack", price: 999 },
	{ title: "Cybersecurity Fundamentals", price: 899 },
	{ title: "UI/UX Design Masterclass", price: 999 },
	{ title: "Ms Office", price: 299 },
	{ title: "Network Security & Firewalls", price: 599 },
	{ title: "ChatGPT & Prompt Engineering", price: 199 },
	{ title: "Motion Graphics with After Effects", price: 799 },
	{ title: "Logo Design Principles", price: 499 },
	{ title: "Branding & Visual Identity", price: 699 },
	{ title: "Resume Building & Interview Prep", price: 199 },
	{ title: "Editing", price: 399 },
	{ title: "Canva Design for Beginners", price: 299 },
	{ title: "3D Design with Blender", price: 599 },
	{ title: "Animation Fundamentals", price: 499 },
	{ title: "Typography & Color Theory", price: 799 },
	{ title: "Portfolio Building for Designers", price: 299 },
	{ title: "Machine Learning Fundamentals", price: 999 },
	{ title: "Artificial Intelligence (Theory)", price: 899 },
	{ title: "Time Management", price: 199 },
	{ title: "Cloud DevOps Engineering", price: 699 },
	{ title: "No-Code App Development", price: 699 },
	{ title: "Automation with n8n & Zapier", price: 799 },
	{ title: "Cyber Law & Privacy", price: 599 },
	{ title: "Communication & Presentation Skills", price: 399 },
	{ title: "LLM", price: 499 },
	{ title: "Subscription 24/7/S", price: 9999 },
	{ title: "Subscription 24/30/C", price: 19999 },
	{ title: "Subscription 24/60/B", price: 39999 },
	{
		title: "Subscription 24/90/VIP ff/first priority New features",
		price: 99999,
	},
	{ title: "Business Enterprise", price: 14999 },
	{ title: "Kids Learning", price: 499 },
];

/**
 * Seed courses into the database
 */
async function seedCourses() {
	try {
		console.log(" Starting course seeding process...\n");

		// Connect to database
		await connectDB();
		console.log(" Connected to database\n");


		// Find or create a default admin/AI-TEACHER user
		let aiTeacher = await User.findOne({ role: { $in: ["AI-TEACHER", "admin"] } });

		if (!aiTeacher) {
			console.log("  No AI-TEACHER/admin user found. Creating default AI-TEACHER...");
			aiTeacher = await User.create({
				name: "Course Administrator",
				email: "admin@courses.com",
				password: "Admin@123",
				role: "admin",
				isActive: true,
			});
			console.log(" Created default AI-TEACHER/admin user\n");
		} else {
			console.log(` Using existing AI-TEACHER: ${aiTeacher.name}\n`);
		}

		// Process each course
		const results = {
			created: 0,
			updated: 0,
			skipped: 0,
			errors: [],
		};

		for (let i = 0; i < coursesData.length; i++) {
			const courseInfo = coursesData[i];
			const courseNumber = i + 1;

			try {
				console.log(
					`[${courseNumber}/${coursesData.length}] Processing: ${courseInfo.title}...`,
				);

				// Check if course already exists
				let existingCourse = await Course.findOne({ title: courseInfo.title });

				// Generate course details using Gemini API
				console.log(`    Generating course details...`);
				const courseDetails = await generateCourseDetails(courseInfo.title);

				// Prepare course data
				const courseData = {
					title: courseInfo.title,
					description: courseDetails.description,
					category: courseDetails.category,
					level: courseDetails.level,
					price: courseInfo.price,
					teacher: aiTeacher._id, // Fixed: was AITeacher
					language: "English",
					isApproved: true,
				};

				if (existingCourse) {
					// Update existing course
					Object.assign(existingCourse, courseData);
					await existingCourse.save();
					results.updated++;
					console.log(`    Updated existing course`);
				} else {
					// Create new course
					await Course.create(courseData);
					results.created++;
					console.log(`    Created new course`);
				}

				console.log(`    Price: Rs${courseInfo.price.toLocaleString()}`);
				console.log(`    Category: ${courseDetails.category}`);
				console.log(`    Level: ${courseDetails.level}\n`);

				// Small delay to avoid rate limiting
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (error) {
				console.error(
					`    Error processing "${courseInfo.title}":`,
					error.message,
				);
				results.errors.push({ course: courseInfo.title, error: error.message });
				results.skipped++;
			}
		}

		// Print summary
		console.log("\n" + "=".repeat(60));
		console.log(" SEEDING SUMMARY");
		console.log("=".repeat(60));
		console.log(` Created: ${results.created} courses`);
		console.log(` Updated: ${results.updated} courses`);
		console.log(`  Skipped: ${results.skipped} courses`);

		if (results.errors.length > 0) {
			console.log(`\n Errors encountered:`);
			results.errors.forEach((err) => {
				console.log(`   - ${err.course}: ${err.error}`);
			});
		}

		console.log("\n Course seeding completed!");
		process.exit(0);
	} catch (error) {
		console.error(" Fatal error during seeding:", error);
		process.exit(1);
	}
}

// Run the seed function
seedCourses();
