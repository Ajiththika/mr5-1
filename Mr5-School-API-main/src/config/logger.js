import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define log format
const logFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json(),
);

// Console format for development
const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.printf(
		({ timestamp, level, message, ...meta }) =>
			`${timestamp} [${level}]: ${message} ${
				Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
			}`,
	),
);

// Create logger instance — console-only in AWS ECS (stdout → CloudWatch Logs)
const useFileLogs =
	process.env.LOG_TO_FILE === "true" &&
	!process.env.AWS_EXECUTION_ENV &&
	process.env.NODE_ENV !== "test";

const transports = [
	new winston.transports.Console({
		format: process.env.NODE_ENV === "production" ? logFormat : consoleFormat,
	}),
];

if (useFileLogs) {
	transports.push(
		new winston.transports.File({
			filename: path.join(__dirname, "../logs/error.log"),
			level: "error",
			maxsize: 5242880,
			maxFiles: 5,
		}),
		new winston.transports.File({
			filename: path.join(__dirname, "../logs/combined.log"),
			maxsize: 5242880,
			maxFiles: 5,
		}),
	);
}

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: logFormat,
	defaultMeta: { service: "lms-api" },
	transports,
	exceptionHandlers: useFileLogs
		? [new winston.transports.File({ filename: path.join(__dirname, "../logs/exceptions.log") })]
		: [new winston.transports.Console({ format: logFormat })],
	rejectionHandlers: useFileLogs
		? [new winston.transports.File({ filename: path.join(__dirname, "../logs/rejections.log") })]
		: [new winston.transports.Console({ format: logFormat })],
});

export default logger;
