import {
	DEFAULT_SCHOOL_TIMEZONE,
	resolveClockTimezone,
	resolveTimezoneFromCountry,
} from "./school-schedule";

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
});
