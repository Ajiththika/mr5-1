import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Optional auth with cookie + bearer support for identity routes.
 */
export const optionalIdentityAuth = async (req, res, next) => {
	try {
		let token;

		if (req.headers.authorization?.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies?.access_token) {
			token = req.cookies.access_token;
		}

		if (!token || !process.env.JWT_SECRET) {
			req.user = null;
			return next();
		}

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = await User.findById(decoded.id).select("-password");
		} catch {
			req.user = null;
		}

		next();
	} catch {
		req.user = null;
		next();
	}
};
