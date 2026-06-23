import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import { logActivity } from "./activityLogService.js";

function formatTeacher(doc) {
	if (!doc) return null;
	const t = doc.toObject ? doc.toObject() : doc;
	return {
		id: t._id,
		...t,
		_id: undefined,
	};
}

export async function listTeachers({
	page = 1,
	limit = 20,
	search,
	status,
} = {}) {
	const filter = {};
	if (status) filter.status = status;
	if (search) {
		filter.$or = [
			{ specialization: { $regex: search, $options: "i" } },
			{ displayName: { $regex: search, $options: "i" } },
			{ tags: { $regex: search, $options: "i" } },
		];
	}

	const skip = (page - 1) * limit;
	const [items, total] = await Promise.all([
		Teacher.find(filter)
			.populate("user", "name email avatarPreset status")
			.populate("courses", "title publishStatus")
			.sort({ updatedAt: -1 })
			.skip(skip)
			.limit(limit),
		Teacher.countDocuments(filter),
	]);

	return {
		data: items.map(formatTeacher),
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit) || 1,
			totalItems: total,
			hasNextPage: page * limit < total,
			hasPrevPage: page > 1,
		},
	};
}

export async function getTeacherById(id) {
	const teacher = await Teacher.findById(id)
		.populate("user", "name email avatarPreset status role")
		.populate("courses", "title publishStatus level category")
		.populate("classrooms", "name status mode");
	return formatTeacher(teacher);
}

export async function createTeacher(data, actorId) {
	const user = await User.findById(data.userId);
	if (!user) throw new Error("User not found");

	const existing = await Teacher.findOne({ user: data.userId });
	if (existing) throw new Error("Teacher profile already exists for this user");

	const teacher = await Teacher.create({
		user: data.userId,
		displayName: data.displayName || user.name,
		specialization: data.specialization,
		subjectExpertise: data.subjectExpertise || [],
		languageStyle: data.languageStyle,
		teachingTone: data.teachingTone,
		experienceLevel: data.experienceLevel,
		bio: data.bio || "",
		isAvatarAI: data.isAvatarAI ?? user.role === "AI-TEACHER",
		tags: data.tags || [],
		notes: data.notes || "",
		studio: data.studio || {},
	});

	await User.findByIdAndUpdate(data.userId, { teacherProfile: teacher._id });

	await logActivity({
		actor: actorId,
		action: "teacher.create",
		module: "teachers",
		targetType: "Teacher",
		targetId: teacher._id,
		summary: `Created teacher profile for ${user.name}`,
	});

	return formatTeacher(
		await teacher.populate("user", "name email avatarPreset"),
	);
}

export async function updateTeacher(id, data, actorId) {
	const teacher = await Teacher.findByIdAndUpdate(
		id,
		{ $set: data },
		{ new: true, runValidators: true },
	).populate("user", "name email avatarPreset");

	if (!teacher) throw new Error("Teacher not found");

	await logActivity({
		actor: actorId,
		action: "teacher.update",
		module: "teachers",
		targetType: "Teacher",
		targetId: teacher._id,
		summary: `Updated teacher ${teacher.displayName || teacher.specialization}`,
	});

	return formatTeacher(teacher);
}

export async function cloneTeacher(id, actorId) {
	const source = await Teacher.findById(id).lean();
	if (!source) throw new Error("Teacher not found");

	const cloneUser = await User.create({
		name: `${source.displayName || "Teacher"} (Clone)`,
		email: `clone-${Date.now()}@mr5school.local`,
		password: "Clone@Temp123",
		role: "AI-TEACHER",
		status: "approved",
	});

	const { _id, user, createdAt, updatedAt, ...rest } = source;
	const clone = await Teacher.create({
		...rest,
		user: cloneUser._id,
		displayName: `${rest.displayName || rest.specialization} (Clone)`,
		status: "inactive",
		rating: 0,
		totalStudents: 0,
		courses: [],
		classrooms: [],
	});

	await User.findByIdAndUpdate(cloneUser._id, { teacherProfile: clone._id });

	await logActivity({
		actor: actorId,
		action: "teacher.clone",
		module: "teachers",
		targetType: "Teacher",
		targetId: clone._id,
		summary: `Cloned teacher from ${source.displayName || source.specialization}`,
	});

	return formatTeacher(
		await clone.populate("user", "name email avatarPreset"),
	);
}

export async function archiveTeacher(id, actorId) {
	return updateTeacher(id, { status: "archived" }, actorId);
}

export async function deleteTeacher(id, actorId) {
	const teacher = await Teacher.findByIdAndDelete(id);
	if (!teacher) throw new Error("Teacher not found");

	await logActivity({
		actor: actorId,
		action: "teacher.delete",
		module: "teachers",
		targetType: "Teacher",
		targetId: id,
		summary: `Deleted teacher ${teacher.displayName || teacher.specialization}`,
	});

	return true;
}
