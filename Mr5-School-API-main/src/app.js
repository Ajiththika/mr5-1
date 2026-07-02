// Load environment variables first, before any other imports
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the Server directory
dotenv.config({ path: join(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { ensureDbConnected } from "./middleware/dbMiddleware.js";
import { securityHeaders, apiLimiter, authLimiter, sanitizeMongo } from "./middleware/security.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import courseDiscoveryRoutes from "./routes/courseDiscoveryRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import aiAssistantInteractionRoutes from "./routes/ai-assistant-interaction.routes.js";
import studentLearningRoutes from "./routes/studentLearningRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import avatarRoutes from "./routes/avatarRoutes.js";
import livekitRoutes from "./routes/livekitRoutes.js";
import ttsRoutes from "./routes/ttsRoutes.js";
import avatarSupportAgentRoutes from "./routes/avatarSupportAgentRoutes.js";
import aiRoutes from "./routes/ai.routes.js"; // Add AI routes
import registrationRequestRoutes from "./routes/registrationRequestRoutes.js";
import contextRoutes from "./routes/contextRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import pricingRoutes from "./routes/pricingRoutes.js";
import trialRoutes from "./routes/trialRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import userInventoryRoutes from "./routes/userInventoryRoutes.js";
import legalRoutes from "./routes/legalRoutes.js";
import identityRoutes from "./routes/identityRoutes.js";
import powerAdminRoutes from "./routes/powerAdminRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";
import { validateEnv } from "./config/env.js";
import aiService from "./services/ai.service.js"; // Import aiService instance
import passport from "passport";
import passportConfig from "./config/passport.js";
import path from "path";

// Initialize Passport Strategy
passportConfig(passport);

// Validate environment variables
validateEnv();

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
    console.log("Starting server...");
    console.log("- PORT:", process.env.PORT);
    console.log("- NODE_ENV:", process.env.NODE_ENV);
}

const app = express();

if (isProduction) {
    app.set("trust proxy", 1);
}

// CORS configuration - MUST be before any security middleware
const parseOrigins = (value) =>
    (value || "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

const productionOrigins = [
    process.env.CORS_ORIGIN,
    ...parseOrigins(process.env.CORS_EXTRA_ORIGINS),
    "https://mr5school.com",
    "https://www.mr5school.com",
    "https://app.mr5school.com",
].filter(Boolean);

const developmentOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:3000",
    ...parseOrigins(process.env.CORS_EXTRA_ORIGINS),
    "http://localhost:3001",
    "https://mr5school.com",
    "https://www.mr5school.com",
    "https://app.mr5school.com",
];

const allowedOrigins = isProduction ? productionOrigins : developmentOrigins;

const localOriginPatterns = isProduction
    ? []
    : [
        /^http:\/\/localhost(?::\d+)?$/,
        /^http:\/\/127\.0\.0\.1(?::\d+)?$/,
        /^http:\/\/192\.168\.\d+\.\d+(?::\d+)?$/,
        /^http:\/\/10\.\d+\.\d+\.\d+(?::\d+)?$/,
        /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(?::\d+)?$/,
    ];

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    if (localOriginPatterns.some((pattern) => pattern.test(origin))) {
        return true;
    }

    return allowedOrigins.includes(origin);
};

// Dynamic CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (isAllowedOrigin(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Security middleware
app.use(securityHeaders);
app.use(sanitizeMongo);
app.use(passport.initialize());

// Rate limiting: general API applies to all routes, but auth has its own internal limits
app.use("/api/", apiLimiter);

// Serve static 3D assets
app.use("/api/3d", express.static(path.join(__dirname, "../public/3d")));

// Stripe webhook must receive raw body — mount before express.json()
app.post(
	"/api/payments/webhook",
	express.raw({ type: "application/json" }),
	handleStripeWebhook,
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Test endpoint for Ollama integration (development only)
if (process.env.NODE_ENV === 'development') {
    app.post("/api/test-ollama", async (req, res) => {
        try {
            const response = await aiService.ollamaChatCompletion(req.body);
            res.json(response);
        } catch (error) {
            console.error('Test Ollama Error:', error);
            res.status(500).json({ error: error.message });
        }
    });
}

// Block API traffic until MongoDB is connected (prevents bufferCommands errors on login)
app.use("/api", ensureDbConnected);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/courses/discovery", courseDiscoveryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/ai-assistant-interactions", aiAssistantInteractionRoutes);
app.use("/api/students/me", studentLearningRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/power-admin", powerAdminRoutes);
app.use("/api/avatar", avatarRoutes);
app.use("/api/livekit", livekitRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/avatar-support-agent", avatarSupportAgentRoutes);
app.use("/api/ai", aiRoutes); // Register AI routes
app.use("/api/requests", registrationRequestRoutes);
app.use("/api/context", contextRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/trial", trialRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/user", userInventoryRoutes);
app.use("/api/legal", legalRoutes);
app.use("/api/identity", identityRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "mr5-school-api",
        version: "2.0.0",
        environment: process.env.NODE_ENV || "development",
        database: dbStatus,
    });
});

app.get("/ready", (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const ready = dbState === 1;

    res.status(ready ? 200 : 503).json({
        status: ready ? "READY" : "NOT_READY",
        timestamp: new Date().toISOString(),
        service: "mr5-school-api",
        database: dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected",
    });
});

// Global error handlers for unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Error handling middleware (should be last before export)
app.use(errorHandler);

// Export the app for Vercel serverless functions
export default app;

// Only start the server when not on Vercel (i.e., running locally)
// Vercel will import the app directly without calling listen()
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
	const startServer = async () => {
		try {
			console.log("Connecting to MongoDB...");
			const connection = await connectDB();

			if (!connection) {
				if (process.env.NODE_ENV === "production") {
					console.error("Cannot start production server without a database connection.");
					process.exit(1);
				}
				console.warn("⚠️  Running without database connection. API requests will retry connect on demand.");
			} else {
				console.log("Connected to MongoDB successfully");
			}

			const PORT = process.env.PORT || 5000;

			const server = app.listen(PORT, () => {
				console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
			});

			const gracefulShutdown = (signal) => {
				console.log(`${signal} received, shutting down gracefully`);

				server.close(() => {
					console.log("HTTP server closed");
				});

				mongoose.connection.close(false).then(() => {
					console.log("MongoDB connection closed");
					process.exit(0);
				}).catch((err) => {
					console.error("Error closing MongoDB connection:", err);
					process.exit(1);
				});

				setTimeout(() => {
					console.error("Could not close connections in time, forcefully shutting down");
					process.exit(1);
				}, 10000);
			};

			process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
			process.on("SIGINT", () => gracefulShutdown("SIGINT"));
		} catch (error) {
			console.error("Failed to connect to MongoDB:", error);
			process.exit(1);
		}
	};

	startServer();
}