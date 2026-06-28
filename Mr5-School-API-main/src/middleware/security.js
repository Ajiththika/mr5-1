import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";
import envConfig from "../config/env.js";

const isDevelopment = envConfig.NODE_ENV === 'development';

// Security headers middleware
export const securityHeaders = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://prod.spline.design", "https://cdn.jsdelivr.net"],
			imgSrc: ["'self'", "data:", "https:", "blob:"],
			connectSrc: ["'self'", "https://prod.spline.design", "https://build.spline.design", "https://nominatim.openstreetmap.org", "https://api.openweathermap.org", "https://cdn.jsdelivr.net"],
			frameSrc: ["'self'", "https://prod.spline.design"],
		},
	},
	crossOriginEmbedderPolicy: false,
	crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Rate limiting for general API
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: isDevelopment ? 10000 : 100, // Limit each IP to 100 requests per windowMs in production, relaxed in dev.
	message: {
		success: false,
		error: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: isDevelopment ? 10000 : 10, // 10 failed auth attempts per 15min in production
	message: {
		success: false,
		error: "Too many authentication attempts, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true,
});

export const identitySearchLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: isDevelopment ? 1000 : 60,
	message: {
		success: false,
		error: "Too many search requests. Please wait a moment.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

export const identityFriendLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: isDevelopment ? 500 : 30,
	message: {
		success: false,
		error: "Too many friend requests. Please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// MongoDB injection prevention
export const sanitizeMongo = mongoSanitize({
	replaceWith: "_",
	onSanitize: ({ req, key }) => {
		console.warn(`MongoDB injection attempt detected: ${key}`);
	},
});

// XSS protection helper
export const sanitizeInput = (input) => {
	if (typeof input === "string") {
		return xss(input);
	}
	if (typeof input === "object" && input !== null) {
		const sanitized = {};
		for (const key in input) {
			sanitized[key] = sanitizeInput(input[key]);
		}
		return sanitized;
	}
	return input;
};
