export type ProfileVisibility = "public" | "friends_only" | "private";

export type IdentityRole = "student" | "AI-TEACHER" | "admin";

export interface SearchSuggestion {
	type: "profile" | "course";
	label: string;
	subLabel?: string;
	href: string;
}

export interface SearchProfileResult {
	uid: string;
	name: string;
	role: IdentityRole;
	roleLabel: string;
	profileImage: string | null;
	href: string;
}

export interface SearchCourseResult {
	id: string;
	title: string;
	slug?: string;
	thumbnail?: string | null;
	level?: string;
	href: string;
}

export interface AcademicSearchResponse {
	intent: "empty" | "uid" | "mixed";
	profiles: SearchProfileResult[];
	courses: SearchCourseResult[];
	suggestions: SearchSuggestion[];
	meta?: {
		tookMs?: number;
		cached?: boolean;
	};
}

export interface PublicBadge {
	id: string;
	name: string;
	description: string;
	icon: string;
	earnedAt: string;
}

export interface PublicCertificate {
	verificationId: string;
	title: string;
	issuedAt: string;
	verifyHref: string;
}

export interface PublicProject {
	title: string;
	summary?: string;
	url?: string;
	thumbnailUrl?: string;
	completedAt?: string;
}

export interface PublicAchievement {
	title: string;
	description?: string;
	earnedAt?: string;
	icon?: string;
}

export interface PublicProfile {
	uid: string;
	name: string;
	role: IdentityRole;
	roleLabel: string;
	profileImage: string | null;
	coverImage: string | null;
	joinedAt: string;
	visibility: ProfileVisibility;
	isOwner?: boolean;
	isFriend?: boolean;
	friendPending?: "incoming" | "outgoing" | "blocked" | null;
	friendRequestId?: string | null;
	private?: boolean;
	message?: string;
	level?: number;
	xp?: number;
	studyStreak?: number;
	consistencyScore?: number;
	completedCourses?: number;
	badges?: PublicBadge[];
	certificates?: PublicCertificate[];
	projects?: PublicProject[];
	achievements?: PublicAchievement[];
	qrIdentityReady?: boolean;
	academicPassportReady?: boolean;
}

export interface CertificateVerification {
	valid: boolean;
	verificationId: string;
	title: string;
	issuedAt: string;
	recipient: {
		uid: string;
		name: string;
		roleLabel: string;
		profileHref: string;
	};
	watermarkHash?: string | null;
}

export interface PrivacySettings {
	profileVisibility: ProfileVisibility;
	showXp: boolean;
	showStreak: boolean;
	showBadges: boolean;
	showCertificates: boolean;
	showCourses: boolean;
	showProjects: boolean;
	showAchievements: boolean;
}

export interface IdentityFriendRecord {
	_id: string;
	status: "pending" | "accepted" | "blocked";
	requester: { _id: string; name: string; mr5Uid: string; profileImage?: string; avatarUrl?: string };
	recipient: { _id: string; name: string; mr5Uid: string; profileImage?: string; avatarUrl?: string };
	createdAt: string;
	updatedAt: string;
}

export type IdentityNotificationScope = "global" | "friends" | "personal";

export interface IdentityNotification {
	_id: string;
	type: string;
	scope: IdentityNotificationScope;
	title: string;
	message: string;
	href?: string;
	icon?: string;
	read: boolean;
	createdAt: string;
	actor?: { name?: string; mr5Uid?: string; profileImage?: string; avatarUrl?: string };
	metadata?: Record<string, unknown>;
}

export interface LeaderboardFeed {
	topLearners: Array<{
		rank: number;
		uid?: string;
		name?: string;
		xp: number;
		level: number;
		profileImage?: string | null;
		href?: string | null;
	}>;
	streakLeaders: Array<{
		uid?: string;
		name?: string;
		studyStreak: number;
		href?: string | null;
	}>;
	recentCertificates: Array<{
		name?: string;
		uid?: string;
		title?: string;
		href?: string;
	}>;
}
