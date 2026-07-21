/** Prefer localhost over 127.0.0.1 so OAuth redirect_uri matches Google Console. */
function normalizeApiOrigin(url: string): string {
  return url.replace(/\/$/, "").replace("://127.0.0.1", "://localhost");
}

/** 
 * Browser API base URL — always uses relative paths so requests route through 
 * Next.js rewrite rules (next.config rewrites /api/* -> backend:5001/api/*).
 * This eliminates CORS issues entirely since all requests stay same-origin.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Always use relative path so axios hits `/api/...` on the same origin.
    // Next.js rewrites proxy these to the backend (localhost:5001).
    // This avoids cross-origin (CORS) issues in development.
    return "";
  }

  // Server-side rendering (SSR) — connect directly to the backend
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return normalizeApiOrigin(configured);
  
  return "http://localhost:5001";
}

/** Google OAuth starts on the API origin — must match GOOGLE_CALLBACK_URL host/port. */
export function getGoogleOAuthUrl(): string {
  // We use the absolute origin here to ensure the OAuth flow redirects to the correct domain
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
      return `${window.location.origin}/api/auth/google`;
  }
  return `${getApiBaseUrl()}/api/auth/google`;
}
