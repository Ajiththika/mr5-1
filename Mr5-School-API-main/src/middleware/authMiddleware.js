import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify JWT Token
export const verifyToken = async (req, res, next) => {
	try {
		let token;

		// Check for token in headers or cookies
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies && req.cookies.access_token) {
			token = req.cookies.access_token;
		}

		if (!token) {
			return res.status(401).json({
				success: false,
				error: "Not authorized to access this route",
			});
		}

		try {
			// Verify token
			if (!process.env.JWT_SECRET) {
				console.error("CRITICAL: JWT_SECRET is missing!");
				throw new Error("Server configuration error");
			}

			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Get user from token
			req.user = await User.findById(decoded.id).select("-password");

			if (!req.user) {
				return res.status(401).json({
					success: false,
					error: "User not found",
				});
			}

			if (!req.user.isActive) {
				return res.status(401).json({
					success: false,
					error: "User account is deactivated",
				});
			}

			next();
		} catch (err) {
			return res.status(401).json({
				success: false,
				error: "Not authorized to access this route",
			});
		}
	} catch (error) {
		console.error("Auth Middleware Error:", error);
		return res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};

// Role-based authorization
export const authorize = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				error: "Not authorized to access this route",
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				error: `User role '${req.user.role}' is not authorized to access this route`,
			});
		}

		next();
	};
};

// Admin only middleware helper
export const isAdmin = (req, res, next) => {
	if (req.user && req.user.role === 'admin') {
		next();
	} else {
		res.status(403).json({
			success: false,
			error: "Access denied. Admin only."
		});
	}
};

// Optional auth - doesn't fail if no token, but adds user if token exists
export const optionalAuth = async (req, res, next) => {
	try {
		let token;

		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];

			try {
				const decoded = jwt.verify(token, process.env.JWT_SECRET);
				req.user = await User.findById(decoded.id).select("-password");
			} catch (err) {
				// Token invalid, but continue without user
				req.user = null;
			}
		}

		next();
	} catch (error) {
		next();
	}
};
