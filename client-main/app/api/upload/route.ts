import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env.server";

/** Proxy multipart uploads to the Express API with auth cookies. */
export async function POST(request: NextRequest) {
  const apiBase = serverEnv.apiUrl().replace(/\/$/, "");
  const target = `${apiBase}/api/upload`;

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const forwardedFor =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const body = await request.arrayBuffer();

  const response = await fetch(target, {
    method: "POST",
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const responseBody = await response.text();
  const nextResponse = new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });

  if (typeof response.headers.getSetCookie === "function") {
    for (const cookieHeader of response.headers.getSetCookie()) {
      nextResponse.headers.append("set-cookie", cookieHeader);
    }
  }

  return nextResponse;
}

export async function GET() {
  const apiBase = serverEnv.apiUrl().replace(/\/$/, "");
  const response = await fetch(`${apiBase}/api/upload/config`, { cache: "no-store" });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
