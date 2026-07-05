/** Prefer localhost over 127.0.0.1 so OAuth redirect_uri matches Google Console. */
function normalizeApiOrigin(url: string): string {
  return url.replace(/\/$/, "").replace("://127.0.0.1", "://localhost");
}

/** Browser API base URL — cookies are set on the API origin. */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return normalizeApiOrigin(configured);
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5001`;
  }
  return "http://localhost:5001";
}

/** Google OAuth starts on the API origin — must match GOOGLE_CALLBACK_URL host/port. */
export function getGoogleOAuthUrl(): string {
  return `${getApiBaseUrl()}/api/auth/google`;
}
