import User from "../models/User.js";
import UserPrivacySettings from "../models/UserPrivacySettings.js";
import UserLearningStats from "../models/UserLearningStats.js";
import UserBadge from "../models/UserBadge.js";
import UserCertificate from "../models/UserCertificate.js";
import IdentityFriend from "../models/IdentityFriend.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import cache from "../utils/cache.js";
import { BADGE_BY_ID } from "../config/badgeCatalog.js";
import {
	normalizeMr5Uid,
	isMr5UidInput,
} from "../utils/uidGenerator.js";
import { generateUniqueMr5Uid } from "./uidService.js";
import {
	createIdentityNotification,
	listNotifications,
	markNotificationRead,
	markAllNotificationsRead,
	getGlobalLeaderboardFeed,
} from "./identityNotificationService.js";

const PUBLIC_USER_SELECT =
	"name role profileImage avatarUrl coverImageUrl mr5Uid createdAt status isActive";

const ROLE_LABELS = {
	student: "Student",
	"AI-TEACHER": "Teacher",
	admin: "Administrator",
};

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapRoleLabel(role) {
	return ROLE_LABELS[role] || "Learner";
}

function pickProfileImage(user) {
	return user.profileImage || user.avatarUrl || null;
}

async function areFriends(userAId, userBId) {
	if (!userAId || !userBId) return false;
	const friendship = await IdentityFriend.findOne({
		status: "accepted",
		$or: [
			{ requester: userAId, recipient: userBId },
			{ requester: userBId, recipient: userAId },
		],
	})
		.select("_id")
		.lean();
	return Boolean(friendship);
}

async function getFriendRelation(viewerUserId, ownerUserId) {
	if (!viewerUserId || !ownerUserId) return { isFriend: false, pending: null };
	if (String(viewerUserId) === String(ownerUserId)) {
		return { isFriend: false, pending: null, isOwner: true };
	}

	const row = await IdentityFriend.findOne({
		$or: [
			{ requester: viewerUserId, recipient: ownerUserId },
			{ requester: ownerUserId, recipient: viewerUserId },
		],
	})
		.select("status requester recipient")
		.lean();

	if (!row) return { isFriend: false, pending: null };
	if (row.status === "accepted") return { isFriend: true, pending: null };
	if (row.status === "pending") {
		const outgoing = String(row.requester) === String(viewerUserId);
		return { isFriend: false, pending: outgoing ? "outgoing" : "incoming", requestId: String(row._id) };
	}
	return { isFriend: false, pending: "blocked" };
}

async function isProfileSearchable(userId, viewerUserId) {
	const privacy = await getOrCreatePrivacy(userId);
	if (privacy.profileVisibility === "public") return true;
	if (privacy.profileVisibility === "private") return false;
	if (privacy.profileVisibility === "friends_only") {
		return areFriends(viewerUserId, userId);
	}
	return false;
}

async function getOrCreatePrivacy(userId) {
	let privacy = await UserPrivacySettings.findOne({ user: userId }).lean();
	if (!privacy) {
		privacy = (
			await UserPrivacySettings.create({ user: userId })
		).toObject();
	}
	return privacy;
}

async function getOrCreateStats(userId) {
	let stats = await UserLearningStats.findOne({ user: userId }).lean();
	if (!stats) {
		const completedCourses = await Enrollment.countDocuments({
			student: userId,
			status: "completed",
		});
		stats = (
			await UserLearningStats.create({
				user: userId,
				completedCourses,
			})
		).toObject();
	}
	return stats;
}

function canViewFullProfile({ privacy, viewerUserId, ownerUserId, isFriend }) {
	if (!privacy) return true;
	if (viewerUserId && String(viewerUserId) === String(ownerUserId)) return true;
	if (privacy.profileVisibility === "public") return true;
	if (privacy.profileVisibility === "friends_only" && isFriend) return true;
	return false;
}

function toSearchProfile(user) {
	return {
		uid: user.mr5Uid,
		name: user.name,
		role: user.role,
		roleLabel: mapRoleLabel(user.role),
		profileImage: pickProfileImage(user),
		href: `/u/${user.mr5Uid}`,
	};
}

