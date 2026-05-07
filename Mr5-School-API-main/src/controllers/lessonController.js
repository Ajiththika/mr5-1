import * as lessonService from "../services/lessonService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc    Get all lessons with pagination
// @route   GET /api/lessons
// @access  Private
const getAllLessons = asyncHandler(async (req, res) => {
	const result = await lessonService.getAllLessons(req.query);
	
	// Set cache control headers
	res.set('Cache-Control', 'private, max-age=300'); // 5 minutes cache
	
	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get lesson by ID
// @route   GET /api/lessons/:id
// @access  Private
const getLessonById = asyncHandler(async (req, res) => {
	const lesson = await lessonService.getLessonById(req.params.id);
	
	// Set cache control headers
	res.set('Cache-Control', 'private, max-age=600'); // 10 minutes cache
	
	res.json({
		success: true,
		data: lesson,
	});
});

// @desc    Create lesson
// @route   POST /api/lessons
// @access  Private/teacher/Admin
const createLesson = asyncHandler(async (req, res) => {
	const lesson = await lessonService.createLesson(req.body);
	res.status(201).json({
		success: true,
		data: lesson,
	});
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private/teacher/Admin
const updateLesson = asyncHandler(async (req, res) => {
	const lesson = await lessonService.updateLesson(req.params.id, req.body);
	res.json({
		success: true,
		data: lesson,
	});
});

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private/teacher/Admin
const deleteLesson = asyncHandler(async (req, res) => {
	await lessonService.deleteLesson(req.params.id);
	res.json({
		success: true,
		message: "Lesson deleted successfully",
	});
});

export {
	getAllLessons,
	getLessonById,
	createLesson,
	updateLesson,
	deleteLesson,
};