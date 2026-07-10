import express from "express";
import {
	register,
	login,
	logout,
	logoutAll,
	refreshToken,
	getSessions,
	getMe,
	updateDetails,
	updatePassword,
	googleCallback,
	forgotPassword,
	resetPassword,
	getAuthProviders,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/security.js";
import passport from "passport";
import { isGoogleOAuthEnabled } from "../config/passport.js";
import envConfig from "../config/env.js";

const router = express.Router();

const clientBaseUrl = (req) => {
	const forwardedHost = req.headers['x-forwarded-host'] || req.headers.host;
	const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';

	// If CLIENT_URL is explicitly set to a production domain, prefer it
	if (envConfig.CLIENT_URL && !envConfig.CLIENT_URL.includes('localhost')) {
		return envConfig.CLIENT_URL.replace(/\/$/, "");
	}

	if (forwardedHost) {
		// Next.js rewrite proxy runs on the same domain as the frontend
		return `${protocol}://${forwardedHost}`.replace(/\/$/, "");
	}

	return (envConfig.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
};

const googleNotConfigured = (_req, res) => {
	res.status(503).json({
		success: false,
		error: "Google sign-in is not configured for this environment.",
	});
};

// Public routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.post("/forgotpassword", authLimiter, forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/providers", getAuthProviders);

const googleAuthCallback = (req, res, next) => {
	passport.authenticate("google", { session: false }, (err, user) => {
		if (err) return next(err);
		if (!user) {
			return res.redirect(`${clientBaseUrl(req)}/login?error=google_auth_failed`);
		}
		req.user = user;
		return next();
	})(req, res, next);
};

// Google Auth Routes (only when OAuth credentials are set)
if (isGoogleOAuthEnabled) {
	router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
	router.get("/google/callback", googleAuthCallback, googleCallback);
} else {
	router.get("/google", googleNotConfigured);
	router.get("/google/callback", googleNotConfigured);
}

// Protected routes
router.post("/logout", logout);
router.post("/logout-all", verifyToken, logoutAll);
router.get("/sessions", verifyToken, getSessions);
router.get("/me", verifyToken, getMe);
router.put("/updatedetails", verifyToken, updateDetails);
router.put("/updatepassword", verifyToken, updatePassword);

export default router;
