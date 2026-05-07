import Assignment from "../models/Assignment.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { paginate } from "../utils/pagination.js";

// @desc    Get all assignments with pagination
// @route   GET /api/assignments
// @access  Private
const getAllAssignments = asyncHandler(async (req, res) => {
	const { page, limit, course, teacher, search
	} = req.query;

	// Build query
	const query = {};
	if (course) query.course = course;
	if (teacher) query.teacher = teacher;
	if (search) {
		query.$or = [
			{ title: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } },
		];
	}

	const result = await paginate(Assignment, query, {
		page,
		limit,
		sort: "-createdAt",
		populate: [
			{
				path: "course",
				select: "title description thumbnail level",
			},
			{
				path: "teacher",
				select: "name email profileImage",
			},
		],
	});

	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = asyncHandler(async (req, res) => {
	const assignment = await Assignment.findById(req.params.id)
		.populate("course", "title description thumbnail level teacher")
		.populate("teacher", "name email profileImage");

	if (!assignment) {
		return res.status(404).json({
			success: false,
			error: "Assignment not found",
		});
	}

	res.json({
		success: true,
		data: assignment,
	});
});

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private/teacher/Admin
const createAssignment = asyncHandler(async (req, res) => {
	const newassignment = new Assignment(req.body);
	const savedassignment = await newassignment.save();

	const populatedAssignment = await Assignment.findById(savedassignment._id)
		.populate("course", "title description thumbnail level")
		.populate("teacher", "name email profileImage");

	res.status(201).json({
		success: true,
		data: populatedAssignment,
	});
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/teacher/Admin
const updateAssignment = asyncHandler(async (req, res) => {
	const assignment = await Assignment.findByIdAndUpdate(
		req.params.id,
		req.body,
		{
			new: true,
			runValidators: true,
		},
	)
		.populate("course", "title description thumbnail level")
		.populate("teacher", "name email profileImage");

	if (!assignment) {
		return res.status(404).json({
			success: false,
			error: "Assignment not found",
		});
	}

	res.json({
		success: true,
		data: assignment,
	});
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/AI-TEACHER/Admin
const deleteAssignment = asyncHandler(async (req, res) => {
	const assignment = await Assignment.findByIdAndDelete(req.params.id);

	if (!assignment) {
		return res.status(404).json({
			success: false,
			error: "Assignment not found",
		});
	}

	res.json({
		success: true,
		message: "Assignment deleted successfully",
	});
});

export {
	getAllAssignments,
	getAssignmentById,
	createAssignment,
	updateAssignment,
	deleteAssignment,
};
