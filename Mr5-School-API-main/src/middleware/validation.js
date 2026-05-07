import { body, param, query, validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "./errorHandler.js";

// Validation result handler
export const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			success: false,
			error: "Validation Error",
			details: errors.array().map((err) => ({
				field: err.path || err.param,
				message: err.msg,
				value: err.value,
			})),
		});
	}
	next();
};

// MongoDB ObjectId validation
export const validateObjectId = (paramName = "id") => {
	return param(paramName)
		.isMongoId()
		.withMessage(`Invalid ${paramName} format`);
};

// User validation rules
export const validateRegister = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ min: 2, max: 50 })
		.withMessage("Name must be between 2 and 50 characters"),
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Please provide a valid email")
		.normalizeEmail(),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
	body("role")
		.optional()
		.isIn(["student", "AI-TEACHER", "admin"])
		.withMessage("Role must be student, AI-TEACHER, or admin"),
];

export const validateLogin = [
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Please provide a valid email")
		.normalizeEmail(),
	body("password").notEmpty().withMessage("Password is required"),
];

export const validateUpdateDetails = [
	body("name")
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage("Name must be between 2 and 50 characters"),
	body("email")
		.optional()
		.trim()
		.isEmail()
		.withMessage("Please provide a valid email")
		.normalizeEmail(),
	body("language")
		.optional()
		.isIn(["English", "Tamil", "Sinhala"])
		.withMessage("Language must be English, Tamil, or Sinhala"),
];

export const validateUpdatePassword = [
	body("currentPassword")
		.notEmpty()
		.withMessage("Current password is required"),
	body("newPassword")
		.notEmpty()
		.withMessage("New password is required")
		.isLength({ min: 6 })
		.withMessage("New password must be at least 6 characters"),
];

// Course validation rules
export const validateCourse = [
	body("title")
		.trim()
		.notEmpty()
		.withMessage("Title is required")
		.isLength({ min: 3, max: 200 })
		.withMessage("Title must be between 3 and 200 characters"),
	body("description")
		.optional()
		.trim()
		.isLength({ max: 5000 })
		.withMessage("Description must be less than 5000 characters"),
	body("category").optional().trim(),
	body("AI-TEACHER")
		.notEmpty()
		.withMessage("AI-TEACHER ID is required")
		.isMongoId()
		.withMessage("Invalid AI-TEACHER ID format"),
	body("level")
		.optional()
		.isIn(["Beginner", "Intermediate", "Advanced"])
		.withMessage("Level must be Beginner, Intermediate, or Advanced"),
	body("price")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Price must be a positive number"),
	body("language")
		.optional()
		.isIn(["English", "Tamil", "Sinhala"])
		.withMessage("Language must be English, Tamil, or Sinhala"),
];

// Enrollment validation rules
export const validateEnrollment = [
	body("student")
		.notEmpty()
		.withMessage("Student ID is required")
		.isMongoId()
		.withMessage("Invalid student ID format"),
	body("course")
		.notEmpty()
		.withMessage("Course ID is required")
		.isMongoId()
		.withMessage("Invalid course ID format"),
	body("progress")
		.optional()
		.isInt({ min: 0, max: 100 })
		.withMessage("Progress must be between 0 and 100"),
	body("status")
		.optional()
		.isIn(["active", "completed"])
		.withMessage("Status must be active or completed"),
];

// Lesson validation rules
export const validateLesson = [
	body("course")
		.notEmpty()
		.withMessage("Course ID is required")
		.isMongoId()
		.withMessage("Invalid course ID format"),
	body("title")
		.trim()
		.notEmpty()
		.withMessage("Title is required")
		.isLength({ min: 3, max: 200 })
		.withMessage("Title must be between 3 and 200 characters"),
	body("videoUrl").optional().isURL().withMessage("Video URL must be valid"),
	body("content").optional().trim(),
	body("duration")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Duration must be a positive number"),
	body("order")
		.optional()
		.isInt({ min: 0 })
		.withMessage("Order must be a positive number"),
];

// Assignment validation rules
export const validateAssignment = [
	body("course")
		.notEmpty()
		.withMessage("Course ID is required")
		.isMongoId()
		.withMessage("Invalid course ID format"),
	body("AI-TEACHER")
		.notEmpty()
		.withMessage("AI-TEACHER ID is required")
		.isMongoId()
		.withMessage("Invalid AI-TEACHER ID format"),
	body("title")
		.trim()
		.notEmpty()
		.withMessage("Title is required")
		.isLength({ min: 3, max: 200 })
		.withMessage("Title must be between 3 and 200 characters"),
	body("description").optional().trim(),
	body("dueDate")
		.optional()
		.isISO8601()
		.withMessage("Due date must be a valid date"),
];

// Submission validation rules
export const validateSubmission = [
	body("assignment")
		.notEmpty()
		.withMessage("Assignment ID is required")
		.isMongoId()
		.withMessage("Invalid assignment ID format"),
	body("student")
		.notEmpty()
		.withMessage("Student ID is required")
		.isMongoId()
		.withMessage("Invalid student ID format"),
	body("fileUrl").optional().isURL().withMessage("File URL must be valid"),
	body("grade")
		.optional()
		.isIn(["Pending", "A", "B", "C", "D", "F"])
		.withMessage("Grade must be Pending, A, B, C, D, or F"),
	body("feedback").optional().trim(),
];

// Payment validation rules
export const validatePayment = [
	body("user")
		.notEmpty()
		.withMessage("User ID is required")
		.isMongoId()
		.withMessage("Invalid user ID format"),
	body("course")
		.notEmpty()
		.withMessage("Course ID is required")
		.isMongoId()
		.withMessage("Invalid course ID format"),
	body("amount")
		.notEmpty()
		.withMessage("Amount is required")
		.isFloat({ min: 0 })
		.withMessage("Amount must be a positive number"),
	body("method")
		.notEmpty()
		.withMessage("Payment method is required")
		.isIn(["PayHere", "Stripe", "WebXPay"])
		.withMessage("Payment method must be PayHere, Stripe, or WebXPay"),
	body("status")
		.optional()
		.isIn(["pending", "completed", "failed"])
		.withMessage("Status must be pending, completed, or failed"),
	body("transactionId").optional().trim(),
];

// AI Interaction validation rules
export const validateAIInteraction = [
	body("user")
		.notEmpty()
		.withMessage("User ID is required")
		.isMongoId()
		.withMessage("Invalid user ID format"),
	body("course").optional().isMongoId().withMessage("Invalid course ID format"),
	body("question")
		.trim()
		.notEmpty()
		.withMessage("Question is required")
		.isLength({ min: 3, max: 1000 })
		.withMessage("Question must be between 3 and 1000 characters"),
	body("response").optional().trim(),
	body("mode")
		.optional()
		.isIn(["text", "voice"])
		.withMessage("Mode must be text or voice"),
];

// Pagination validation
export const validatePagination = [
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
];
