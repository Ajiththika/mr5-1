import {
	DEFAULT_SEAT_ID,
	readStoredSeatId,
	SEAT_STORAGE_KEY,
	writeStoredSeatId,
} from "./seat-storage";

describe("seat-storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("exports a default seat id in valid range", () => {
		expect(DEFAULT_SEAT_ID).toBeGreaterThanOrEqual(1);
		expect(DEFAULT_SEAT_ID).toBeLessThanOrEqual(9);
	});

	it("returns null when no seat is stored", () => {
		expect(readStoredSeatId()).toBeNull();
	});

	it("persists and reads a valid seat id", () => {
		writeStoredSeatId(5);
		expect(localStorage.getItem(SEAT_STORAGE_KEY)).toBe("5");
		expect(readStoredSeatId()).toBe(5);
	});

	it("ignores invalid seat ids", () => {
		writeStoredSeatId(0);
		writeStoredSeatId(10);
		expect(readStoredSeatId()).toBeNull();
	});
});
