const CLASSROOM_WELCOME_DATE_KEY = "mr5_classroom_welcome_date";

/** Local calendar day key (YYYY-M-D) for once-per-day classroom welcome. */
export function classroomWelcomeDayKey(date = new Date()): string {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** True only the first time the student enters class on a given calendar day. */
export function shouldPlayClassroomWelcome(now = new Date()): boolean {
	if (typeof window === "undefined") return false;
	try {
		const stored = localStorage.getItem(CLASSROOM_WELCOME_DATE_KEY);
		return stored !== classroomWelcomeDayKey(now);
	} catch {
		return false;
	}
}

export function markClassroomWelcomePlayed(now = new Date()): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(CLASSROOM_WELCOME_DATE_KEY, classroomWelcomeDayKey(now));
	} catch {
		/* ignore storage errors */
	}
}

export function resetClassroomWelcomeSchedule(): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(CLASSROOM_WELCOME_DATE_KEY);
	} catch {
		/* ignore */
	}
}
