import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";
}

function forwardCookies(request: NextRequest): Record<string, string> {
  const cookie = request.headers.get("cookie");
  return cookie ? { cookie, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/courses/discovery/suggestions?q=${encodeURIComponent(q)}`,
      { headers: { "Content-Type": "application/json" }, cache: "no-store" },
    );

    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, data: { suggestions: [], courses: [] } },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await fetch(`${getApiBaseUrl()}/api/courses/discovery/discover`, {
      method: "POST",
      headers: forwardCookies(request),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, error: "Discovery service unavailable" }, { status: 502 });
  }
}
