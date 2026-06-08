import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Cache the connection for serverless environments (Vercel)
let cachedConnection = null;
let mongoMemoryServer = null;

const buildConnectionOptions = () => ({
	// Connection pool settings for serverless
	maxPoolSize: 10,
	minPoolSize: 1,

	// Timeout settings optimized for serverless
	serverSelectionTimeoutMS: 30000,
	socketTimeoutMS: 45000,

	// Fail fast instead of buffering commands
	bufferCommands: false,

	// Additional optimizations
	maxIdleTimeMS: 10000,

	// Force IPv4 to avoid EAI_AGAIN DNS errors
	family: 4,
});

const createMemoryServer = async () => {
	if (!mongoMemoryServer) {
		mongoMemoryServer = await MongoMemoryServer.create({
			binary: { version: "7.0.0" },
		});
		console.log("Started in-memory MongoDB for development/test.");
	}
	return mongoMemoryServer;
};

const seedDevelopmentData = async () => {
	if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") return;

	const User = (await import("../models/User.js")).default;
	const Course = (await import("../models/Course.js")).default;

	const users = [
		{
			name: "Admin User",
			email: "admin@mr5school.com",
			password: "Admin@123456",
			role: "admin",
			status: "approved",
			isActive: true,
		},
		{
			name: "Test Student",
			email: "student@mr5school.com",
			password: "Student@123456",
			role: "student",
			status: "approved",
			isActive: true,
		},
	];

	for (const userData of users) {
		const existing = await User.findOne({ email: userData.email }).exec();
		if (existing) {
			existing.name = userData.name;
			existing.password = userData.password;
			existing.role = userData.role;
			existing.status = userData.status;
			existing.isActive = userData.isActive;
			await existing.save();
			console.log(`Updated development user: ${userData.email}`);
		} else {
			await User.create(userData);
			console.log(`Created development user: ${userData.email}`);
		}
	}

	const admin = await User.findOne({ email: "admin@mr5school.com" }).exec();
	if (admin) {
		const existingCourse = await Course.findOne({ title: "Course X" }).exec();
		if (!existingCourse) {
			await Course.create({
				title: "Course X",
				description: "Test Course for E2E flows.",
				category: "Testing",
				teacher: admin._id,
				price: 10,
				isApproved: true,
				language: "English",
			});
			console.log("Created development course: Course X");
		} else {
			console.log("Development course already exists: Course X");
		}
	}
};

const connectDB = async () => {
	let options = buildConnectionOptions();
	try {
		if (cachedConnection && mongoose.connection.readyState === 1) {
			console.log("Using cached MongoDB connection");
			return cachedConnection;
		}

		let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

		if (!uri && (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test")) {
			const memoryServer = await createMemoryServer();
			uri = memoryServer.getUri();
			console.log("No MongoDB URI found; using in-memory MongoDB for local development.");
		}

		if (!uri) {
			throw new Error("MONGO_URI (or MONGODB_URI) is not defined in environment variables");
		}

		await mongoose.connect(uri, options);
		cachedConnection = mongoose.connection;
		console.log("MongoDB Connected Successfully");

		await seedDevelopmentData();
		return mongoose.connection;
	} catch (error) {
		console.error(`MongoDB Connection Error: ${error?.message || error}`);

		if ((process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") &&
			(error.message.includes("ECONNREFUSED") || error.message.includes("failed to connect") || !process.env.MONGO_URI)) {
			console.warn("Falling back to in-memory MongoDB for development/test.");
			const memoryServer = await createMemoryServer();
			const uri = memoryServer.getUri();
			await mongoose.connect(uri, options);
			cachedConnection = mongoose.connection;
			console.log("MongoDB Connected Successfully using in-memory MongoDB");
			await seedDevelopmentData();
			return mongoose.connection;
		}

		console.error("⚠️  ERROR: Failed to connect to database!");
		console.error("Please make sure your .env has a correct MONGO_URI and the database is reachable.");

		if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
			throw error;
		}

		console.warn("The server will continue running, but database operations will fail.");
	}
};

export default connectDB;
export { connectDB as connectToDatabase };
