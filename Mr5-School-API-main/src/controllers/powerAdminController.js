import { asyncHandler } from "../middleware/errorHandler.js";
import * as powerAdmin from "../services/powerAdminService.js";
import * as teacherHub from "../services/teacherHubService.js";
import * as classroomHub from "../services/classroomHubService.js";
import * as approvalWorkflow from "../services/approvalWorkflowService.js";
import { logActivity } from "../services/activityLogService.js";

export const getOverview = asyncHandler(async (req, res) => {
	const data = await powerAdmin.getHubOverview();
	res.json({ success: true, data });
});

export const getActivity = asyncHandler(async (req, res) => {
	const limit = parseInt(req.query.limit, 10) || 25;
	const data = await powerAdmin.getActivityFeed(limit);
	res.json({ success: true, data });
});

export const listTeachers = asyncHandler(async (req, res) => {
	const result = await teacherHub.listTeachers({
		page: parseInt(req.query.page, 10) || 1,
		limit: parseInt(req.query.limit, 10) || 20,
		search: req.query.search,
		status: req.query.status,
	});
	res.json({ success: true, ...result });
});

export const getTeacher = asyncHandler(async (req, res) => {
	const data = await teacherHub.getTeacherById(req.params.id);
	if (!data) {
		return res.status(404).json({ success: false, error: "Teacher not found" });
	}
	res.json({ success: true, data });
});

export const createTeacher = asyncHandler(async (req, res) => {
	const data = await teacherHub.createTeacher(req.body, req.user.id);
	res.status(201).json({ success: true, data });
});

export const updateTeacher = asyncHandler(async (req, res) => {
	const data = await teacherHub.updateTeacher(
		req.params.id,
		req.body,
		req.user.id,
	);
	res.json({ success: true, data });
});

export const cloneTeacher = asyncHandler(async (req, res) => {
	const data = await teacherHub.cloneTeacher(req.params.id, req.user.id);
	res.status(201).json({ success: true, data });
});

export const archiveTeacher = asyncHandler(async (req, res) => {
	const data = await teacherHub.archiveTeacher(req.params.id, req.user.id);
	res.json({ success: true, data });
});

export const deleteTeacher = asyncHandler(async (req, res) => {
	await teacherHub.deleteTeacher(req.params.id, req.user.id);
	res.json({ success: true, message: "Teacher deleted" });
});

export const listClassrooms = asyncHandler(async (req, res) => {
	const result = await classroomHub.listClassrooms({
		page: parseInt(req.query.page, 10) || 1,
		limit: parseInt(req.query.limit, 10) || 20,
		search: req.query.search,
		status: req.query.status,
	});
	res.json({ success: true, ...result });
});

export const getClassroom = asyncHandler(async (req, res) => {
	const data = await classroomHub.getClassroomById(req.params.id);
	if (!data) {
		return res.status(404).json({ success: false, error: "Classroom not found" });
	}
	res.json({ success: true, data });
});

export const createClassroom = asyncHandler(async (req, res) => {
	const data = await classroomHub.createClassroom(req.body, req.user.id);
	res.status(201).json({ success: true, data });
});

export const updateClassroom = asyncHandler(async (req, res) => {
	const data = await classroomHub.updateClassroom(
		req.params.id,
		req.body,
		req.user.id,
	);
	res.json({ success: true, data });
});

export const deleteClassroom = asyncHandler(async (req, res) => {
	await classroomHub.deleteClassroom(req.params.id, req.user.id);
	res.json({ success: true, message: "Classroom deleted" });
});

export const listApprovals = asyncHandler(async (req, res) => {
	const result = await approvalWorkflow.listApprovals({
		page: parseInt(req.query.page, 10) || 1,
		limit: parseInt(req.query.limit, 10) || 20,
		status: req.query.status || "pending_review",
	});
	res.json({ success: true, ...result });
});

export const approveContent = asyncHandler(async (req, res) => {
	const data = await approvalWorkflow.approveContent(req.params.id, {
		reviewerId: req.user.id,
		comment: req.body.comment,
	});
	res.json({ success: true, data });
});

export const rejectContent = asyncHandler(async (req, res) => {
	const data = await approvalWorkflow.rejectContent(req.params.id, {
		reviewerId: req.user.id,
		reason: req.body.reason,
		comment: req.body.comment,
	});
	res.json({ success: true, data });
});

export const publishContent = asyncHandler(async (req, res) => {
	const data = await approvalWorkflow.publishContent(req.params.id, {
		publisherId: req.user.id,
	});
	res.json({ success: true, data });
});

export const submitForReview = asyncHandler(async (req, res) => {
	const data = await approvalWorkflow.submitForReview({
		...req.body,
		submittedBy: req.user.id,
	});
	res.status(201).json({ success: true, data });
});

export const getAnalytics = asyncHandler(async (req, res) => {
	const data = await powerAdmin.getAnalyticsInsights();
	res.json({ success: true, data });
});

export const getRoles = asyncHandler(async (req, res) => {
	const definitions = await powerAdmin.getRoleDefinitions();
	const users = await powerAdmin.listAdminUsers();
	res.json({
		success: true,
		data: { ...definitions, adminUsers: users },
	});
});

export const assignRole = asyncHandler(async (req, res) => {
	const user = await powerAdmin.assignHubRole(
		req.params.userId,
		req.body.adminRole,
	);
	await logActivity({
		actor: req.user.id,
		action: "role.assign",
		module: "roles",
		targetType: "User",
		targetId: user._id,
		summary: `Assigned ${req.body.adminRole} to ${user.name}`,
	});
	res.json({ success: true, data: user });
});

export const getContentLibrary = asyncHandler(async (req, res) => {
	const result = await powerAdmin.getContentLibrary({
		page: parseInt(req.query.page, 10) || 1,
		limit: parseInt(req.query.limit, 10) || 20,
		status: req.query.status,
	});
	res.json({ success: true, ...result });
});

export const aiLessonAssist = asyncHandler(async (req, res) => {
	const data = await powerAdmin.aiLessonAssist(req.body);
	res.json({ success: true, data });
});

export const getCourseDetail = asyncHandler(async (req, res) => {
	const data = await powerAdmin.getCourseFactoryDetail(req.params.id);
	res.json({ success: true, data });
});
