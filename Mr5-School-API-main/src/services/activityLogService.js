import ActivityLog from "../models/ActivityLog.js";

export async function logActivity({
	actor,
	action,
	module = "system",
	targetType,
	targetId,
	summary,
	metadata,
}) {
	try {
		await ActivityLog.create({
			actor,
			action,
			module,
			targetType,
			targetId,
			summary,
			metadata,
		});
	} catch (err) {
		console.error("Activity log failed:", err.message);
	}
}

export async function getRecentActivity({ limit = 20, module } = {}) {
	const filter = module ? { module } : {};
	return ActivityLog.find(filter)
		.sort({ createdAt: -1 })
		.limit(limit)
		.populate("actor", "name email")
		.lean();
}
