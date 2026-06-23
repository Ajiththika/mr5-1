import User from "../models/User.js";
import RegistrationRequest from "../models/RegistrationRequest.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import Teacher from "../models/Teacher.js";
import Classroom from "../models/Classroom.js";
import ContentApproval from "../models/ContentApproval.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc    Get pending registrations
// @route   GET /api/admin/registrations/pending
// @access  Private/Admin
export const getPendingRegistrations = asyncHandler(async (req, res) => {
	// Get pending users (AI-TEACHERs)
	const pendingUsers = await User.find({
		role: "AI-TEACHER",
		status: "pending",
	}).select("-password");

	// Get pending requests (if any)
	const pendingRequests = await RegistrationRequest.find({
		status: "pending",
	}).populate("userId", "name email");

	// Combine or return as needed. For now, let's return pending users as that's the main requirement.
	// The prompt says "Admin view lists pending registration requests for Student (if you treat student registrations as needing approval) and AI-TEACHER requests."
	// We set students to auto-approve, so mainly AI-TEACHERs.

	// Map users to a common shape
	const formattedUsers = pendingUsers.map((user) => ({
		id: user._id,
		userId: user._id,
		name: user.name,
		email: user.email,
		roleRequested: user.role,
		submittedAt: user.createdAt,
		status: user.status,
		type: "user_registration",
	}));

	const formattedRequests = pendingRequests.map((req) => ({
		id: req._id,
		userId: req.userId._id,
		name: req.userId.name,
		email: req.userId.email,
		roleRequested: req.type === "AI-TEACHER_upgrade" ? "AI-TEACHER" : req.type,
		submittedAt: req.submittedAt,
		status: req.status,
		type: "upgrade_request",
	}));

	res.status(200).json({
		success: true,
		data: [...formattedUsers, ...formattedRequests],
	});
});

// @desc    Approve registration
// @route   POST /api/admin/registrations/:id/approve
// @access  Private/Admin
export const approveRegistration = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { note } = req.body;

	// Check if it's a User or a Request
	// Try finding user first
	let user = await User.findById(id);

	if (user) {
		user.status = "approved";
		await user.save();
		return res.status(200).json({ success: true, data: user });
	}

	// Try finding request
	let request = await RegistrationRequest.findById(id);
	if (request) {
		request.status = "approved";
		request.approvedBy = req.user.id;
		request.approvedAt = Date.now();
		request.note = note;
		await request.save();

		// If it was a AI-TEACHER upgrade, update the user role
		if (request.type === "AI-TEACHER_upgrade") {
			await User.findByIdAndUpdate(request.userId, {
				role: "AI-TEACHER",
				status: "approved",
			});
		}

		return res.status(200).json({ success: true, data: request });
	}

	res.status(404).json({ success: false, error: "Registration not found" });
});

// @desc    Reject registration
// @route   POST /api/admin/registrations/:id/reject
// @access  Private/Admin
export const rejectRegistration = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { reason } = req.body;

	if (!reason) {
		return res
			.status(400)
			.json({ success: false, error: "Reason is required" });
	}

	// Try finding user
	let user = await User.findById(id);
	if (user) {
		user.status = "rejected";
		// We might want to store the reason somewhere, maybe in a separate log or add a field to User.
		// For now, just update status.
		await user.save();
		return res.status(200).json({ success: true, data: user });
	}

	// Try finding request
	let request = await RegistrationRequest.findById(id);
	if (request) {
		request.status = "rejected";
		request.rejectedBy = req.user.id;
		request.rejectedAt = Date.now();
		request.reason = reason;
		await request.save();
		return res.status(200).json({ success: true, data: request });
	}

	res.status(404).json({ success: false, error: "Registration not found" });
});

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Public
export const getPlatformStats = asyncHandler(async (req, res) => {
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

	const [
		totalStudents,
		totalCourses,
		totalEnrollments,
		recentEnrollments,
		totalUsers,
		totalAITeachers,
		totalTeachers,
		totalClassrooms,
		pendingApprovals,
		publishedCourses,
		draftCourses,
		completedPayments,
		recentRevenue,
	] = await Promise.all([
		User.countDocuments({ role: "student", status: "approved" }),
		Course.countDocuments({ isApproved: true }),
		Enrollment.countDocuments(),
		Enrollment.countDocuments({ enrolledAt: { $gte: thirtyDaysAgo } }),
		User.countDocuments({ status: "approved" }),
		User.countDocuments({ role: "AI-TEACHER", status: "approved" }),
		Teacher.countDocuments({ status: { $ne: "archived" } }),
		Classroom.countDocuments(),
		ContentApproval.countDocuments({ status: "pending_review" }),
		Course.countDocuments({ publishStatus: "published" }),
		Course.countDocuments({ publishStatus: "draft" }),
		Payment.aggregate([
			{ $match: { status: "completed" } },
			{ $group: { _id: null, total: { $sum: "$amount" } } },
		]),
		Payment.aggregate([
			{ $match: { status: "completed", paymentDate: { $gte: thirtyDaysAgo } } },
			{ $group: { _id: null, total: { $sum: "$amount" } } },
		]),
	]);

	const totalRevenue = completedPayments[0]?.total ?? 0;
	const monthlyRevenue = recentRevenue[0]?.total ?? 0;
	const engagementRate =
		totalStudents > 0
			? Math.round((recentEnrollments / totalStudents) * 100)
			: 0;

	res.status(200).json({
		success: true,
		data: {
			totalStudents,
			totalAITeachers,
			totalTeachers,
			totalClassrooms,
			totalCourses,
			totalEnrollments,
			recentEnrollments,
			totalUsers,
			pendingApprovals,
			publishedContent: publishedCourses,
			draftContent: draftCourses,
			totalRevenue,
			monthlyRevenue,
			revenue: totalRevenue,
			engagementRate,
		},
	});
});
