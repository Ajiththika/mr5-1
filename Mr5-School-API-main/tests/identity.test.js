import {
	buildMr5Uid,
	normalizeMr5Uid,
	isMr5UidInput,
	getRoleFromUid,
	getUidPrefixForRole,
} from "../src/utils/uidGenerator.js";

describe("MR5 UID generator", () => {
	it("builds valid student UID", () => {
		const uid = buildMr5Uid("student");
		expect(uid).toMatch(/^MR5-STU-[A-Z0-9]{6}$/);
	});

	it("builds valid teacher UID", () => {
		const uid = buildMr5Uid("AI-TEACHER");
		expect(uid).toMatch(/^MR5-TCH-[A-Z0-9]{6}$/);
	});

	it("builds valid admin UID", () => {
		const uid = buildMr5Uid("admin");
		expect(uid).toMatch(/^MR5-ADM-[A-Z0-9]{6}$/);
	});

	it("normalizes lowercase UID input", () => {
		expect(normalizeMr5Uid("mr5-stu-abc123")).toBe("MR5-STU-ABC123");
	});

	it("rejects invalid UID format", () => {
		expect(normalizeMr5Uid("MR5-STU-12")).toBeNull();
		expect(normalizeMr5Uid("not-a-uid")).toBeNull();
	});

	it("detects partial UID search input", () => {
		expect(isMr5UidInput("MR5-STU")).toBe(true);
		expect(isMr5UidInput("mr5-tch-abc")).toBe(true);
		expect(isMr5UidInput("Physics")).toBe(false);
	});

	it("maps UID prefix to role", () => {
		expect(getRoleFromUid("MR5-STU-ABC123")).toBe("student");
		expect(getRoleFromUid("MR5-TCH-ABC123")).toBe("AI-TEACHER");
		expect(getRoleFromUid("MR5-ADM-ABC123")).toBe("admin");
	});

	it("returns role-specific prefix", () => {
		expect(getUidPrefixForRole("admin")).toBe("MR5-ADM");
	});
});
