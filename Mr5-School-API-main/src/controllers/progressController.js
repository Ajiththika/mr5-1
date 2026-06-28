import LessonProgress from "../models/LessonProgress.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
	recordLessonActivity,
	recordCourseCompletion,
} from "../services/identityGamificationService.js";

const recalculateEnrollmentProgress = async (userId, courseId) => {
	const [totalLessons, completedLessons] = await Promise.all([
		Lesson.countDocuments({ course: courseId }),
		LessonProgress.countDocuments({ user: userId, course: courseId }),
	]);

	const progress =
		totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

	await Enrollment.findOneAndUpdate(
		{ student: userId, course: courseId },
		{
			progress,
			status: progress >= 100 ? "completed" : "active",
		},
	);

	return { progress, totalLessons, completedLessons };
};

export const completeLesson = asyncHandler(async (req, res) => {
	const { lessonId } = req.params;
	const watchPercent = req.body.watchPercent ?? 100;

	const lesson = await Lesson.findById(lessonId);
	if (!lesson) {
		return res.status(404).json({ success: false, error: "Lesson not found" });
	}

	const enrollment = await Enrollment.findOne({
		student: req.user.id,
		course: lesson.course,
	});

	if (!enrollment) {
		return res.status(403).json({
			success: false,
			error: "You must be enrolled in this course to track progress",
		});
	}

	const progress = await LessonProgress.findOneAndUpdate(
		{ user: req.user.id, lesson: lessonId },
		{
			user: req.user.id,
			lesson: lessonId,
			course: lesson.course,
			completedAt: new Date(),
			watchPercent,
		},
		{ upsert: true, new: true },
	);

	const priorEnrollment = await Enrollment.findOne({
		student: req.user.id,
		course: lesson.course,
	}).select("progress status");

	const enrollmentStats = await recalculateEnrollmentProgress(
		req.user.id,
		lesson.course,
	);

	const wasComplete =
		(priorEnrollment?.progress || 0) >= 100 || priorEnrollment?.status === "completed";
	const isNowComplete = enrollmentStats.progress >= 100;

	void recordLessonActivity(req.user.id).catch(() => {});
	if (!wasComplete && isNowComplete) {
		void recordCourseCompletion(req.user.id, lesson.course).catch(() => {});
	}

	res.status(200).json({
		success: true,
		data: {
			progress,
			enrollmentProgress: enrollmentStats.progress,
			completedLessons: enrollmentStats.completedLessons,
			totalLessons: enrollmentStats.totalLessons,
		},
	});
});

export const getCourseProgress = asyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const [lessonProgress, totalLessons] = await Promise.all([
		LessonProgress.find({ user: req.user.id, course: courseId }).select(
			"lesson completedAt watchPercent",
		),
		Lesson.countDocuments({ course: courseId }),
	]);

	res.status(200).json({
		success: true,
		data: {
			completedLessonIds: lessonProgress.map((p) => p.lesson.toString()),
			lessons: lessonProgress,
			totalLessons,
			completedCount: lessonProgress.length,
			progressPercent:
				totalLessons > 0
					? Math.round((lessonProgress.length / totalLessons) * 100)
					: 0,
		},
	});
});
