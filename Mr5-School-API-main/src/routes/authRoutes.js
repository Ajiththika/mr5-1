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
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/security.js";
import passport from "passport";

const router = express.Router();

// Public routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

// Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
	passport.authenticate("google", { session: false, failureRedirect: "/login" }),
	googleCallback
);

// Protected routes
router.post("/logout", logout);
router.post("/logout-all", verifyToken, logoutAll);
router.get("/sessions", verifyToken, getSessions);
router.get("/me", verifyToken, getMe);
router.put("/updatedetails", verifyToken, updateDetails);
router.put("/updatepassword", verifyToken, updatePassword);

export default router;
