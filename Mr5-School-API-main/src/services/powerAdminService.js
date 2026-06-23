import User from "../models/User.js";
import Teacher from "../models/Teacher.js";
import Course from "../models/Course.js";
import Classroom from "../models/Classroom.js";
import ContentApproval from "../models/ContentApproval.js";
import Enrollment from "../models/Enrollment.js";
import LessonProgress from "../models/LessonProgress.js";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import Lesson from "../models/Lesson.js";
import {
	ROLE_LABELS,
	ROLE_PERMISSIONS,
	ADMIN_ROLES,
} from "../config/adminRoles.js";
import { getRecentActivity } from "./activityLogService.js";
import aiService from "./ai.service.js";

export async function getHubOverview() {
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	const [
		totalTeachers,
		totalCourses,
		totalClassrooms,
		totalStudents,
		publishedCourses,
		draftCourses,
		pendingApprovals,
		activeClassrooms,
		totalEnrollments,
		recentSessions,
	] = await Promise.all([
		Teacher.countDocuments({ status: { $ne: "archived" } }),
		Course.countDocuments(),
		Classroom.countDocuments(),
		User.countDocuments({ role: "student", status: "approved" }),
		Course.countDocuments({ publishStatus: "published" }),
		Course.countDocuments({ publishStatus: "draft" }),
		ContentApproval.countDocuments({ status: "pending_review" }),
		Classroom.countDocuments({ status: "active" }),
		Enrollment.countDocuments(),
		AnalyticsEvent.countDocuments({
			eventType: "classroom_session",
			createdAt: { $gte: thirtyDaysAgo },
		}),
	]);

	const completedLessons = await LessonProgress.countDocuments({
		completedAt: { $exists: true },
	});

	const engagementRate =
		totalStudents > 0
			? Math.round((totalEnrollments / totalStudents) * 100)
			: 0;

	return {
		totalTeachers,
		totalCourses,
		totalClassrooms,
		totalStudents,
		publishedContent: publishedCourses,
		draftContent: draftCourses,
		pendingApprovals,
		activeSessions: recentSessions,
		activeClassrooms,
		totalEnrollments,
		completedLessons,
		engagementRate,
		systemHealth: {
			api: "healthy",
			database: "connected",
			aiService: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? "configured" : "offline",
		},
	};
}

export async function getAnalyticsInsights() {
	const [
		courseStats,
		topCourses,
		quizEvents,
		teacherCount,
		pendingCount,
		publishedCount,
	] = await Promise.all([
		Enrollment.aggregate([
			{
				$group: {
					_id: "$course",
					enrollments: { $sum: 1 },
				},
			},
			{ $sort: { enrollments: -1 } },
			{ $limit: 5 },
		]),
		Course.find({ publishStatus: "published" })
			.select("title category level")
			.limit(5)
			.lean(),
		AnalyticsEvent.countDocuments({ eventType: "quiz_submit" }),
		Teacher.countDocuments({ status: "active" }),
		ContentApproval.countDocuments({ status: "pending_review" }),
		Course.countDocuments({ publishStatus: "published" }),
	]);

	const courseIds = courseStats.map((c) => c._id).filter(Boolean);
	const courses = await Course.find({ _id: { $in: courseIds } })
		.select("title")
		.lean();
	const courseMap = Object.fromEntries(courses.map((c) => [c._id.toString(), c.title]));

	return {
		courseCompletionRate: 0,
		lessonDropOffRate: 0,
		mostViewedTopics: topCourses.map((c) => ({
			id: c._id,
			title: c.title,
			category: c.category,
		})),
		topEnrolledCourses: courseStats.map((s) => ({
			courseId: s._id,
			title: courseMap[s._id?.toString()] || "Unknown",
			enrollments: s.enrollments,
		})),
		activeTeachers: teacherCount,
		quizSubmissions: quizEvents,
		pendingContent: pendingCount,
		publishedContent: publishedCount,
	};
}

export async function getContentLibrary({ page = 1, limit = 20, status } = {}) {
	const filter = {};
	if (status) filter.publishStatus = status;

	const skip = (page - 1) * limit;
	const [courses, total] = await Promise.all([
		Course.find(filter)
			.select("title description category level publishStatus isApproved createdAt")
			.populate("teacher", "name email")
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(limit)
			.lean(),
		Course.countDocuments(filter),
	]);

	return {
		data: courses.map((c) => ({ id: c._id, ...c, _id: undefined })),
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit) || 1,
			totalItems: total,
		},
	};
}

export async function getRoleDefinitions() {
	return {
		roles: Object.entries(ROLE_LABELS).map(([id, label]) => ({
			id,
			label,
			permissions: ROLE_PERMISSIONS[id] || [],
		})),
	};
}

export async function listAdminUsers() {
	return User.find({ role: "admin" })
		.select("name email adminRole createdAt")
		.sort({ name: 1 })
		.lean();
}

export async function assignHubRole(userId, adminRole) {
	if (!ROLE_LABELS[adminRole]) {
		throw new Error("Invalid admin role");
	}
	const user = await User.findByIdAndUpdate(
		userId,
		{ role: "admin", adminRole },
		{ new: true },
	).select("name email adminRole");
	if (!user) throw new Error("User not found");
	return user;
}

export async function getActivityFeed(limit = 25) {
	return getRecentActivity({ limit });
}

const AI_PROMPTS = {
	outline: (topic) =>
		`Create a structured lesson outline for: "${topic}". Include objectives, 3-5 sections, and key takeaways. Format as JSON with keys: title, objectives, sections.`,
	examples: (topic) =>
		`Generate 3 simple real-life examples for teaching: "${topic}". Return JSON array with title and explanation.`,
	quiz: (topic) =>
		`Generate 5 multiple-choice quiz questions for: "${topic}". Return JSON array with question, options, correctIndex.`,
	summary: (content) =>
		`Summarize this lesson content in 3-4 beginner-friendly sentences:\n${content}`,
	simplify: (content) =>
		`Explain this topic in very simple terms for a beginner:\n${content}`,
	translate: (content) =>
		`Rewrite in simple Tamil-English mixed style (Tanglish) that is easy for Sri Lankan students:\n${content}`,
	activities: (topic) =>
		`Suggest 3 classroom activities for: "${topic}". Return JSON array with name, duration, description.`,
};

export async function aiLessonAssist({ type, topic, content }) {
	const promptFn = AI_PROMPTS[type];
	if (!promptFn) throw new Error("Unknown assist type");

	const input = content || topic;
	if (!input) throw new Error("Topic or content required");

	const messages = [
		{
			role: "system",
			content:
				"You are an expert curriculum designer for MR5 School. Return clean, structured educational content.",
		},
		{ role: "user", content: promptFn(input) },
	];

	const result = await aiService.chatCompletion({
		messages,
		temperature: 0.6,
		max_tokens: 1500,
	});

	const text =
		result?.choices?.[0]?.message?.content ||
		result?.content ||
		(typeof result === "string" ? result : JSON.stringify(result));

	return { type, result: text };
}

export async function getCourseFactoryDetail(courseId) {
	const course = await Course.findById(courseId)
		.populate("teacher", "name email")
		.lean();
	if (!course) throw new Error("Course not found");

	const lessons = await Lesson.find({ course: courseId })
		.sort({ order: 1 })
		.lean();

	return {
		course: { id: course._id, ...course, _id: undefined },
		lessons: lessons.map((l) => ({ id: l._id, ...l, _id: undefined })),
	};
}
