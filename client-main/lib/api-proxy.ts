import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env.server";

/** Proxy a browser request to the Express API, preserving cookies and redirects. */
export async function proxyToApi(
  request: NextRequest,
  apiPath: string,
): Promise<NextResponse> {
  const apiBase = serverEnv.apiUrl().replace(/\/$/, "");
  const target = new URL(`${apiBase}${apiPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent);

  const forwardedFor =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip");
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);

  const host = request.headers.get("host");
  if (host) headers.set("x-forwarded-host", host);

  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  headers.set("x-forwarded-proto", proto);

  let response: Response;
  try {
    response = await fetch(target.toString(), {
      method: request.method,
      headers,
      redirect: "manual",
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[api-proxy] ${apiPath} → ${target.origin} unreachable:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "API_UNAVAILABLE",
        message: "Backend API is not reachable. Start Mr5-School-API-main on port 5001.",
      },
      { status: 503 },
    );
  }

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (location) {
      const redirectResponse = NextResponse.redirect(location, response.status);
      appendSetCookies(response, redirectResponse);
      return redirectResponse;
    }
  }

  const body = await response.arrayBuffer();
  const nextResponse = new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
  });

  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "set-cookie" || lower === "transfer-encoding") return;
    nextResponse.headers.set(key, value);
  });

  appendSetCookies(response, nextResponse);
  return nextResponse;
}

function appendSetCookies(from: Response, to: NextResponse) {
  if (typeof from.headers.getSetCookie === "function") {
    for (const cookie of from.headers.getSetCookie()) {
      to.headers.append("set-cookie", cookie);
    }
    return;
  }

  const raw = from.headers.get("set-cookie");
  if (raw) to.headers.append("set-cookie", raw);
}
