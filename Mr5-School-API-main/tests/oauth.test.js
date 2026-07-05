import request from "supertest";
import app from "../src/app.js";
import { isGoogleOAuthEnabled } from "../src/config/passport.js";
import envConfig from "../src/config/env.js";

describe("Google OAuth", () => {
	if (isGoogleOAuthEnabled) {
		describe("when credentials are configured", () => {
			test("GET /api/auth/providers reports google enabled", async () => {
				const res = await request(app).get("/api/auth/providers");
				expect(res.status).toBe(200);
				expect(res.body.data.google).toBe(true);
			});

			test("GET /api/auth/google redirects to Google OAuth", async () => {
				const res = await request(app).get("/api/auth/google");
				expect(res.status).toBe(302);
				expect(res.headers.location).toMatch(/^https:\/\/accounts\.google\.com/);
				expect(res.headers.location).toContain("client_id=");
			});

			test("callback URL in redirect matches configured GOOGLE_CALLBACK_URL", async () => {
				const res = await request(app).get("/api/auth/google");
				const location = res.headers.location;
				expect(location).toBeDefined();
				const redirectUri = new URL(location).searchParams.get("redirect_uri");
				const decoded = decodeURIComponent(redirectUri || "");
				expect(decoded).toBe(envConfig.GOOGLE_CALLBACK_URL);
				expect(decoded).not.toMatch(/\/$/);
				expect(decoded).not.toContain("127.0.0.1");
				expect(decoded).toContain(`:${envConfig.PORT}/`);
				expect(decoded).toBe(
					`http://localhost:${envConfig.PORT}/api/auth/google/callback`,
				);
			});

			test("OAuth start includes profile and email scopes", async () => {
				const res = await request(app).get("/api/auth/google");
				const location = res.headers.location;
				const scope = new URL(location).searchParams.get("scope") || "";
				expect(scope).toMatch(/profile/);
				expect(scope).toMatch(/email/);
			});

			test("GET /api/auth/google/callback without code does not crash", async () => {
				const res = await request(app).get("/api/auth/google/callback");
				expect([302, 401, 500]).toContain(res.status);
			});
		});
	} else {
		describe("when credentials are not configured", () => {
			test("GET /api/auth/providers reports google disabled", async () => {
				const res = await request(app).get("/api/auth/providers");
				expect(res.status).toBe(200);
				expect(res.body.data.google).toBe(false);
			});

			test("GET /api/auth/google returns 503", async () => {
				const res = await request(app).get("/api/auth/google");
				expect(res.status).toBe(503);
			});
		});
	}
});
