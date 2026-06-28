export const BADGE_CATALOG = [
	{
		id: "ai_explorer",
		name: "AI Explorer",
		description: "Engaged with MR5 AI learning tools and tutors.",
		icon: "sparkles",
	},
	{
		id: "coding_hero",
		name: "Coding Hero",
		description: "Completed coding-focused coursework with strong results.",
		icon: "code",
	},
	{
		id: "future_innovator",
		name: "Future Innovator",
		description: "Showcased creative projects and forward-thinking work.",
		icon: "rocket",
	},
	{
		id: "community_helper",
		name: "Community Helper",
		description: "Supported peers across the MR5 learning community.",
		icon: "heart-handshake",
	},
	{
		id: "perfect_attendance",
		name: "Perfect Attendance",
		description: "Maintained an exceptional 30-day study streak.",
		icon: "calendar-check",
	},
	{
		id: "course_champion",
		name: "Course Champion",
		description: "Completed your first MR5 School course.",
		icon: "book-open",
	},
	{
		id: "science_expert",
		name: "Science Expert",
		description: "Excelled in science-focused coursework.",
		icon: "flask",
	},
	{
		id: "math_genius",
		name: "Math Genius",
		description: "Mastered mathematics learning paths.",
		icon: "calculator",
	},
	{
		id: "consistency_master",
		name: "Consistency Master",
		description: "Maintained a 7-day learning streak.",
		icon: "flame",
	},
	{
		id: "top_learner",
		name: "Top Learner",
		description: "Reached high XP and completed 5+ courses.",
		icon: "trophy",
	},
];

/** @type {Record<string, typeof BADGE_CATALOG[number]>} */
export const BADGE_BY_ID = Object.fromEntries(
	BADGE_CATALOG.map((badge) => [badge.id, badge]),
);
