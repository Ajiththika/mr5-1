import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Cache the connection for serverless environments (Vercel)
let cachedConnection = null;
let mongoMemoryServer = null;
let connectionPromise = null;

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
	const Lesson = (await import("../models/Lesson.js")).default;
	const Enrollment = (await import("../models/Enrollment.js")).default;
	const ShopItem = (await import("../models/ShopItem.js")).default;

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
			name: "Alex Rivera",
			email: "student@mr5school.com",
			password: "Student@123456",
			role: "student",
			status: "approved",
			isActive: true,
			avatarPreset: "cadet-blue",
			onboardingCompleted: true,
		},
		{
			name: "New Student",
			email: "onboard@mr5school.com",
			password: "Onboard@123456",
			role: "student",
			status: "approved",
			isActive: true,
			onboardingCompleted: false,
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
			if (userData.avatarPreset) existing.avatarPreset = userData.avatarPreset;
			if (typeof userData.onboardingCompleted === "boolean") {
				existing.onboardingCompleted = userData.onboardingCompleted;
			}
			await existing.save();
			console.log(`Updated development user: ${userData.email}`);
		} else {
			await User.create(userData);
			console.log(`Created development user: ${userData.email}`);
		}
	}

	const { ensureIdentityForUser } = await import("../services/identityService.js");
	const seededUsers = await User.find({
		email: { $in: users.map((u) => u.email) },
	}).exec();
	for (const devUser of seededUsers) {
		await ensureIdentityForUser(devUser);
	}

	const admin = await User.findOne({ email: "admin@mr5school.com" }).exec();
	const student = await User.findOne({ email: "student@mr5school.com" }).exec();

	if (admin) {
		let course = await Course.findOne({ title: "Introduction to the 3D Campus" }).exec();
		if (!course) {
			course = await Course.create({
				title: "Introduction to the 3D Campus",
				description: "Explore the virtual Mr5 School — meet your AI teacher, navigate classrooms, and complete your first interactive lesson.",
				category: "Campus",
				teacher: admin._id,
				price: 0,
				isApproved: true,
				language: "English",
				level: "Beginner",
				thumbnail: "/assets/dashboard/course-icon-1.png",
			});
			console.log("Created development course: Introduction to the 3D Campus");
		}

		const lessonCount = await Lesson.countDocuments({ course: course._id });
		if (lessonCount === 0) {
			const lessons = [
				{
					title: "Welcome to Mr5 School",
					content: "Meet your virtual campus, learn how navigation works, and discover how lessons connect to 3D rooms.",
					duration: 8,
					order: 1,
					videoUrl: "",
				},
				{
					title: "Your First Classroom Visit",
					content: "Walk into the 3D classroom, interact with hotspots, and open lesson materials from the environment.",
					duration: 12,
					order: 2,
					videoUrl: "",
				},
				{
					title: "Meet Your AI Teacher",
					content: "Learn how the AI teaching assistant guides you through concepts and tracks your progress.",
					duration: 10,
					order: 3,
					videoUrl: "",
				},
			];
			for (const lesson of lessons) {
				await Lesson.create({ ...lesson, course: course._id });
			}
			console.log(`Seeded ${lessons.length} lessons for demo course`);
		}

		if (student) {
			const enrolled = await Enrollment.findOne({ student: student._id, course: course._id }).exec();
			if (!enrolled) {
				await Enrollment.create({ student: student._id, course: course._id, progress: 15 });
				console.log("Enrolled demo student in 3D Campus course");
			}
		}
	}

	const shopCount = await ShopItem.countDocuments();
	if (shopCount === 0) {
		await ShopItem.insertMany([
			{ name: "Classic Cap", description: "Campus starter hat", type: "hat", priceCents: 299 },
			{ name: "School Hoodie", description: "Mr5 branded hoodie", type: "shirt", priceCents: 499 },
			{ name: "Cool Shades", description: "Stylish sunglasses", type: "accessory", priceCents: 199 },
			{ name: "Textbook Bundle", description: "Virtual study books", type: "book", priceCents: 149 },
		]);
		console.log("Seeded shop items for development");
	}

	const { recordAcceptances, getMandatoryVersionIds } = await import(
		"../services/legalConsentService.js"
	);
	const versionIds = await getMandatoryVersionIds();
	if (versionIds.length > 0) {
		const devUsers = await User.find({
			email: { $in: ["student@mr5school.com", "admin@mr5school.com", "onboard@mr5school.com"] },
		}).exec();
		for (const devUser of devUsers) {
			await recordAcceptances(devUser._id, versionIds, {
				acceptanceMethod: "api",
				locale: "en",
				source: "development-seed",
			});
		}
		console.log("Seeded legal consent for development users");
	}
};

const connectDB = async () => {
	if (mongoose.connection.readyState === 1) {
		return mongoose.connection;
	}

	if (connectionPromise) {
		return connectionPromise;
	}

	connectionPromise = connectDBInternal().finally(() => {
		if (mongoose.connection.readyState !== 1) {
			connectionPromise = null;
		}
	});

	return connectionPromise;
};

const connectDBInternal = async () => {
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

		const { seedLegalDocumentsIfEmpty } = await import("../services/legalConsentService.js");
		await seedLegalDocumentsIfEmpty();

		await seedDevelopmentData();
		return mongoose.connection;
	} catch (error) {
		console.error(`MongoDB Connection Error: ${error?.message || error}`);

		const isRecoverableConnectionError =
			error.name === "MongoServerSelectionError" ||
			error.name === "MongoNetworkError" ||
			error.message.includes("ECONNREFUSED") ||
			error.message.includes("ENOTFOUND") ||
			error.message.includes("querySrv") ||
			error.message.includes("getaddrinfo") ||
			error.message.includes("failed to connect") ||
			error.message.includes("Server selection timed out") ||
			!process.env.MONGO_URI;

		if ((process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") &&
			isRecoverableConnectionError) {
			console.warn("Falling back to in-memory MongoDB for development/test.");
			const memoryServer = await createMemoryServer();
			const uri = memoryServer.getUri();
			await mongoose.connect(uri, options);
			cachedConnection = mongoose.connection;
			console.log("MongoDB Connected Successfully using in-memory MongoDB");

			const { seedLegalDocumentsIfEmpty } = await import("../services/legalConsentService.js");
			await seedLegalDocumentsIfEmpty();

			await seedDevelopmentData();
			return mongoose.connection;
		}

		console.error("⚠️  ERROR: Failed to connect to database!");
		console.error("Please make sure your .env has a correct MONGO_URI and the database is reachable.");

		if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
			throw error;
		}

		console.warn("The server will continue running, but database operations will fail.");
		return null;
	}
};

export default connectDB;
export { connectDB as connectToDatabase, connectDB as getDbConnection };
