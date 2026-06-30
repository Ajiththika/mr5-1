import {
	sanitizeAuthErrorMessage,
	AUTH_INVALID_MESSAGE,
	AUTH_LOCKED_MESSAGE,
} from "./auth-security";

describe("auth-security", () => {
	it("maps 401 to generic invalid message", () => {
		const msg = sanitizeAuthErrorMessage({
			response: { status: 401, data: { message: "Your account has been deactivated" } },
		});
		expect(msg).toBe(AUTH_INVALID_MESSAGE);
	});

	it("maps 429 to lockout message", () => {
		const msg = sanitizeAuthErrorMessage({
			response: { status: 429, data: { message: "Too many" } },
		});
		expect(msg).toBe(AUTH_LOCKED_MESSAGE);
	});
});
