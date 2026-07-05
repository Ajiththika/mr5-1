import express from "express";
import multer from "multer";
import upload from "../middleware/upload.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";
import {
	assertCloudinaryConfigured,
	getCloudinaryPublicConfig,
	isCloudinaryConfigured,
} from "../utils/cloudinaryConfig.js";
import { cloudinary } from "../config/cloudinary.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

/**
 * @route   GET /api/upload/config
 * @desc    Public Cloudinary availability (no secrets)
 */
router.get(
	"/config",
	asyncHandler(async (_req, res) => {
		res.status(200).json({
			success: true,
			data: getCloudinaryPublicConfig(),
		});
	}),
);

/**
 * @route   POST /api/upload
 * @desc    Upload single file to Cloudinary (signed, server-side)
 */
router.post(
	"/",
	...protect,
	(req, res, next) => {
		if (!isCloudinaryConfigured) {
			return res.status(503).json({
				success: false,
				message: "Cloudinary is not configured on the server.",
				error: "CLOUDINARY_NOT_CONFIGURED",
			});
		}
		return next();
	},
	upload.single("file"),
	asyncHandler(async (req, res) => {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: "No file uploaded",
			});
		}

		res.status(200).json({
			success: true,
			message: "File uploaded successfully to Cloudinary",
			data: {
				url: req.file.path,
				secure_url: req.file.path,
				public_id: req.file.filename,
				format: req.file.mimetype,
				size: req.file.size,
			},
		});
	}),
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files to Cloudinary
 * @access  Private
 */
router.post(
	"/multiple",
	...protect,
	(req, res, next) => {
		if (!isCloudinaryConfigured) {
			return res.status(503).json({
				success: false,
				message: "Cloudinary is not configured on the server.",
				error: "CLOUDINARY_NOT_CONFIGURED",
			});
		}
		return next();
	},
	upload.array("files", 5),
	asyncHandler(async (req, res) => {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No files uploaded",
			});
		}

		const results = req.files.map((file) => ({
			url: file.path,
			secure_url: file.path,
			public_id: file.filename,
		}));

		res.status(200).json({
			success: true,
			message: `${results.length} files uploaded successfully`,
			data: results,
		});
	}),
);

/**
 * @route   POST /api/upload/delete
 * @desc    Delete asset from Cloudinary (signed, server-side)
 */
router.post(
	"/delete",
	...protect,
	asyncHandler(async (req, res) => {
		assertCloudinaryConfigured();
		const { publicId, resourceType = "image" } = req.body ?? {};

		if (!publicId) {
			return res.status(400).json({
				success: false,
				message: "publicId is required",
			});
		}

		const result = await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
		});

		res.status(200).json({
			success: true,
			result: result.result,
		});
	}),
);

router.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		return res.status(400).json({
			success: false,
			message: err.message,
			error: "UPLOAD_ERROR",
		});
	}
	if (err?.message?.includes("Unsupported file format")) {
		return res.status(400).json({
			success: false,
			message: err.message,
			error: "INVALID_FILE_TYPE",
		});
	}
	if (err?.message?.includes("Cloudinary") || err?.http_code) {
		console.error("Cloudinary upload error:", err.message || err);
		return res.status(502).json({
			success: false,
			message: "Cloudinary upload failed. Check server Cloudinary configuration.",
			error: "CLOUDINARY_UPLOAD_FAILED",
		});
	}
	if (err) {
		console.error("Upload route error:", err);
		return res.status(500).json({
			success: false,
			message: err.message || "Upload failed",
			error: "UPLOAD_FAILED",
		});
	}
	return next(err);
});

export default router;
