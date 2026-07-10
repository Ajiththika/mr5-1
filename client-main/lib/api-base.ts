/** Prefer localhost over 127.0.0.1 so OAuth redirect_uri matches Google Console. */
function normalizeApiOrigin(url: string): string {
  return url.replace(/\/$/, "").replace("://127.0.0.1", "://localhost");
}

/** 
 * Browser API base URL — intelligently detects if we are running behind a virtual host 
 * proxy and uses relative paths to route through Next.js rewrite rules instead of 
 * exposing the backend port to the client browser.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // If the browser is on a real domain/IP but the hardcoded NEXT_PUBLIC_API_URL 
    // points to localhost, we MUST use a relative path so Next.js proxies it to the backend.
    const isBrowserLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    
    if (!isBrowserLocalhost) {
      // Use relative path (empty string) so axios hits `/api/...` on the same domain
      return "";
    }
    
    // Otherwise, it's safe to use the same hostname with port 5001 for local dev
    return `${window.location.protocol}//${window.location.hostname}:5001`;
  }

  // Server-side rendering (SSR) logic
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
