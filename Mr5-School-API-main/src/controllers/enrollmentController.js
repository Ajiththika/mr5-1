import Enrollment from "../models/Enrollment.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { paginate } from "../utils/pagination.js";
import { hasProAccess } from "../services/trialService.js";

// @desc    Get all enrollments with pagination
// @route   GET /api/enrollments
// @access  Private
const getAllEnrollments = asyncHandler(async (req, res) => {
	const { page, limit, student, course, status, search } = req.query;

	// Build query
	const query = {};
	if (student) query.student = student;
	if (course) query.course = course;
	if (status) query.status = status;
	// Note: Search is handled through populated fields on frontend
	// or we can enhance with aggregation pipeline for better search

	const result = await paginate(Enrollment, query, {
		page,
		limit,
		sort: "-createdAt",
		populate: [
			{ path: "student", select: "name email profileImage" },
			{
				path: "course",
				select: "title description thumbnail price level teacher",
				populate: { path: "teacher", select: "name email" },
			},
		],
	});

	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get student's own enrollments
// @route   GET /api/enrollments/my
// @access  Private (Students)
const getStudentEnrollments = asyncHandler(async (req, res) => {
	const result = await paginate(Enrollment, { student: req.user._id }, {
		page: req.query.page || 1,
		limit: req.query.limit || 10,
		sort: "-createdAt",
		populate: [
			{
				path: "course",
				select: "title description thumbnail price level teacher",
				populate: { path: "teacher", select: "name email" },
			},
		],
	});

	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
const getEnrollmentById = asyncHandler(async (req, res) => {
	const enrollment = await Enrollment.findById(req.params.id)
		.populate("student", "name email profileImage")
		.populate({
			path: "course",
			select: "title description thumbnail price level teacher",
			populate: { path: "teacher", select: "name email" },
		});

	if (!enrollment) {
		return res.status(404).json({
			success: false,
			error: "Enrollment not found",
		});
	}

	res.json({
		success: true,
		data: enrollment,
	});
});

// @desc    Create enrollment
// @route   POST /api/enrollments
// @access  Private
const createEnrollment = asyncHandler(async (req, res) => {
	const { student, course } = req.body;

	const populateEnrollment = (doc) =>
		Enrollment.findById(doc._id)
			.populate("student", "name email profileImage")
			.populate({
				path: "course",
				select: "title description thumbnail price level teacher",
				populate: { path: "teacher", select: "name email" },
			});

	const existing = await Enrollment.findOne({ student, course }).exec();
	if (existing) {
		const populatedEnrollment = await populateEnrollment(existing);
		return res.status(200).json({
			success: true,
			data: populatedEnrollment,
			message: "Student is already enrolled in this course",
		});
	}

	try {
		const savedenrollment = await new Enrollment(req.body).save();
		const populatedEnrollment = await populateEnrollment(savedenrollment);
		return res.status(201).json({
			success: true,
			data: populatedEnrollment,
		});
	} catch (error) {
		if (error?.code === 11000) {
			const duplicate = await Enrollment.findOne({ student, course }).exec();
			if (duplicate) {
				const populatedEnrollment = await populateEnrollment(duplicate);
				return res.status(200).json({
					success: true,
					data: populatedEnrollment,
					message: "Student is already enrolled in this course",
				});
			}
		}
		throw error;
	}
});

// @desc    Update enrollment
// @route   PUT /api/enrollments/:id
// @access  Private
const updateEnrollment = asyncHandler(async (req, res) => {
	const enrollment = await Enrollment.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			new: true,
			runValidators: true,
		},
	)
		.populate("student", "name email profileImage")
		.populate({
			path: "course",
			select: "title description thumbnail price level teacher",
			populate: { path: "teacher", select: "name email" },
		});

	if (!enrollment) {
		return res.status(404).json({
			success: false,
			error: "Enrollment not found",
		});
	}

	res.json({
		success: true,
		data: enrollment,
	});
});

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private
const deleteEnrollment = asyncHandler(async (req, res) => {
	const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

	if (!enrollment) {
		return res.status(404).json({
			success: false,
			error: "Enrollment not found",
		});
	}

	res.json({
		success: true,
		message: "Enrollment deleted successfully",
	});
});

// @desc    Check if user has access to course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
const checkEnrollmentAccess = asyncHandler(async (req, res) => {
	const { courseId } = req.params;
	const userId = req.user._id;

	if (req.user.role === "admin" || req.user.role === "AI-TEACHER") {
		return res.json({ access: true });
	}

	if (hasProAccess(req.user)) {
		return res.json({ access: true, trial: true });
	}

	const enrollment = await Enrollment.findOne({
		student: userId,
		course: courseId,
		status: "active"
	});

	res.json({ access: !!enrollment });
});

export {
	getAllEnrollments,
	getStudentEnrollments,
	getEnrollmentById,
	createEnrollment,
	updateEnrollment,
	deleteEnrollment,
	checkEnrollmentAccess,
};