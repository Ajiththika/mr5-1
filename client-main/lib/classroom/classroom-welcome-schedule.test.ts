import {
	classroomWelcomeDayKey,
	markClassroomWelcomePlayed,
	resetClassroomWelcomeSchedule,
	shouldPlayClassroomWelcome,
} from "./classroom-welcome-schedule";

describe("classroom-welcome-schedule", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("allows welcome on first class visit of the day", () => {
		expect(shouldPlayClassroomWelcome(new Date(2026, 5, 30, 9, 0))).toBe(true);
	});

	it("blocks repeat welcome after it was played today", () => {
		const today = new Date(2026, 5, 30, 9, 0);
		markClassroomWelcomePlayed(today);
		expect(shouldPlayClassroomWelcome(today)).toBe(false);
	});

	it("allows welcome again on the next calendar day", () => {
		markClassroomWelcomePlayed(new Date(2026, 5, 30, 23, 59));
		expect(shouldPlayClassroomWelcome(new Date(2026, 6, 1, 8, 0))).toBe(true);
	});

	it("resets schedule for testing", () => {
		markClassroomWelcomePlayed();
		resetClassroomWelcomeSchedule();
		expect(shouldPlayClassroomWelcome()).toBe(true);
	});

	it("uses stable day keys", () => {
		expect(classroomWelcomeDayKey(new Date(2026, 0, 15, 23, 59))).toBe("2026-0-15");
	});
});