function toSearchCourse(course) {
	return {
		id: String(course._id),
		title: course.title,
		slug: course.slug,
		thumbnail: course.thumbnail || course.imageUrl || null,
		level: course.level,
		href: `/course/${course._id}`,
	};
}

export async function ensureIdentityForUser(user) {
	if (!user.mr5Uid) {
		user.mr5Uid = await generateUniqueMr5Uid(user.role);
		await user.save();
	}
	await Promise.all([getOrCreatePrivacy(user._id), getOrCreateStats(user._id)]);
	return user.mr5Uid;
}

export async function searchAcademic({ query, limit = 8, viewerUserId = null }) {
	const started = Date.now();
	const trimmed = typeof query === "string" ? query.trim() : "";
	if (!trimmed) {
		return {
			intent: "empty",
			profiles: [],
			courses: [],
			suggestions: [],
			meta: { tookMs: Date.now() - started },
		};
	}

	const cacheKey = `identity:search:${trimmed.toLowerCase()}:${limit}`;
	const cached = cache.get(cacheKey);
	if (cached) {
		return { ...cached, meta: { ...cached.meta, cached: true, tookMs: Date.now() - started } };
	}

	if (isMr5UidInput(trimmed)) {
		const normalized = normalizeMr5Uid(trimmed);
		let profiles = [];
		if (normalized) {
			const user = await User.findOne({ mr5Uid: normalized, isActive: true })
				.select(PUBLIC_USER_SELECT)
				.lean();
			if (user) profiles = [toSearchProfile(user)];
		} else {
			const partial = new RegExp(`^${escapeRegex(trimmed.toUpperCase())}`);
			const users = await User.find({ mr5Uid: partial, isActive: true })
				.select(PUBLIC_USER_SELECT)
				.limit(limit)
				.lean();
			profiles = users.map(toSearchProfile);
		}

		const payload = {
			intent: "uid",
			profiles,
			courses: [],
			suggestions: profiles.map((profile) => ({
				type: "profile",
				label: profile.name,
				subLabel: profile.uid,
				href: profile.href,
			})),
			meta: { tookMs: Date.now() - started },
		};
		cache.set(cacheKey, payload, 30_000);
		return payload;
	}

	const escaped = escapeRegex(trimmed);
	const nameRegex = new RegExp(escaped, "i");

	const [users, courses] = await Promise.all([
		User.find({
			isActive: true,
			mr5Uid: { $exists: true, $ne: null },
			$or: [{ name: nameRegex }, { mr5Uid: nameRegex }],
		})
			.select(PUBLIC_USER_SELECT)
			.limit(Math.min(limit, 12))
			.lean(),
		Course.find({
			isApproved: true,
			$or: [{ title: nameRegex }, { description: nameRegex }, { category: nameRegex }],
		})
			.select("title slug thumbnail imageUrl level")
			.limit(Math.min(limit, 5))
			.lean(),
	]);

	const searchableUsers = [];
	for (const user of users) {
		if (await isProfileSearchable(user._id, viewerUserId)) {
			searchableUsers.push(user);
		}
		if (searchableUsers.length >= Math.min(limit, 5)) break;
	}

	const profiles = searchableUsers.map(toSearchProfile);
	const courseResults = courses.map(toSearchCourse);
	const suggestions = [
		...profiles.map((profile) => ({
			type: "profile",
			label: profile.name,
			subLabel: profile.uid,
			href: profile.href,
		})),
		...courseResults.map((course) => ({
			type: "course",
			label: course.title,
			subLabel: course.level || "Course",
			href: course.href,
		})),
	].slice(0, limit);

	const payload = {
		intent: "mixed",
		profiles,
		courses: courseResults,
		suggestions,
		meta: { tookMs: Date.now() - started },
	};
	cache.set(cacheKey, payload, 30_000);
	return payload;
}

