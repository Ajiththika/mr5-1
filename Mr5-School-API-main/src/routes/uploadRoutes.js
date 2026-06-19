import express from "express";
import upload from "../middleware/upload.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireLegalConsent } from "../middleware/consentMiddleware.js";

const router = express.Router();
const protect = [verifyToken, requireLegalConsent];

/**
 * @route   POST /api/upload
 * @desc    Upload single file to Cloudinary
 * @access  Private
 */
router.post(
    "/",
    ...protect,
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
                url: req.file.path, // Cloudinary secure_url
                public_id: req.file.filename,
                format: req.file.mimetype,
                size: req.file.size,
            },
        });
    })
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files to Cloudinary
 * @access  Private
 */
router.post(
    "/multiple",
    ...protect,
    upload.array("files", 5), // Max 5 files
    asyncHandler(async (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded",
            });
        }

        const results = req.files.map((file) => ({
            url: file.path,
            public_id: file.filename,
        }));

        res.status(200).json({
            success: true,
            message: `${results.length} files uploaded successfully`,
            data: results,
        });
    })
);

export default router;
