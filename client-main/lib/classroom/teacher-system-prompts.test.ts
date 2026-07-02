import {
	TEACHER_PROMPT_SLUGS,
	TEACHER_SYSTEM_PROMPTS,
	getTeacherSystemPrompt,
	resolveTeacherSystemPrompt,
} from "./teacher-system-prompts";

describe("teacher-system-prompts", () => {
	it("includes all catalog teacher slugs", () => {
		const expected = [
			"teacher_default",
			"teacher_joe",
			"teacher_roger",
			"teacher_manuel",
			"teacher_creep",
			"teacher_sophia_fashion",
			"teacher_einstein",
			"teacher_sophia",
			"teacher_engineer",
			"teacher_physics",
			"teacher_history",
			"teacher_tamil",
		];
		expect(TEACHER_PROMPT_SLUGS.sort()).toEqual(expected.sort());
	});

	it("returns CO-STAR structured production prompts", () => {
		for (const slug of TEACHER_PROMPT_SLUGS) {
			const prompt = getTeacherSystemPrompt(slug);
			expect(prompt).toContain("ROLE:");
			expect(prompt).toContain("OBJECTIVE:");
			expect(prompt).toContain("[SYSTEM:");
			expect(prompt).toContain("ANTI-HALLUCINATION");
		}
	});

	it("manuel prompt includes dance animation triggers", () => {
		const prompt = getTeacherSystemPrompt("teacher_manuel");
		expect(prompt).toContain("PLAY_ANIMATION: dance");
		expect(TEACHER_SYSTEM_PROMPTS.teacher_manuel.states).toContain("performing");
	});

	it("falls back to default for unknown slug", () => {
		expect(getTeacherSystemPrompt("unknown_teacher")).toBe(
			getTeacherSystemPrompt("teacher_default"),
		);
	});

	it("prefers API-provided systemPrompt on teacher item", () => {
		const custom = "CUSTOM PROMPT";
		expect(
			resolveTeacherSystemPrompt({
				_id: "1",
				teacherSlug: "teacher_joe",
				name: "Joe",
				description: "",
				type: "teacher_avatar",
				priceCents: 0,
				isPremium: false,
				systemPrompt: custom,
			}),
		).toBe(custom);
	});
});
