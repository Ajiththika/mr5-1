import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
	cloudName,
	apiKey,
	apiSecret,
	isCloudinaryConfigured,
} from "../utils/cloudinaryConfig.js";

if (!isCloudinaryConfigured) {
	console.warn(
		"Cloudinary is not fully configured (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Upload routes will fail until set.",
	);
}

cloudinary.config({
	cloud_name: cloudName,
	api_key: apiKey,
	api_secret: apiSecret,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith("video");

        return {
            folder: "mr5_uploads",
            resource_type: isVideo ? "video" : "image",
            allowed_formats: ["jpg", "png", "webp", "mp4", "mov"],
            transformation: isVideo ? [{ quality: "auto" }] : [{ width: 1000, height: 1000, crop: "limit" }],
        };
    },
});

export { cloudinary, storage };
export { isCloudinaryConfigured, getCloudinaryPublicConfig } from "../utils/cloudinaryConfig.js";