export async function getPublicProfileByUid(uid, viewerUserId = null) {
	const normalized = normalizeMr5Uid(uid);
	if (!normalized) {
		const error = new Error("Invalid MR5 UID format");
		error.statusCode = 400;
		throw error;
	}

	const cacheKey = `identity:profile:${normalized}:${viewerUserId || "anon"}`;
	const cached = cache.get(cacheKey);
	if (cached) return cached;

	const user = await User.findOne({ mr5Uid: normalized, isActive: true })
		.select(PUBLIC_USER_SELECT)
		.lean();

	if (!user) {
		const error = new Error("Profile not found");
		error.statusCode = 404;
		throw error;
	}

	const [privacy, stats, badges, certificates, friendRelation] = await Promise.all([
		getOrCreatePrivacy(user._id),
		getOrCreateStats(user._id),
		UserBadge.find({ user: user._id, visible: true }).sort({ earnedAt: -1 }).lean(),
		UserCertificate.find({ user: user._id }).sort({ issuedAt: -1 }).lean(),
		getFriendRelation(viewerUserId, user._id),
	]);

	const isOwner = viewerUserId && String(viewerUserId) === String(user._id);
	const isFriend = friendRelation.isFriend;
	const canView = canViewFullProfile({
		privacy,
		viewerUserId,
		ownerUserId: user._id,
		isFriend,
	});

	const base = {
		uid: user.mr5Uid,
		name: user.name,
		role: user.role,
		roleLabel: mapRoleLabel(user.role),
		profileImage: pickProfileImage(user),
		coverImage: user.coverImageUrl || null,
		joinedAt: user.createdAt,
		visibility: privacy.profileVisibility,
		isOwner: Boolean(isOwner),
		isFriend,
		friendPending: friendRelation.pending,
		friendRequestId: friendRelation.requestId || null,
		qrIdentityReady: true,
		academicPassportReady: true,
	};

	if (!canView) {
		const payload = {
			...base,
			name: privacy.profileVisibility === "private" ? "Private Profile" : user.name,
			profileImage: privacy.profileVisibility === "private" ? null : pickProfileImage(user),
			private: true,
			message:
				privacy.profileVisibility === "friends_only"
					? "This profile is visible to friends only."
					: "This profile is private.",
		};
		cache.set(cacheKey, payload, 15_000);
		return payload;
	}

	const payload = {
		...base,
		level: privacy.showXp ? stats.level : undefined,
		xp: privacy.showXp ? stats.xp : undefined,
		studyStreak: privacy.showStreak ? stats.studyStreak : undefined,
		consistencyScore: privacy.showStreak ? stats.consistencyScore : undefined,
		completedCourses: privacy.showCourses ? stats.completedCourses : undefined,
		badges: privacy.showBadges
			? badges
					.map((badge) => {
						const catalog = BADGE_BY_ID[badge.badgeId];
						if (!catalog) return null;
						return {
							id: badge.badgeId,
							name: catalog.name,
							description: catalog.description,
							icon: catalog.icon,
							earnedAt: badge.earnedAt,
						};
					})
					.filter(Boolean)
			: [],
		certificates: privacy.showCertificates
			? certificates.map((cert) => ({
					verificationId: cert.verificationId,
					title: cert.title,
					issuedAt: cert.issuedAt,
					verifyHref: `/certificate/${cert.verificationId}`,
				}))
			: [],
		projects: privacy.showProjects ? stats.projects || [] : [],
		achievements: privacy.showAchievements ? stats.achievements || [] : [],
	};

	cache.set(cacheKey, payload, 15_000);
	return payload;
}

export async function verifyCertificate(verificationId) {
	const cert = await UserCertificate.findOne({ verificationId })
		.populate({ path: "user", select: PUBLIC_USER_SELECT })
		.lean();

	if (!cert || !cert.user) {
		const error = new Error("Certificate not found");
		error.statusCode = 404;
		throw error;
	}

	return {
		valid: true,
		verificationId: cert.verificationId,
		title: cert.title,
		issuedAt: cert.issuedAt,
		recipient: {
			uid: cert.user.mr5Uid,
			name: cert.user.name,
			roleLabel: mapRoleLabel(cert.user.role),
			profileHref: `/u/${cert.user.mr5Uid}`,
		},
		watermarkHash: cert.watermarkHash || null,
	};
}

