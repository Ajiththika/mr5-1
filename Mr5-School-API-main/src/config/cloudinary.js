import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
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
