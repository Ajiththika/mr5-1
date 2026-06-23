import ContentApproval from "../models/ContentApproval.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import { logActivity } from "./activityLogService.js";

function formatApproval(doc) {
	if (!doc) return null;
	const a = doc.toObject ? doc.toObject() : doc;
	return { id: a._id, ...a, _id: undefined };
}

export async function listApprovals({
	page = 1,
	limit = 20,
	status = "pending_review",
} = {}) {
	const filter = {};
	if (status && status !== "all") filter.status = status;

	const skip = (page - 1) * limit;
	const [items, total] = await Promise.all([
		ContentApproval.find(filter)
			.populate("submittedBy", "name email")
			.populate("reviewedBy", "name email")
			.sort({ priority: -1, createdAt: -1 })
			.skip(skip)
			.limit(limit),
		ContentApproval.countDocuments(filter),
	]);

	return {
		data: items.map(formatApproval),
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit) || 1,
			totalItems: total,
			hasNextPage: page * limit < total,
			hasPrevPage: page > 1,
		},
	};
}

export async function submitForReview({
	contentType,
	contentId,
	title,
	submittedBy,
}) {
	const contentModel =
		contentType === "course"
			? "Course"
			: contentType === "lesson"
				? "Lesson"
				: "Assignment";

	const approval = await ContentApproval.create({
		contentType,
		contentId,
		contentModel,
		title,
		submittedBy,
		status: "pending_review",
	});

	const update = { publishStatus: "pending_review" };
	if (contentType === "course") {
		await Course.findByIdAndUpdate(contentId, update);
	} else if (contentType === "lesson") {
		await Lesson.findByIdAndUpdate(contentId, update);
	}

	await logActivity({
		actor: submittedBy,
		action: "approval.submit",
		module: "approvals",
		targetType: contentModel,
		targetId: contentId,
		summary: `Submitted "${title}" for review`,
	});

	return formatApproval(approval);
}

export async function approveContent(id, { reviewerId, comment }) {
	const approval = await ContentApproval.findById(id);
	if (!approval) throw new Error("Approval not found");

	approval.status = "approved";
	approval.reviewedBy = reviewerId;
	if (comment) {
		approval.reviewComments.push({ author: reviewerId, text: comment });
	}
	await approval.save();

	const publishUpdate = { publishStatus: "approved", isApproved: true };
	if (approval.contentType === "course") {
		await Course.findByIdAndUpdate(approval.contentId, publishUpdate);
	} else if (approval.contentType === "lesson") {
		await Lesson.findByIdAndUpdate(approval.contentId, publishUpdate);
	}

	await logActivity({
		actor: reviewerId,
		action: "approval.approve",
		module: "approvals",
		targetType: approval.contentModel,
		targetId: approval.contentId,
		summary: `Approved "${approval.title}"`,
	});

	return formatApproval(
		await approval.populate("submittedBy", "name").populate("reviewedBy", "name"),
	);
}

export async function rejectContent(id, { reviewerId, reason, comment }) {
	const approval = await ContentApproval.findById(id);
	if (!approval) throw new Error("Approval not found");

	approval.status = "rejected";
	approval.reviewedBy = reviewerId;
	approval.rejectionReason = reason;
	if (comment) {
		approval.reviewComments.push({ author: reviewerId, text: comment });
	}
	await approval.save();

	const rejectUpdate = { publishStatus: "rejected" };
	if (approval.contentType === "course") {
		await Course.findByIdAndUpdate(approval.contentId, rejectUpdate);
	} else if (approval.contentType === "lesson") {
		await Lesson.findByIdAndUpdate(approval.contentId, rejectUpdate);
	}

	await logActivity({
		actor: reviewerId,
		action: "approval.reject",
		module: "approvals",
		targetType: approval.contentModel,
		targetId: approval.contentId,
		summary: `Rejected "${approval.title}": ${reason}`,
	});

	return formatApproval(approval);
}

export async function publishContent(id, { publisherId }) {
	const approval = await ContentApproval.findById(id);
	if (!approval) throw new Error("Approval not found");

	approval.status = "published";
	await approval.save();

	const publishUpdate = { publishStatus: "published", isApproved: true };
	if (approval.contentType === "course") {
		await Course.findByIdAndUpdate(approval.contentId, publishUpdate);
	} else if (approval.contentType === "lesson") {
		await Lesson.findByIdAndUpdate(approval.contentId, publishUpdate);
	}

	await logActivity({
		actor: publisherId,
		action: "content.publish",
		module: "approvals",
		targetType: approval.contentModel,
		targetId: approval.contentId,
		summary: `Published "${approval.title}"`,
	});

	return formatApproval(approval);
}
