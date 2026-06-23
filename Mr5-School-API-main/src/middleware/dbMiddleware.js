import mongoose from "mongoose";
import connectDB from "../config/db.js";

const DB_NOT_READY =
	"Cannot call `users.findOne()` before initial connection is complete if `bufferCommands = false`";

const waitForConnection = (timeoutMs = 30000) =>
	new Promise((resolve, reject) => {
		if (mongoose.connection.readyState === 1) {
			resolve(mongoose.connection);
			return;
		}

		const timer = setTimeout(() => {
			reject(new Error("Database connection timeout"));
		}, timeoutMs);

		const onConnected = () => {
			clearTimeout(timer);
			cleanup();
			resolve(mongoose.connection);
		};

		const onError = (err) => {
			clearTimeout(timer);
			cleanup();
			reject(err);
		};

		const cleanup = () => {
			mongoose.connection.off("connected", onConnected);
			mongoose.connection.off("error", onError);
		};

		mongoose.connection.once("connected", onConnected);
		mongoose.connection.once("error", onError);
	});

export const ensureDbConnected = async (req, res, next) => {
	try {
		if (mongoose.connection.readyState === 1) {
			return next();
		}

		if (mongoose.connection.readyState === 2) {
			await waitForConnection();
			return next();
		}

		const connection = await connectDB();
		if (!connection || mongoose.connection.readyState !== 1) {
			return res.status(503).json({
				success: false,
				error: "Database is starting up. Please try again in a few seconds.",
			});
		}

		return next();
	} catch (error) {
		console.error("Database middleware error:", error?.message || error);
		return res.status(503).json({
			success: false,
			error: "Database is unavailable. Check MONGO_URI and try again.",
		});
	}
};

export const isMongooseNotConnectedError = (error) => {
	const message = error?.message || "";
	return message.includes("before initial connection is complete") || message.includes(DB_NOT_READY);
};
