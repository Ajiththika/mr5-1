import UserLearningStats from "../models/UserLearningStats.js";
import UserBadge from "../models/UserBadge.js";
import UserCertificate from "../models/UserCertificate.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { BADGE_BY_ID } from "../config/badgeCatalog.js";
import cache from "../utils/cache.js";
import {
	createIdentityNotification,
	notifyFriendsOfAchievement,
	generateVerificationId,
	generateWatermarkHash,
} from "./identityNotificationService.js";

const XP_PER_LESSON = 25;
const XP_PER_COURSE = 150;
const XP_PER_LEVEL = 500;

function levelFromXp(xp) {
	return Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

function invalidateProfileCache(mr5Uid) {
	if (!mr5Uid) return;
	cache.deleteByPrefix(`identity:profile:${mr5Uid}:`);
}

async function getStats(userId) {
	let stats = await UserLearningStats.findOne({ user: userId });
	if (!stats) {
		const completedCourses = await Enrollment.countDocuments({
			student: userId,
			status: "completed",
		});
		stats = await UserLearningStats.create({ user: userId, completedCourses });
	}
	return stats;
}

async function awardBadge(userId, badgeId, userDoc) {
	if (!BADGE_BY_ID[badgeId]) return null;
	const existing = await UserBadge.findOne({ user: userId, badgeId });
	if (existing) return null;

	const badge = await UserBadge.create({ user: userId, badgeId, visible: true });
	const catalog = BADGE_BY_ID[badgeId];

	await createIdentityNotification({
		userId,
		type: "badge_earned",
		scope: "personal",
		title: "Badge earned",
		message: `You earned "${catalog.name}".`,
		href: userDoc?.mr5Uid ? `/u/${userDoc.mr5Uid}` : null,
		icon: catalog.icon,
		metadata: { badgeId },
	});

	await notifyFriendsOfAchievement(userId, {
		type: "badge_earned",
		title: "Friend earned a badge",
		message: `${userDoc?.name || "A friend"} earned "${catalog.name}".`,
		href: userDoc?.mr5Uid ? `/u/${userDoc.mr5Uid}` : null,
		icon: catalog.icon,
		metadata: { badgeId },
	});

	return badge;
}

export async function recordLessonActivity(userId) {
	const stats = await getStats(userId);
	const user = await User.findById(userId).select("name mr5Uid").lean();

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const lastActive = stats.lastActiveAt ? new Date(stats.lastActiveAt) : null;
	let streak = stats.studyStreak || 0;

	if (!lastActive) {
		streak = 1;
	} else {
		const lastDay = new Date(lastActive);
		lastDay.setHours(0, 0, 0, 0);
		const diffDays = Math.round((today - lastDay) / (24 * 60 * 60 * 1000));
		if (diffDays === 1) streak += 1;
		else if (diffDays > 1) streak = 1;
	}

	const previousLevel = stats.level;
	stats.xp = (stats.xp || 0) + XP_PER_LESSON;
	stats.level = levelFromXp(stats.xp);
	stats.studyStreak = streak;
	stats.consistencyScore = Math.min(100, streak * 2);
	stats.lastActiveAt = new Date();
	await stats.save();

	if (stats.level > previousLevel) {
		await createIdentityNotification({
			userId,
			type: "level_up",
			scope: "personal",
			title: "Level up",
			message: `You reached Level ${stats.level}.`,
			href: user?.mr5Uid ? `/u/${user.mr5Uid}` : null,
			metadata: { level: stats.level },
		});
		await notifyFriendsOfAchievement(userId, {
			type: "level_up",
			title: "Friend leveled up",
			message: `${user?.name || "A friend"} reached Level ${stats.level}.`,
			href: user?.mr5Uid ? `/u/${user.mr5Uid}` : null,
			metadata: { level: stats.level },
		});
	}

	if (streak >= 7) await awardBadge(userId, "consistency_master", user);
	if (streak >= 30) await awardBadge(userId, "perfect_attendance", user);

	invalidateProfileCache(user?.mr5Uid);
	return stats;
}

export async function recordCourseCompletion(userId, courseId) {
	const [stats, user, course, completedCount] = await Promise.all([
		getStats(userId),
		User.findById(userId).select("name mr5Uid role").lean(),
		Course.findById(courseId).select("title category").lean(),
		Enrollment.countDocuments({ student: userId, status: "completed" }),
	]);

	if (!user || !course) return null;

	const previousLevel = stats.level;
	stats.xp = (stats.xp || 0) + XP_PER_COURSE;
	stats.level = levelFromXp(stats.xp);
	stats.completedCourses = completedCount;
	stats.lastActiveAt = new Date();
	await stats.save();

	const verificationId = generateVerificationId();
	const watermarkHash = generateWatermarkHash(verificationId, userId, course.title);

	const certificate = await UserCertificate.create({
		user: userId,
		course: courseId,
		verificationId,
		title: `${course.title} — MR5 School Certificate`,
		watermarkHash,
	});

	await createIdentityNotification({
		userId,
		type: "certificate_earned",
		scope: "personal",
		title: "Certificate earned",
		message: `You completed "${course.title}".`,
		href: `/certificate/${verificationId}`,
		metadata: { certificateTitle: course.title, verificationId },
	});

	await createIdentityNotification({
		userId,
		type: "course_completed",
		scope: "personal",
		title: "Course completed",
		message: `You finished "${course.title}".`,
		href: `/course/${courseId}`,
		metadata: { courseId: String(courseId) },
	});

	await notifyFriendsOfAchievement(userId, {
		type: "course_completed",
		title: "Friend completed a course",
		message: `${user.name} completed "${course.title}".`,
		href: user.mr5Uid ? `/u/${user.mr5Uid}` : null,
		metadata: { courseTitle: course.title },
	});

	if (stats.level > previousLevel) {
		await notifyFriendsOfAchievement(userId, {
			type: "level_up",
			title: "Friend leveled up",
			message: `${user.name} reached Level ${stats.level}.`,
			href: user.mr5Uid ? `/u/${user.mr5Uid}` : null,
			metadata: { level: stats.level },
		});
	}

	if (completedCount >= 1) await awardBadge(userId, "course_champion", user);
	if (completedCount >= 5) await awardBadge(userId, "top_learner", user);
	if ((course.category || "").toLowerCase().includes("math")) {
		await awardBadge(userId, "math_genius", user);
	}
	if ((course.category || "").toLowerCase().includes("science")) {
		await awardBadge(userId, "science_expert", user);
	}
	if ((course.title || "").toLowerCase().includes("ai")) {
		await awardBadge(userId, "ai_explorer", user);
	}
	if ((course.title || "").toLowerCase().includes("code")) {
		await awardBadge(userId, "coding_hero", user);
	}

	invalidateProfileCache(user.mr5Uid);
	return { stats, certificate };
}
