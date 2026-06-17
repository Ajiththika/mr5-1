import request from "supertest";
import app from "../src/app.js";

describe("Auth Endpoints", () => {
	it("POST /api/auth/login rejects empty credentials", async () => {
		const res = await request(app).post("/api/auth/login").send({});
		expect([400, 401]).toContain(res.statusCode);
	});
});
