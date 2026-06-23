import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import dotenv from "dotenv";

dotenv.config();

const STUDENT = {
	email: process.env.TEST_STUDENT_EMAIL || "student@mr5school.com",
	password: process.env.TEST_STUDENT_PASSWORD || "Student@123456",
};

let authCookie = "";
let mongoAvailable = false;

beforeAll(async () => {
	const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
	if (!mongoUri) return;

	try {
		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, bufferCommands: false });
		}
		mongoAvailable = true;
		const loginRes = await request(app).post("/api/auth/login").send(STUDENT);
		if (loginRes.statusCode === 200) {
			const cookies = loginRes.headers["set-cookie"];
			if (cookies) {
				authCookie = cookies.map((c) => c.split(";")[0]).join("; ");
			}
		}
	} catch {
		console.warn("MongoDB unavailable — skipping DB-dependent progress tests");
	}
}, 10000);

afterAll(async () => {
	if (mongoAvailable) {
		await mongoose.connection.close();
	}
});

describe("Progress API", () => {
	it("returns 401 without authentication", async () => {
		const res = await request(app).post(
			"/api/progress/lessons/507f1f77bcf86cd799439011/complete",
		);
		expect(res.statusCode).toBe(401);
	});

	it("returns 404 for non-existent lesson when authenticated", async () => {
		if (!mongoAvailable || !authCookie) return;
		const res = await request(app)
			.post("/api/progress/lessons/507f1f77bcf86cd799439011/complete")
			.set("Cookie", authCookie);
		expect([403, 404]).toContain(res.statusCode);
	});
});
