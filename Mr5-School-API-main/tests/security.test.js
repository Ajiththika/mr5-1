import request from "supertest";
import app from "../src/app.js";

describe("Security — protected routes return 401 without token", () => {
	const protectedRoutes = [
		{ method: "get", path: "/api/assignments" },
		{ method: "post", path: "/api/submissions" },
		{ method: "get", path: "/api/payments" },
		{ method: "post", path: "/api/livekit/token" },
		{ method: "post", path: "/api/tts/speak" },
		{ method: "get", path: "/api/ai-assistant-interactions" },
		{ method: "get", path: "/api/admin/stats" },
		{ method: "get", path: "/api/progress/courses/507f1f77bcf86cd799439011" },
	];

	it.each(protectedRoutes)("$method $path requires auth", async ({ method, path }) => {
		const res = await request(app)[method](path);
		expect(res.statusCode).toBe(401);
	});
});

describe("Health check", () => {
	it("GET /health returns OK", async () => {
		const res = await request(app).get("/health");
		expect(res.statusCode).toBe(200);
		expect(res.body.status).toBe("OK");
	});
});

describe("Shop API", () => {
	it("GET /api/shop/inventory requires auth", async () => {
		const res = await request(app).get("/api/shop/inventory");
		expect(res.statusCode).toBe(401);
	});
});
