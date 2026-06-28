import {
	searchAcademic,
	getPublicProfileByUid,
	verifyCertificate,
	updatePrivacySettings,
	getPrivacySettings,
	sendFriendRequest,
	respondFriendRequest,
	listFriendRequests,
	listNotifications,
	markNotificationRead,
	markAllNotificationsRead,
	getGlobalLeaderboardFeed,
} from "../services/identityService.js";
import { sanitizeInput } from "../middleware/security.js";

function handleError(res, error) {
	const status = error.statusCode || 500;
	return res.status(status).json({
		success: false,
		error: error.message || "Identity request failed",
	});
}

export const searchIdentity = async (req, res) => {
	try {
		const q = req.query.q || req.query.query || "";
		const limit = Math.min(parseInt(req.query.limit, 10) || 8, 20);
		const data = await searchAcademic({
			query: q,
			limit,
			viewerUserId: req.user?._id || null,
		});
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getProfile = async (req, res) => {
	try {
		const data = await getPublicProfileByUid(
			req.params.uid,
			req.user?._id || null,
		);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getCertificate = async (req, res) => {
	try {
		const data = await verifyCertificate(req.params.verificationId);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getMyPrivacy = async (req, res) => {
	try {
		const data = await getPrivacySettings(req.user._id);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const patchMyPrivacy = async (req, res) => {
	try {
		const data = await updatePrivacySettings(req.user._id, sanitizeInput(req.body));
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const createFriendRequest = async (req, res) => {
	try {
		const data = await sendFriendRequest(req.user._id, req.body.recipientUid);
		return res.status(201).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const updateFriendRequest = async (req, res) => {
	try {
		const data = await respondFriendRequest(
			req.user._id,
			req.params.requestId,
			req.body.action,
		);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getFriendRequests = async (req, res) => {
	try {
		const data = await listFriendRequests(req.user._id);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getBadgeCatalog = async (_req, res) => {
	try {
		const { BADGE_CATALOG } = await import("../config/badgeCatalog.js");
		return res.status(200).json({ success: true, data: BADGE_CATALOG });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getMyNotifications = async (req, res) => {
	try {
		const scope = req.query.scope || "all";
		const limit = Math.min(parseInt(req.query.limit, 10) || 30, 50);
		const data = await listNotifications(req.user._id, { scope, limit });
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const patchNotificationRead = async (req, res) => {
	try {
		const data = await markNotificationRead(req.user._id, req.params.notificationId);
		if (!data) {
			return res.status(404).json({ success: false, error: "Notification not found" });
		}
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};

export const patchAllNotificationsRead = async (req, res) => {
	try {
		const scope = req.query.scope || "all";
		await markAllNotificationsRead(req.user._id, scope);
		return res.status(200).json({ success: true });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getLeaderboardFeed = async (_req, res) => {
	try {
		const data = await getGlobalLeaderboardFeed(10);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return handleError(res, error);
	}
};
