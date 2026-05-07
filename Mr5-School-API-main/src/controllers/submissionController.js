import * as submissionService from "../services/submissionService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc    Get all submissions with pagination
// @route   GET /api/submissions
// @access  Private
const getAllSubmissions = asyncHandler(async (req, res) => {
	const result = await submissionService.getAllSubmissions(req.query);
	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = asyncHandler(async (req, res) => {
	const submission = await submissionService.getSubmissionById(req.params.id);
	res.json({
		success: true,
		data: submission,
	});
});

// @desc    Create submission
// @route   POST /api/submissions
// @access  Private
const createSubmission = asyncHandler(async (req, res) => {
	const submission = await submissionService.createSubmission(req.body);
	res.status(201).json({
		success: true,
		data: submission,
	});
});

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private
const updateSubmission = asyncHandler(async (req, res) => {
	const submission = await submissionService.updateSubmission(
		req.params.id,
		req.body,
	);
	res.json({
		success: true,
		data: submission,
	});
});

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private
const deleteSubmission = asyncHandler(async (req, res) => {
	await submissionService.deleteSubmission(req.params.id);
	res.json({
		success: true,
		message: "Submission deleted successfully",
	});
});

export {
	getAllSubmissions,
	getSubmissionById,
	createSubmission,
	updateSubmission,
	deleteSubmission,
};
