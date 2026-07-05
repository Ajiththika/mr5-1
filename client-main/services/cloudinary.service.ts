import { CldUploadWidget, CldImage, CldVideoPlayer } from "next-cloudinary";
import {
  assertUnsignedUploadPreset,
  getCloudinaryClientConfig,
} from "@/lib/cloudinary.config";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  original_filename?: string;
  format?: string;
  resource_type?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

interface UploadOptions {
  folder?: string;
  tags?: string[];
  resource_type?: "image" | "video" | "raw" | "auto";
  eager?: string;
  overwrite?: boolean;
}

function normalizeUploadResult(data: Record<string, unknown>): CloudinaryUploadResult {
  const url =
    (data.secure_url as string) ||
    (data.url as string) ||
    ((data.data as Record<string, unknown> | undefined)?.url as string);

  const publicId =
    (data.public_id as string) ||
    ((data.data as Record<string, unknown> | undefined)?.public_id as string);

  if (!url || !publicId) {
    throw new Error("Upload response missing url or public_id");
  }

  return {
    secure_url: url,
    public_id: publicId,
    original_filename: data.original_filename as string | undefined,
    format: data.format as string | undefined,
    resource_type: (data.resource_type as string) || "image",
    bytes: data.bytes as number | undefined,
    width: data.width as number | undefined,
    height: data.height as number | undefined,
  };
}

/**
 * Signed upload via Express API (recommended — API secret never exposed to browser).
 */
async function uploadViaBackend(
  file: File,
  options: UploadOptions = {},
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  if (options.folder) formData.append("folder", options.folder);
  if (options.tags?.length) formData.append("tags", options.tags.join(","));

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (payload as { message?: string; error?: string }).message ||
      (payload as { error?: string }).error ||
      `Backend upload failed (${response.status})`;
    throw new Error(message);
  }

  return normalizeUploadResult(
    ((payload as { data?: Record<string, unknown> }).data ?? payload) as Record<string, unknown>,
  );
}

/**
 * Unsigned upload via Cloudinary upload preset (optional — requires dashboard preset).
 */
async function uploadViaUnsignedPreset(
  file: File,
  options: UploadOptions = {},
): Promise<CloudinaryUploadResult> {
  const { uploadUrl } = getCloudinaryClientConfig();
  const uploadPreset = assertUnsignedUploadPreset();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (options.folder) formData.append("folder", options.folder);
  if (options.tags?.length) formData.append("tags", options.tags.join(","));
  if (options.resource_type) formData.append("resource_type", options.resource_type);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (payload as { error?: { message?: string } }).error?.message ||
      JSON.stringify(payload);
    throw new Error(`Cloudinary unsigned upload failed (${response.status}): ${message}`);
  }

  return normalizeUploadResult(payload as Record<string, unknown>);
}

/**
 * Upload a file — tries signed backend upload first, then unsigned preset fallback.
 */
export const uploadToCloudinary = async (
  file: File,
  options: UploadOptions = {},
): Promise<CloudinaryUploadResult> => {
  try {
    return await uploadViaBackend(file, options);
  } catch (backendError) {
    const hasPreset = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim());
    const hasCloudName = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim());

    if (!hasCloudName) {
      throw new Error(
        "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing. Check client-main/.env.",
      );
    }

    if (!hasPreset) {
      const reason =
        backendError instanceof Error ? backendError.message : "Backend upload failed";
      throw new Error(
        `${reason}. Sign in and ensure the API Cloudinary env vars are set, or configure NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET for unsigned uploads.`,
      );
    }

    return uploadViaUnsignedPreset(file, options);
  }
};

export const uploadMultipleToCloudinary = async (
  files: File[],
  options: UploadOptions = {},
): Promise<CloudinaryUploadResult[]> => {
  return Promise.all(files.map((file) => uploadToCloudinary(file, options)));
};

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<boolean> => {
  const response = await fetch("/api/upload/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ publicId, resourceType }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(
      (payload as { message?: string }).message || `Delete failed (${response.status})`,
    );
  }

  const payload = await response.json();
  return (payload as { result?: string }).result === "ok";
};

export { CldUploadWidget, CldImage, CldVideoPlayer as CldVideo };
