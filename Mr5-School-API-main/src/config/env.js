import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

const envConfig = {
	PORT: process.env.PORT || 5001,
	NODE_ENV: process.env.NODE_ENV || "development",
	MONGO_URI: mongoUri,
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRE: process.env.JWT_EXPIRE || "15m",
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
	REFRESH_TOKEN_EXPIRE_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS, 10) || 7,
	LOG_LEVEL: process.env.LOG_LEVEL || "info",
	CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
	CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
	GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
	OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
	OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
	AI_PROVIDER: process.env.AI_PROVIDER || "gemini",
	OLLAMA_HOST: process.env.OLLAMA_HOST || process.env.OLLAMA_URL || "",
	OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama2",
	WEATHER_API_KEY: process.env.WEATHER_API_KEY || "",
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
	GOOGLE_CALLBACK_URL:
		process.env.GOOGLE_CALLBACK_URL ||
		`http://localhost:${process.env.PORT || 5001}/api/auth/google/callback`,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
	EMAIL_USER: process.env.EMAIL_USER || "",
	EMAIL_PASS: process.env.EMAIL_PASS || "",
	FROM_NAME: process.env.FROM_NAME || "MR5 School",
	FROM_EMAIL: process.env.FROM_EMAIL || "",
	SMTP_HOST: process.env.SMTP_HOST || "",
	SMTP_PORT: process.env.SMTP_PORT || "587",
	SMTP_USER: process.env.SMTP_USER || "",
	SMTP_PASS: process.env.SMTP_PASS || "",
	SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "",
	AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY || "",
	AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION || "",
	LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || "",
	LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || "",
	AVATHOR_SECRET_TOKEN: process.env.AVATHOR_SECRET_TOKEN || "",
};

export function validateEnv() {
	const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "NODE_ENV"];
	const missingVars = requiredEnvVars.filter((varName) => {
		if (varName === "MONGO_URI") return !mongoUri;
		return !process.env[varName];
	});

	if (missingVars.length > 0) {
		console.error(
			`Missing required environment variables: ${missingVars.join(", ")}. ` +
				`(MONGO_URI accepts MONGODB_URI as an alias)`,
		);
		process.exit(1);
	}

	if (!["development", "production", "test"].includes(envConfig.NODE_ENV)) {
		console.error(
			`Invalid NODE_ENV: ${envConfig.NODE_ENV}. Must be development, production, or test`,
		);
		process.exit(1);
	}

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
