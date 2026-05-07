import * as userService from "../services/userService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc    Get all users with pagination
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
	const result = await userService.getAllUsers(req.query);
	
	// Set cache control headers
	res.set('Cache-Control', 'private, max-age=300'); // 5 minutes cache
	
	res.status(200).json({
		success: true,
		...result,
	});
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
	const user = await userService.getUserById(req.params.id);
	
	// Set cache control headers
	res.set('Cache-Control', 'private, max-age=600'); // 10 minutes cache
	
	res.json({
		success: true,
		data: user,
	});
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
	const user = await userService.createUser(req.body);
	res.status(201).json({
		success: true,
		data: user,
	});
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
	const user = await userService.updateUser(req.params.id, req.body);
	res.json({
		success: true,
		data: user,
	});
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
	await userService.deleteUser(req.params.id);
	res.json({
		success: true,
		message: "User deleted successfully",
	});
});

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };