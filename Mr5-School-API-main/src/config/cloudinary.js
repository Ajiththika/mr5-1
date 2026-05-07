import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Initialize Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "mr5school",
    api_key: process.env.CLOUDINARY_API_KEY || "835476267536328",
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage Engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine folder based on resource type
        const isVideo = file.mimetype.startsWith("video");

        return {
            folder: "mr5_uploads",
            resource_type: isVideo ? "video" : "image",
            allowed_formats: ["jpg", "png", "webp", "mp4", "mov"],
            // Ensure high quality for videos
            transformation: isVideo ? [{ quality: "auto" }] : [{ width: 1000, height: 1000, crop: "limit" }],
        };
    },
});

export { cloudinary, storage };
