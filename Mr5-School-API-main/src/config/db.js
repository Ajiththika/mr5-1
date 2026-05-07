import mongoose from "mongoose";

// Cache the connection for serverless environments (Vercel)
let cachedConnection = null;

const connectDB = async () => {
	try {
		// Return cached connection if available (for serverless reuse)
		if (cachedConnection && mongoose.connection.readyState === 1) {
			console.log("Using cached MongoDB connection");
			return cachedConnection;
		}

		// Support both MONGO_URI and MONGODB_URI environment variable names
		const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
		if (!uri) {
			throw new Error(
				"MONGO_URI (or MONGODB_URI) is not defined in environment variables",
			);
		}

		// Serverless-optimized connection options for Vercel
		const options = {
			// Connection pool settings for serverless
			maxPoolSize: 10, // Maximum number of connections in the pool
			minPoolSize: 1, // Minimum number of connections to maintain

			// Timeout settings optimized for serverless
			serverSelectionTimeoutMS: 30000, // Timeout for selecting a server (30s)
			socketTimeoutMS: 45000, // Timeout for socket inactivity (45s)

			// Fail fast instead of buffering commands
			bufferCommands: false,

			// Additional optimizations
			maxIdleTimeMS: 10000, // Close idle connections after 10s

			// Force IPv4 to avoid EAI_AGAIN DNS errors
			family: 4,
		};

		// Connect to MongoDB with optimized settings
		await mongoose.connect(uri, options);

		// Cache the connection
		cachedConnection = mongoose.connection;

		console.log("MongoDB Connected Successfully");
		return mongoose.connection;
	} catch (error) {
		console.error(`MongoDB Connection Error: ${error?.message || error}`);
		console.error(
			"⚠️  ERROR: Failed to connect to database!",
		);
		console.error(
			"Please make sure your .env has a correct MONGO_URI and the database is reachable.",
		);

		// In production (Vercel), throw the error to prevent serving requests without DB
		if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
			throw error;
		}

		// In development, allow server to run for testing
		console.warn(
			"The server will continue running, but database operations will fail.",
		);
	}
};

export default connectDB;
export { connectDB as connectToDatabase };
