import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import {
	INVALID_CREDENTIALS_MESSAGE,
	FORGOT_PASSWORD_MESSAGE,
	REGISTRATION_FAILED_MESSAGE,
} from "../src/constants/authMessages.js";

describe("Auth Endpoints", () => {
	it("POST /api/auth/login rejects empty credentials", async () => {
		const res = await request(app).post("/api/auth/login").send({});
		expect([400, 401]).toContain(res.statusCode);
	});

	it("returns identical message for missing user and wrong password", async () => {
		const missing = await request(app)
			.post("/api/auth/login")
			.send({ email: "nonexistent@mr5school.com", password: "WrongPass123!" });

		expect(missing.statusCode).toBe(401);
		expect(missing.body.message).toBe(INVALID_CREDENTIALS_MESSAGE);

		const wrong = await request(app)
			.post("/api/auth/login")
			.send({ email: "student@mr5school.com", password: "WrongPass123!" });

		expect(wrong.statusCode).toBe(401);
		expect(wrong.body.message).toBe(INVALID_CREDENTIALS_MESSAGE);
	});

	it("does not reveal deactivated account status", async () => {
		const user = await User.findOne({ email: "student@mr5school.com" });
		if (!user) return;

		const prev = user.isActive;
		user.isActive = false;
		await user.save({ validateBeforeSave: false });

		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: "student@mr5school.com", password: "Student@123456" });

		expect(res.statusCode).toBe(401);
		expect(res.body.message).toBe(INVALID_CREDENTIALS_MESSAGE);
		expect(res.body.message).not.toMatch(/deactivat/i);

		user.isActive = prev;
		await user.save({ validateBeforeSave: false });
	});

	it("forgot password returns same message for unknown email", async () => {
		const res = await request(app)
			.post("/api/auth/forgotpassword")
			.send({ email: "unknown-user@mr5school.com" });

		expect(res.statusCode).toBe(200);
		expect(res.body.data).toBe(FORGOT_PASSWORD_MESSAGE);
	});

	it("register uses generic message for duplicate email", async () => {
		const res = await request(app).post("/api/auth/register").send({
			name: "Dup User",
			email: "student@mr5school.com",
			password: "Student@123456",
			acceptLegal: true,
		});

		expect(res.statusCode).toBe(400);
		expect(res.body.message).toBe(REGISTRATION_FAILED_MESSAGE);
	});
});
