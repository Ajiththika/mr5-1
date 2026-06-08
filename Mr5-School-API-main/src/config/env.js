import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

// Optional environment variables with defaults
const envConfig = {
	PORT: process.env.PORT || 5000,
	NODE_ENV: process.env.NODE_ENV || "development",
	MONGO_URI: process.env.MONGO_URI,
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
	LOG_LEVEL: process.env.LOG_LEVEL || "info",
	CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
	GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
	CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000"
};

// Function to validate required environment variables
export function validateEnv() {
	const requiredEnvVars = [
		"MONGO_URI",
		"JWT_SECRET",
		"NODE_ENV",
	];
	const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

	if (missingVars.length > 0) {
		console.error(
			`Missing required environment variables: ${missingVars.join(", ")}`,
		);
		process.exit(1);
	}

	// Validate NODE_ENV
	if (!["development", "production", "test"].includes(envConfig.NODE_ENV)) {
		console.error(
			`Invalid NODE_ENV: ${envConfig.NODE_ENV}. Must be development, production, or test`,
		);
		process.exit(1);
	}

	// Validate JWT_SECRET strength in production
	if (
		envConfig.NODE_ENV === "production" &&
		envConfig.JWT_SECRET &&
		envConfig.JWT_SECRET.length < 32
	) {
		console.warn(
			"JWT_SECRET is less than 32 characters. Consider using a stronger secret in production.",
		);
	}

	console.log("Environment variables validated successfully");
}

console.log("Environment variables loaded successfully");

export default envConfig;