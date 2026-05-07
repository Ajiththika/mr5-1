import { asyncHandler } from "../middleware/errorHandler.js";
import RegistrationRequest from "../models/RegistrationRequest.js";
import User from "../models/User.js";
import { randomBytes } from "crypto";

// @desc    Create a new registration request
// @route   POST /api/requests
// @access  Public
export const createRegistrationRequest = asyncHandler(async (req, res) => {
	const { name, email, skillName, description, category } = req.body;

	if (!name || !email || !skillName || !description || !category) {
		return res.status(400).json({
			success: false,
			message: "Please provide all required fields: name, email, skillName, description, and category.",
		});
	}

	let user = await User.findOne({ email });

	if (!user) {
		// If user doesn't exist, create a new one with a random password
		const randomPassword = randomBytes(16).toString("hex");
		user = new User({
			name,
			email,
			password: randomPassword,
			role: "student", // Default role
		});
		await user.save();
	}

	const requestData = {
		userId: user._id,
		type: "avatar_skill",
		data: {
			skillName,
			description,
			category,
			contactEmail: email,
		},
		status: "pending",
	};

	const registrationRequest = new RegistrationRequest(requestData);
	await registrationRequest.save();

	res.status(201).json({
		success: true,
		message: "Your skill submission has been received and will be reviewed.",
		data: registrationRequest,
	});
});
