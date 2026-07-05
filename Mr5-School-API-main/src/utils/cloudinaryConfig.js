const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() || "";
const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || "";

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

export function getCloudinaryPublicConfig() {
	return {
		configured: isCloudinaryConfigured,
		cloudName: cloudName || null,
	};
}

export function assertCloudinaryConfigured() {
	if (!isCloudinaryConfigured) {
		throw new Error(
			"Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Mr5-School-API-main/.env.",
		);
	}
	return { cloudName, apiKey, apiSecret };
}

export { cloudName, apiKey, apiSecret };
