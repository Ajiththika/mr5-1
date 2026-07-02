import {
	DEFAULT_SCHOOL_TIMEZONE,
	resolveClockTimezone,
	resolveTimezoneFromCountry,
} from "./school-schedule";
import { getSchoolClockAngles } from "@/hooks/useSchoolClock";

describe("school-schedule", () => {
	it("defaults to Asia/Colombo", () => {
		expect(DEFAULT_SCHOOL_TIMEZONE).toBe("Asia/Colombo");
	});

	it("resolves Sri Lanka country aliases", () => {
		expect(resolveTimezoneFromCountry("lk")).toBe("Asia/Colombo");
		expect(resolveTimezoneFromCountry("Sri Lanka")).toBe("Asia/Colombo");
	});

	it("prefers explicit timezone over country", () => {
		expect(resolveTimezoneFromCountry("lk", "Europe/Amsterdam")).toBe(
			"Europe/Amsterdam",
		);
	});

	it("resolves clock timezone with location and browser fallbacks", () => {
		expect(resolveClockTimezone(null, "America/New_York", null)).toBe(
			"America/New_York",
		);
		expect(resolveClockTimezone("lk", null, "Europe/London")).toBe("Asia/Colombo");
		expect(resolveClockTimezone(null, null, "Europe/London")).toBe("Europe/London");
	});

	it("computes analog clock hand angles from timezone", () => {
		const noon = new Date("2026-01-15T12:00:00Z");
		const angles = getSchoolClockAngles("UTC", noon);
		expect(angles.hour).toBeCloseTo(0);
		expect(angles.minute).toBeCloseTo(0);
		expect(angles.second).toBeCloseTo(0);

		const threePm = new Date("2026-01-15T15:00:00Z");
		expect(getSchoolClockAngles("UTC", threePm).hour).toBeCloseTo(Math.PI / 2);
	});
});
