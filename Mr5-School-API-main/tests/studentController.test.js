import studentController from "../src/controllers/studentController.js";

describe("studentController compatibility shim", () => {
	it("re-exports student learning controller handlers", () => {
		expect(studentController).toBeDefined();
		expect(typeof studentController.getLearningProfile).toBe("function");
		expect(typeof studentController.updateLearningProfile).toBe("function");
		expect(typeof studentController.getChatMemory).toBe("function");
		expect(typeof studentController.appendChatMemory).toBe("function");
		expect(typeof studentController.getAiContext).toBe("function");
	});
});