export async function updatePrivacySettings(userId, updates) {
	const allowed = [
		"profileVisibility",
		"showXp",
		"showStreak",
		"showBadges",
		"showCertificates",
		"showCourses",
		"showProjects",
		"showAchievements",
	];
	const payload = {};
	for (const key of allowed) {
		if (updates[key] !== undefined) payload[key] = updates[key];
	}

	if (payload.profileVisibility) {
		const valid = ["public", "friends_only", "private"];
		if (!valid.includes(payload.profileVisibility)) {
			const error = new Error("Invalid profile visibility");
			error.statusCode = 400;
			throw error;
		}
	}

	const settings = await UserPrivacySettings.findOneAndUpdate(
		{ user: userId },
		{ $set: payload },
		{ upsert: true, new: true, setDefaultsOnInsert: true },
	).lean();

	const user = await User.findById(userId).select("mr5Uid").lean();
	if (user?.mr5Uid) cache.deleteByPrefix(`identity:profile:${user.mr5Uid}:`);
	cache.deleteByPrefix("identity:search:");
	return settings;
}

export async function getPrivacySettings(userId) {
	return getOrCreatePrivacy(userId);
}

export async function sendFriendRequest(requesterId, recipientUid) {
	const normalized = normalizeMr5Uid(recipientUid);
	if (!normalized) {
		const error = new Error("Invalid recipient UID");
		error.statusCode = 400;
		throw error;
	}

	const recipient = await User.findOne({ mr5Uid: normalized, isActive: true }).select("_id mr5Uid name");
	if (!recipient) {
		const error = new Error("Recipient not found");
		error.statusCode = 404;
		throw error;
	}

	if (String(recipient._id) === String(requesterId)) {
		const error = new Error("Cannot send a friend request to yourself");
		error.statusCode = 400;
		throw error;
	}

	const existing = await IdentityFriend.findOne({
		$or: [
			{ requester: requesterId, recipient: recipient._id },
			{ requester: recipient._id, recipient: requesterId },
		],
	});

	if (existing) {
		const error = new Error(
			existing.status === "accepted"
				? "You are already friends"
				: existing.status === "pending"
					? "Friend request already pending"
					: "Unable to send friend request",
		);
		error.statusCode = existing.status === "blocked" ? 403 : 409;
		throw error;
	}

	const request = await IdentityFriend.create({
		requester: requesterId,
		recipient: recipient._id,
		status: "pending",
	});

	const requester = await User.findById(requesterId).select("name mr5Uid").lean();
	await createIdentityNotification({
		userId: recipient._id,
		actorId: requesterId,
		type: "friend_request",
		scope: "personal",
		title: "Friend request",
		message: `${requester?.name || "Someone"} sent you a friend request.`,
		href: "/profile?tab=friends",
		metadata: { requestId: String(request._id), requesterUid: requester?.mr5Uid },
	});

	return request;
}

export async function respondFriendRequest(userId, requestId, action) {
	const request = await IdentityFriend.findById(requestId);
	if (!request) {
		const error = new Error("Friend request not found");
		error.statusCode = 404;
		throw error;
	}

	if (String(request.recipient) !== String(userId)) {
		const error = new Error("Not authorized to respond to this request");
		error.statusCode = 403;
		throw error;
	}

	if (action === "accept") {
		request.status = "accepted";
		const accepter = await User.findById(userId).select("name mr5Uid").lean();
		await createIdentityNotification({
			userId: request.requester,
			actorId: userId,
			type: "friend_accepted",
			scope: "personal",
			title: "Friend request accepted",
			message: `${accepter?.name || "Someone"} accepted your friend request.`,
			href: accepter?.mr5Uid ? `/u/${accepter.mr5Uid}` : "/profile?tab=friends",
			metadata: { requestId: String(request._id) },
		});
	} else if (action === "decline") await request.deleteOne();
	else if (action === "block") request.status = "blocked";
	else {
		const error = new Error("Invalid friend request action");
		error.statusCode = 400;
		throw error;
	}

	if (action !== "decline") await request.save();
	return request;
}

export async function listFriendRequests(userId) {
	return IdentityFriend.find({
		$or: [{ recipient: userId }, { requester: userId }],
		status: { $in: ["pending", "accepted"] },
	})
		.populate("requester", "name mr5Uid profileImage avatarUrl")
		.populate("recipient", "name mr5Uid profileImage avatarUrl")
		.sort({ updatedAt: -1 })
		.lean();
}

export {
	listNotifications,
	markNotificationRead,
	markAllNotificationsRead,
	getGlobalLeaderboardFeed,
};
