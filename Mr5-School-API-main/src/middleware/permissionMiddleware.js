import {
	resolveAdminRole,
	userHasPermission,
	ADMIN_ROLES,
} from "../config/adminRoles.js";

/** Require platform admin role (legacy role field). */
export const requireHubAdmin = (req, res, next) => {
	if (!req.user || req.user.role !== "admin") {
		return res.status(403).json({
			success: false,
			error: "Power Admin Hub access requires an admin account.",
		});
	}
	req.hubRole = resolveAdminRole(req.user);
	next();
};

/** Require one or more hub permissions. */
export const requirePermission = (...permissions) => {
	return (req, res, next) => {
		if (!req.user || req.user.role !== "admin") {
			return res.status(403).json({
				success: false,
				error: "Power Admin Hub access requires an admin account.",
			});
		}

		const hubRole = resolveAdminRole(req.user);
		req.hubRole = hubRole;

		if (hubRole === ADMIN_ROLES.SUPER_ADMIN) {
			return next();
		}

		const allowed = permissions.some((p) =>
			userHasPermission(req.user, p),
		);

		if (!allowed) {
			return res.status(403).json({
				success: false,
				error: "You do not have permission for this action.",
			});
		}

		next();
	};
};
