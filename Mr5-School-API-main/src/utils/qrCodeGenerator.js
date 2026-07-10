/**
 * qrCodeGenerator.js
 * MR5 Academy Certification Standard — QR Code Generation Utility
 *
 * Generates QR codes for:
 *   1. Certificate verification links
 *   2. Student ID cards (links to certification profile)
 *
 * Returns base64 PNG data URLs suitable for embedding in PDFs or HTML,
 * or for uploading to Cloudinary.
 */
import QRCode from "qrcode";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.CLIENT_URL || "https://mr5school.com";

// Default QR code options — premium dark theme
const DEFAULT_OPTIONS = {
	type: "image/png",
	quality: 1,
	margin: 1,
	color: {
		dark: "#1a1a2e",  // Deep navy for QR modules
		light: "#ffffff", // White background
	},
	width: 300,
	errorCorrectionLevel: "H", // Highest error correction (30% damage tolerance)
};

const SMALL_OPTIONS = {
	...DEFAULT_OPTIONS,
	width: 150,
};

/**
 * Generate a QR code for a certificate verification URL.
 *
 * @param {string} certificateId - e.g. MR5-2026-LK-000001-C01
 * @param {object} [options]     - Optional QR options override
 * @returns {Promise<string>}    - Base64 PNG data URL
 */
export async function generateCertificateQR(certificateId, options = {}) {
	const verificationUrl = `${BASE_URL}/verify/${certificateId}`;
	const qrOptions = { ...DEFAULT_OPTIONS, ...options };

	const dataUrl = await QRCode.toDataURL(verificationUrl, qrOptions);
	return { dataUrl, verificationUrl };
}

/**
 * Generate a QR code for a student's certification profile.
 *
 * @param {string} certificationId - e.g. MR5-2026-LK-000001
 * @param {object} [options]       - Optional QR options override
 * @returns {Promise<{ dataUrl: string, profileUrl: string }>}
 */
export async function generateStudentIdQR(certificationId, options = {}) {
	const profileUrl = `${BASE_URL}/u/${certificationId}`;
	const qrOptions = { ...SMALL_OPTIONS, ...options };

	const dataUrl = await QRCode.toDataURL(profileUrl, qrOptions);
	return { dataUrl, profileUrl };
}

/**
 * Generate a QR code as a Buffer (for Cloudinary upload or file write).
 *
 * @param {string} content - URL or text to encode
 * @param {object} [options]
 * @returns {Promise<Buffer>}
 */
export async function generateQRBuffer(content, options = {}) {
	const qrOptions = { ...DEFAULT_OPTIONS, ...options };
	return await QRCode.toBuffer(content, qrOptions);
}

/**
 * Generate a QR SVG string (for PDF embedding or display).
 *
 * @param {string} content
 * @param {object} [options]
 * @returns {Promise<string>} - SVG string
 */
export async function generateQRSvg(content, options = {}) {
	return await QRCode.toString(content, {
		type: "svg",
		margin: 1,
		color: {
			dark: "#1a1a2e",
			light: "#ffffff",
		},
		...options,
	});
}
