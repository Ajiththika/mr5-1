import multer from "multer";
import { storage } from "../config/cloudinary.js";

/**
 * Filter files based on type (Image/Video)
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/quicktime", // .mov
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file format. Please upload JPG, PNG, WEBP, MP4, or MOV."), false);
    }
};

/**
 * Multer Upload Middleware
 * Limits: 10MB for images, 50MB for videos
 */
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max
    },
});

export default upload;
