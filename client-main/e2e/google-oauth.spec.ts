import { test, expect } from "@playwright/test";

const API_PORT = process.env.PLAYWRIGHT_API_PORT || "5001";
const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || process.env.PLAYWRIGHT_API_URL || `http://localhost:${API_PORT}`)
    .replace(/\/$/, "")
    .replace("://127.0.0.1", "://localhost");
const EXPECTED_CALLBACK = `http://localhost:${new URL(API_BASE).port || API_PORT}/api/auth/google/callback`;

test.describe("Google OAuth UI", () => {
  test("API providers reports google flag", async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/auth/providers`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.data).toHaveProperty("google");
  });

  test("OAuth start sends exact redirect_uri for Google Console", async ({
    request,
  }) => {
    const res = await request.get(`${API_BASE}/api/auth/google`, {
      maxRedirects: 0,
    });
    expect(res.status()).toBe(302);
    const location = res.headers()["location"];
    expect(location).toBeTruthy();
    expect(location).toMatch(/^https:\/\/accounts\.google\.com/);

    const redirectUri = new URL(location!).searchParams.get("redirect_uri");
    expect(redirectUri).toBe(EXPECTED_CALLBACK);
    expect(redirectUri).not.toContain("127.0.0.1");
    expect(redirectUri).not.toMatch(/\/$/);
  });

  test("Google button navigates to Google with matching redirect_uri", async ({
    page,
  }) => {
    const providers = await page.request.get(`${API_BASE}/api/auth/providers`);
    test.skip(!providers.ok(), "API not reachable");
    const { data } = await providers.json();
    test.skip(!data.google, "Google OAuth not configured in API .env");

    await page.goto("/login");
    const googleButton = page.getByRole("button", { name: /google/i });
    await expect(googleButton).toBeVisible({ timeout: 10000 });

    let authorizeUrl = "";
    page.on("request", (req) => {
      if (req.url().includes("accounts.google.com") && req.url().includes("redirect_uri=")) {
        authorizeUrl = req.url();
      }
    });

    await Promise.all([
      page.waitForURL(/accounts\.google\.com/, { timeout: 20000 }),
      googleButton.click(),
    ]);

    const raw = authorizeUrl || page.url();
    expect(raw).toContain("accounts.google.com");

    const redirectUri = decodeURIComponent(
      raw.split("redirect_uri=")[1]?.split("&")[0] || "",
    );
    // App-side contract: must match Google Console Authorized redirect URI exactly
    expect(redirectUri).toBe(EXPECTED_CALLBACK);
  });
});


