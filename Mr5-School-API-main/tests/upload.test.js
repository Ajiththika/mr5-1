import request from "supertest";
import app from "../src/app.js";

describe("Upload / Cloudinary config", () => {
	test("GET /api/upload/config returns public cloudinary status", async () => {
		const res = await request(app).get("/api/upload/config");
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toHaveProperty("configured");
		expect(res.body.data).toHaveProperty("cloudName");
	});

	test("POST /api/upload requires authentication", async () => {
		const res = await request(app).post("/api/upload");
		expect(res.status).toBe(401);
	});
});
