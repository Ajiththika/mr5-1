import {
	isMr5UidInput,
	normalizeMr5Uid,
	profilePath,
	certificatePath,
	resolveSearchNavigation,
} from "@/lib/identity/uid";

describe("Global Academic Search — UID helpers", () => {
	it("detects MR5 UID prefix for profile search routing", () => {
		expect(isMr5UidInput("MR5-STU-ABC")).toBe(true);
		expect(isMr5UidInput("mr5-tch-abc123")).toBe(true);
		expect(isMr5UidInput("mr5-adm")).toBe(true);
		expect(isMr5UidInput("Machine Learning")).toBe(false);
	});

	it("normalizes valid UID formats", () => {
		expect(normalizeMr5Uid("mr5-stu-abc123")).toBe("MR5-STU-ABC123");
		expect(normalizeMr5Uid("MR5-TCH-XYZ789")).toBe("MR5-TCH-XYZ789");
		expect(normalizeMr5Uid("MR5-ADM-001X99")).toBe("MR5-ADM-001X99");
		expect(normalizeMr5Uid("invalid")).toBeNull();
	});

	it("builds profile and certificate paths", () => {
		expect(profilePath("MR5-STU-ABC123")).toBe("/u/MR5-STU-ABC123");
		expect(certificatePath("cert-abc-123")).toBe("/certificate/cert-abc-123");
	});

	it("routes UID searches to public profile pages", () => {
		expect(resolveSearchNavigation("MR5-ADM-ABC123")).toBe("/u/MR5-ADM-ABC123");
	});

	it("routes partial UID to uid search mode", () => {
		expect(resolveSearchNavigation("MR5-STU")).toBe("/courses?search=MR5-STU&mode=uid");
	});

	it("routes mixed searches to courses", () => {
		expect(resolveSearchNavigation("Alex Rivera")).toBe(
			"/courses?search=Alex%20Rivera&mode=mixed",
		);
	});
});
