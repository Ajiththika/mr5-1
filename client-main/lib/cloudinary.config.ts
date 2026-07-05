/** Client-side Cloudinary configuration (public vars only — never API secrets). */

export type CloudinaryClientConfig = {
  cloudName: string;
  uploadPreset: string | null;
  uploadUrl: string;
  deliveryBaseUrl: string;
};

function trim(value: string | undefined): string {
  return value?.trim() ?? "";
}

/**
 * Returns public Cloudinary config or throws with an actionable message.
 * Use before building upload URLs or opening the upload widget.
 */
export function getCloudinaryClientConfig(): CloudinaryClientConfig {
  const cloudName = trim(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing. Set it in client-main/.env (e.g. mr5).",
    );
  }

  if (cloudName.includes("/") || cloudName.includes(" ")) {
    throw new Error(
      `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is invalid: "${cloudName}". Use your Cloudinary cloud name only (e.g. mr5).`,
    );
  }

  const uploadPreset = trim(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) || null;

  return {
    cloudName,
    uploadPreset,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    deliveryBaseUrl: `https://res.cloudinary.com/${cloudName}`,
  };
}

/** Safe check for UI — returns null instead of throwing. */
export function getCloudinaryClientConfigOrNull(): CloudinaryClientConfig | null {
  try {
    return getCloudinaryClientConfig();
  } catch {
    return null;
  }
}

export function assertUnsignedUploadPreset(): string {
  const { uploadPreset } = getCloudinaryClientConfig();
  if (!uploadPreset) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is missing. Create an unsigned upload preset in Cloudinary (e.g. mr5_unsigned) or use backend uploads via /api/upload.",
    );
  }
  return uploadPreset;
}
