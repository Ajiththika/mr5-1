/**
 * AWS-ready 3D asset URL resolution.
 * Local: /public/models/*  |  Production: CloudFront + S3 via env vars.
 */

import { MODEL_ASSETS } from "./model-registry";

type CdnEnvKey =
  | "NEXT_PUBLIC_CDN_GANESHA_MODEL"
  | "NEXT_PUBLIC_CDN_CLASSROOM_MODEL"
  | "NEXT_PUBLIC_CDN_BASE_URL";

function readEnv(key: CdnEnvKey): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[key]?.trim() || undefined;
}

/**
 * Resolve model URL: explicit CDN URL > CDN base + path > local public path.
 */
export function resolveModelUrl(
  localPath: string,
  cdnEnvKey?: CdnEnvKey,
): string {
  const direct = cdnEnvKey ? readEnv(cdnEnvKey) : undefined;
  if (direct) return direct;

  const base = readEnv("NEXT_PUBLIC_CDN_BASE_URL");
  if (base) {
    const normalized = localPath.startsWith("/") ? localPath : `/${localPath}`;
    return `${base.replace(/\/$/, "")}${normalized}`;
  }

  return localPath;
}

export function getGaneshaModelUrl(): string {
  return resolveModelUrl(
    MODEL_ASSETS.ganesha.path,
    MODEL_ASSETS.ganesha.cdnEnvKey,
  );
}

export function getClassroomModelUrl(): string {
  return resolveModelUrl(
    MODEL_ASSETS.classroom.path,
    MODEL_ASSETS.classroom.cdnEnvKey,
  );
}

/** AWS deployment env template (document in .env.example) */
export const AWS_ASSET_ENV_KEYS = {
  CDN_BASE: "NEXT_PUBLIC_CDN_BASE_URL",
  GANESHA: "NEXT_PUBLIC_CDN_GANESHA_MODEL",
  CLASSROOM: "NEXT_PUBLIC_CDN_CLASSROOM_MODEL",
  S3_BUCKET: "AWS_S3_ASSETS_BUCKET",
  CLOUDFRONT_DIST: "AWS_CLOUDFRONT_DISTRIBUTION_ID",
} as const;
