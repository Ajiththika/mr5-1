import Classroom from "../models/Classroom.js";
import { logActivity } from "./activityLogService.js";

function formatClassroom(doc) {
	if (!doc) return null;
	const c = doc.toObject ? doc.toObject() : doc;
	return { id: c._id, ...c, _id: undefined };
}

export async function listClassrooms({
	page = 1,
	limit = 20,
	search,
	status,
} = {}) {
	const filter = {};
	if (status) filter.status = status;
	if (search) {
		filter.$or = [
			{ name: { $regex: search, $options: "i" } },
			{ description: { $regex: search, $options: "i" } },
		];
	}

	const skip = (page - 1) * limit;
	const [items, total] = await Promise.all([
		Classroom.find(filter)
			.populate("course", "title publishStatus")
			.populate("teacher", "displayName specialization")
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(limit),
		Classroom.countDocuments(filter),
	]);

	return {
		data: items.map(formatClassroom),
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit) || 1,
			totalItems: total,
			hasNextPage: page * limit < total,
			hasPrevPage: page > 1,
		},
	};
}

export async function getClassroomById(id) {
	const classroom = await Classroom.findById(id)
		.populate("course", "title description level")
		.populate("teacher", "displayName specialization studio")
		.populate("teacherUser", "name email");
	return formatClassroom(classroom);
}

export async function createClassroom(data, actorId) {
	const classroom = await Classroom.create({
		...data,
		createdBy: actorId,
	});

	await logActivity({
		actor: actorId,
		action: "classroom.create",
		module: "classrooms",
		targetType: "Classroom",
		targetId: classroom._id,
		summary: `Created classroom "${classroom.name}"`,
	});

	return formatClassroom(
		await classroom.populate("course", "title").populate("teacher", "displayName"),
	);
}

export async function updateClassroom(id, data, actorId) {
	const classroom = await Classroom.findByIdAndUpdate(
		id,
		{ $set: data },
		{ new: true, runValidators: true },
	)
		.populate("course", "title")
		.populate("teacher", "displayName");

	if (!classroom) throw new Error("Classroom not found");

	await logActivity({
		actor: actorId,
		action: "classroom.update",
		module: "classrooms",
		targetType: "Classroom",
		targetId: classroom._id,
		summary: `Updated classroom "${classroom.name}"`,
	});

	return formatClassroom(classroom);
}

export async function deleteClassroom(id, actorId) {
	const classroom = await Classroom.findByIdAndDelete(id);
	if (!classroom) throw new Error("Classroom not found");

	await logActivity({
		actor: actorId,
		action: "classroom.delete",
		module: "classrooms",
		targetType: "Classroom",
		targetId: id,
		summary: `Deleted classroom "${classroom.name}"`,
	});

	return true;
}
