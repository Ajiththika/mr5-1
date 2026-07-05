/** @jest-environment node */
import { NextRequest } from "next/server";

describe("proxyToApi", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://127.0.0.1:5999";
    jest.resetModules();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("forwards query params and returns redirect with Set-Cookie", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(null, {
        status: 302,
        headers: {
          Location: "http://localhost:3000/dashboard",
          "Set-Cookie": "access_token=abc; Path=/; HttpOnly; SameSite=Lax",
        },
      }),
    ) as typeof fetch;

    const { proxyToApi } = await import("./api-proxy");
    const request = new NextRequest(
      "http://localhost:3000/api/auth/google/callback?code=test-code&state=xyz",
    );

    const response = await proxyToApi(request, "/api/auth/google/callback");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:5999/api/auth/google/callback?code=test-code&state=xyz",
      expect.objectContaining({ redirect: "manual" }),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
    expect(response.headers.get("set-cookie")).toContain("access_token=abc");
  });

  it("forwards JSON provider payload", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      Response.json({ success: true, data: { google: true } }),
    ) as typeof fetch;

    const { proxyToApi } = await import("./api-proxy");
    const request = new NextRequest("http://localhost:3000/api/auth/providers");
    const response = await proxyToApi(request, "/api/auth/providers");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.google).toBe(true);
  });
});
