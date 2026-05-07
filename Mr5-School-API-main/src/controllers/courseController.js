import * as courseService from "../services/courseService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc    Get all courses with pagination
// @route   GET /api/courses
// @access  Public
const getAllCourses = asyncHandler(async (req, res) => {
	const result = await courseService.getAllCourses(req.query);
	
	// Set cache control headers
	res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
	
	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
	const course = await courseService.getCourseById(req.params.id);
	
	// Set cache control headers
	res.set('Cache-Control', 'public, max-age=600'); // 10 minutes cache
	
	res.json({
		success: true,
		data: course,
	});
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private/teacher/Admin
// @body    {title, description, category, teacher, level, price, thumbnail, language, isApproved, prerequisites, tags}
const createCourse = asyncHandler(async (req, res) => {
	const course = await courseService.createCourse(req.body);
	res.status(201).json({
		success: true,
		data: course,
	});
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/teacher/Admin
// @body    {title, description, category, level, price, thumbnail, language, isApproved, prerequisites, tags}
const updateCourse = asyncHandler(async (req, res) => {
	const course = await courseService.updateCourse(req.params.id, req.body);
	res.json({
		success: true,
		data: course,
	});
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/teacher/Admin
const deleteCourse = asyncHandler(async (req, res) => {
	await courseService.deleteCourse(req.params.id);
	res.json({
		success: true,
		message: "Course removed",
	});
});

export {
	getAllCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse,
};