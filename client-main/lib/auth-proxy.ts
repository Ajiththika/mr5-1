import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env.server";

type ProxyOptions = {
  apiPath: string;
  includeBody?: boolean;
};

/** Proxy auth API calls to Express, forwarding cookies in both directions. */
export async function proxyAuthApi(
  request: NextRequest,
  { apiPath, includeBody = true }: ProxyOptions,
): Promise<NextResponse> {
  const apiBase = serverEnv.apiUrl().replace(/\/$/, "");
  const target = new URL(`${apiBase}${apiPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent);

  const forwardedFor =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);

  const init: globalThis.RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };

  if (includeBody && request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const response = await fetch(target.toString(), init);
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
