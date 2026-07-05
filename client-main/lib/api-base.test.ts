import { getApiBaseUrl, getGoogleOAuthUrl } from "@/lib/api-base";

describe("api-base", () => {
  const original = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = original;
  });

  it("builds Google OAuth URL on API origin", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:5001";
    expect(getGoogleOAuthUrl()).toBe("http://localhost:5001/api/auth/google");
  });

  it("normalizes 127.0.0.1 to localhost for OAuth", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://127.0.0.1:5001";
    expect(getApiBaseUrl()).toBe("http://localhost:5001");
    expect(getGoogleOAuthUrl()).toBe("http://localhost:5001/api/auth/google");
  });
});
