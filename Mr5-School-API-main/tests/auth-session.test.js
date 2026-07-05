import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import jwt from "jsonwebtoken";

describe("Auth session lifecycle", () => {
	let student;

	beforeAll(async () => {
		student = await User.findOne({ email: "student@mr5school.com" });
	});

	test("GET /api/auth/me returns 401 without token", async () => {
		const res = await request(app).get("/api/auth/me");
		expect(res.status).toBe(401);
	});

	test("GET /api/auth/me returns user with valid access token cookie", async () => {
		if (!student) return;

		const token = jwt.sign(
			{ id: student._id, type: "access" },
			process.env.JWT_SECRET,
			{ expiresIn: "15m" },
		);

		const res = await request(app)
			.get("/api/auth/me")
			.set("Cookie", [`access_token=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.email).toBe("student@mr5school.com");
	});

	test("POST /api/auth/refresh returns 401 without refresh cookie", async () => {
		const res = await request(app).post("/api/auth/refresh");
		expect(res.status).toBe(401);
		expect(res.body.error).toBe("NO_REFRESH_TOKEN");
	});

	test("POST /api/auth/login sets auth cookies and returns user", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: "student@mr5school.com", password: "Student@123456" });

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.headers["set-cookie"]).toBeDefined();
		const cookies = res.headers["set-cookie"].join(" ");
		expect(cookies).toMatch(/access_token=/);
		expect(cookies).toMatch(/refresh_token=/);
	});

	test("login → me flow works with cookies", async () => {
		const agent = request.agent(app);

		const login = await agent
			.post("/api/auth/login")
			.send({ email: "student@mr5school.com", password: "Student@123456" });

		expect(login.status).toBe(200);

		const me = await agent.get("/api/auth/me");
		expect(me.status).toBe(200);
		expect(me.body.data.email).toBe("student@mr5school.com");
	});

	test("login → logout clears session", async () => {
		const agent = request.agent(app);

		const login = await agent
			.post("/api/auth/login")
			.send({ email: "student@mr5school.com", password: "Student@123456" });
		expect(login.status).toBe(200);

		const logout = await agent.post("/api/auth/logout");
		expect(logout.status).toBe(200);

		const me = await agent.get("/api/auth/me");
		expect(me.status).toBe(401);
	});

	test("expired access token is rejected", async () => {
		if (!student) return;

		const token = jwt.sign(
			{ id: student._id, type: "access" },
			process.env.JWT_SECRET,
			{ expiresIn: "-1s" },
		);

		const res = await request(app)
			.get("/api/auth/me")
			.set("Cookie", [`access_token=${token}`]);

		expect(res.status).toBe(401);
	});
});
