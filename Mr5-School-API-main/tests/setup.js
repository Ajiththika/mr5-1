import connectDB from "../src/config/db.js";
import mongoose from "mongoose";

beforeAll(async () => {
	process.env.JWT_SECRET ||= "test-jwt-secret-for-ci-only-min-32-chars";
	process.env.NODE_ENV = "test";

	// Use in-memory MongoDB in tests unless a real test database is explicitly requested.
	if (process.env.USE_REAL_MONGO_TEST !== "1") {
		delete process.env.MONGO_URI;
		delete process.env.MONGODB_URI;
	}

	await connectDB();

	if (mongoose.connection.readyState !== 1) {
		throw new Error("Test database connection failed");
	}
}, 120000);
