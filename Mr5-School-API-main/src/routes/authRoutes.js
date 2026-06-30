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

const router = express.Router();

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

// Google Auth Routes (only when OAuth credentials are set)
if (isGoogleOAuthEnabled) {
	router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
	router.get(
		"/google/callback",
		passport.authenticate("google", { session: false, failureRedirect: "/login" }),
		googleCallback
	);
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
