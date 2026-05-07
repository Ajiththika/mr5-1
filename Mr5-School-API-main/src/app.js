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

// Debug environment variables
console.log("Debug: Checking GEMINI_API_KEY after dotenv load");
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
console.log("Length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "undefined");

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { securityHeaders, apiLimiter, authLimiter, sanitizeMongo } from "./middleware/security.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import aiAssistantInteractionRoutes from "./routes/ai-assistant-interaction.routes.js";
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
import { validateEnv } from "./config/env.js";
import aiService from "./services/ai.service.js"; // Import aiService instance
import passport from "passport";
import passportConfig from "./config/passport.js";
import path from "path";

// Initialize Passport Strategy
passportConfig(passport);

// Validate environment variables
validateEnv();

console.log("Starting server...");
console.log("Environment variables:");
console.log("- PORT:", process.env.PORT);
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "SET" : "NOT SET");

const app = express();

// CORS configuration - MUST be before any security middleware
const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:*", // Allow any localhost port for development
    "https://mr5school.com",
    "https://www.mr5school.com",
    "https://app.mr5school.com",
    "https://mr5school.vercel.app", // Vercel frontend deployment
    "https://mr5-school-api.vercel.app", // Vercel backend deployment
];

// Dynamic CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin matches any allowed origins (supporting wildcards for localhost)
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin === "http://localhost:*") {
                // Allow any localhost port
                return origin && origin.startsWith("http://localhost:");
            }
            return origin === allowedOrigin;
        });

        if (isAllowed) {
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/ai-assistant-interactions", aiAssistantInteractionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/avatar", avatarRoutes);
app.use("/api/livekit", livekitRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/avatar-support-agent", avatarSupportAgentRoutes);
app.use("/api/ai", aiRoutes); // Register AI routes
app.use("/api/requests", registrationRequestRoutes);
app.use("/api/context", contextRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/pricing", pricingRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "lms-api"
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
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    connectDB().then((connection) => {
        if (!connection) {
            console.warn("⚠️  Running without database connection.");
            // We still allow the server to start in dev mode as per connectDB logic
        } else {
            console.log("Connected to MongoDB successfully");
        }

        const PORT = process.env.PORT || 5000;

        const server = app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });

        // Graceful shutdown with proper cleanup
        const gracefulShutdown = (signal) => {
            console.log(`${signal} received, shutting down gracefully`);

            // Close HTTP server
            server.close(() => {
                console.log('HTTP server closed');
            });

            // Close database connections
            mongoose.connection.close(false).then(() => {
                console.log('MongoDB connection closed');
                process.exit(0);
            }).catch(err => {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }).catch((error) => {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    });
} else if (process.env.VERCEL) {
    // On Vercel, connect to MongoDB without starting a server
    console.log("Running on Vercel, connecting to MongoDB...");
    connectDB().then((connection) => {
        if (connection) {
            console.log("Connected to MongoDB successfully on Vercel");
        }
    }).catch((error) => {
        console.error("Failed to connect to MongoDB on Vercel:", error);
    });
}