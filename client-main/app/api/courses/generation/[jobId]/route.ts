import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5001";
}

function forwardCookies(request: NextRequest): HeadersInit {
  const cookie = request.headers.get("cookie");
  return cookie ? { cookie } : {};
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/courses/discovery/jobs/${jobId}`, {
      headers: forwardCookies(request),
      cache: "no-store",
    });

    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, error: "Job status unavailable" }, { status: 502 });
  }
}
