import crypto from "crypto";
import IdentityNotification from "../models/IdentityNotification.js";
import IdentityFriend from "../models/IdentityFriend.js";
import UserLearningStats from "../models/UserLearningStats.js";
import User from "../models/User.js";

export async function createIdentityNotification({
	userId,
	actorId = null,
	type,
	scope = "personal",
	title,
	message,
	href = null,
	icon = null,
	metadata = {},
}) {
	return IdentityNotification.create({
		user: userId,
		actor: actorId,
		type,
		scope,
		title,
		message,
		href,
		icon,
		metadata,
	});
}

export async function notifyFriendsOfAchievement(userId, payload) {
	const friendships = await IdentityFriend.find({
		status: "accepted",
		$or: [{ requester: userId }, { recipient: userId }],
	})
		.select("requester recipient")
		.lean();

	const friendIds = friendships.map((row) =>
		String(row.requester) === String(userId) ? row.recipient : row.requester,
	);

	await Promise.all(
		friendIds.map((friendId) =>
			createIdentityNotification({
				userId: friendId,
				actorId: userId,
				type: payload.type,
				scope: "friends",
				title: payload.title,
				message: payload.message,
				href: payload.href,
				icon: payload.icon,
				metadata: payload.metadata,
			}),
		),
	);
}

export async function listNotifications(userId, { scope = "all", limit = 30 } = {}) {
	const filter = { user: userId };
	if (scope !== "all") filter.scope = scope;

	return IdentityNotification.find(filter)
		.sort({ createdAt: -1 })
		.limit(Math.min(limit, 50))
		.populate("actor", "name mr5Uid profileImage avatarUrl")
		.lean();
}

export async function markNotificationRead(userId, notificationId) {
	return IdentityNotification.findOneAndUpdate(
		{ _id: notificationId, user: userId },
		{ $set: { read: true } },
		{ new: true },
	).lean();
}

export async function markAllNotificationsRead(userId, scope = "all") {
	const filter = { user: userId, read: false };
	if (scope !== "all") filter.scope = scope;
	await IdentityNotification.updateMany(filter, { $set: { read: true } });
}

export async function getGlobalLeaderboardFeed(limit = 10) {
	const topLearners = await UserLearningStats.find({ xp: { $gt: 0 } })
		.sort({ xp: -1 })
		.limit(limit)
		.populate("user", "name mr5Uid profileImage avatarUrl")
		.lean();

	const streakLeaders = await UserLearningStats.find({ studyStreak: { $gte: 7 } })
		.sort({ studyStreak: -1 })
		.limit(5)
		.populate("user", "name mr5Uid")
		.lean();

	const recentCerts = await IdentityNotification.find({
		type: "certificate_earned",
		scope: { $in: ["global", "friends"] },
	})
		.sort({ createdAt: -1 })
		.limit(5)
		.populate("actor", "name mr5Uid")
		.lean();

	return {
		topLearners: topLearners.map((row, index) => ({
			rank: index + 1,
			uid: row.user?.mr5Uid,
			name: row.user?.name,
			xp: row.xp,
			level: row.level,
			profileImage: row.user?.profileImage || row.user?.avatarUrl || null,
			href: row.user?.mr5Uid ? `/u/${row.user.mr5Uid}` : null,
		})),
		streakLeaders: streakLeaders.map((row) => ({
			uid: row.user?.mr5Uid,
			name: row.user?.name,
			studyStreak: row.studyStreak,
			href: row.user?.mr5Uid ? `/u/${row.user.mr5Uid}` : null,
		})),
		recentCertificates: recentCerts.map((row) => ({
			name: row.actor?.name,
			uid: row.actor?.mr5Uid,
			title: row.metadata?.certificateTitle || row.message,
			href: row.href,
		})),
	};
}

export function generateVerificationId() {
	const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
	return `CERT-${suffix}`;
}

export function generateWatermarkHash(verificationId, userId, title) {
	return crypto
		.createHash("sha256")
		.update(`${verificationId}:${userId}:${title}`)
		.digest("hex")
		.slice(0, 24);
}
