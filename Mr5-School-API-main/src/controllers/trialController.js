import { asyncHandler } from "../middleware/errorHandler.js";
import User from "../models/User.js";
import { getTrialStatus, startTrial } from "../services/trialService.js";

export const getStatus = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	if (!user) {
		return res.status(404).json({ success: false, error: "User not found" });
	}

	res.status(200).json({
		success: true,
		data: getTrialStatus(user),
	});
});

export const activateTrial = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	if (!user) {
		return res.status(404).json({ success: false, error: "User not found" });
	}

	startTrial(user);
	await user.save();

	res.status(200).json({
		success: true,
		message: "Your 5-hour full-access trial has started",
		data: getTrialStatus(user),
	});
});
