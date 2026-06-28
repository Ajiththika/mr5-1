import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { optionalIdentityAuth } from "../middleware/identityAuth.js";
import {
	identitySearchLimiter,
	identityFriendLimiter,
} from "../middleware/security.js";
import {
	searchIdentity,
	getProfile,
	getCertificate,
	getMyPrivacy,
	patchMyPrivacy,
	createFriendRequest,
	updateFriendRequest,
	getFriendRequests,
	getBadgeCatalog,
	getMyNotifications,
	patchNotificationRead,
	patchAllNotificationsRead,
	getLeaderboardFeed,
} from "../controllers/identityController.js";

const router = express.Router();

router.get("/search", identitySearchLimiter, optionalIdentityAuth, searchIdentity);
router.get("/badges", getBadgeCatalog);
router.get("/leaderboard", getLeaderboardFeed);
router.get("/profiles/:uid", optionalIdentityAuth, getProfile);
router.get("/certificates/verify/:verificationId", getCertificate);

router.get("/me/privacy", verifyToken, getMyPrivacy);
router.patch("/me/privacy", verifyToken, patchMyPrivacy);
router.get("/me/friends", verifyToken, getFriendRequests);
router.post("/me/friends", identityFriendLimiter, verifyToken, createFriendRequest);
router.patch("/me/friends/:requestId", verifyToken, updateFriendRequest);
router.get("/me/notifications", verifyToken, getMyNotifications);
router.patch("/me/notifications/read-all", verifyToken, patchAllNotificationsRead);
router.patch("/me/notifications/:notificationId/read", verifyToken, patchNotificationRead);

export default router;
