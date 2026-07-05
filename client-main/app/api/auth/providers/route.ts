import { NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/api-proxy";

function fallbackProviders(): NextResponse {
  const google =
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true" ||
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  return NextResponse.json({
    success: true,
    data: { google },
  });
}

/** Auth provider availability (Google button visibility). */
export async function GET(request: NextRequest) {
  try {
    const response = await proxyToApi(request, "/api/auth/providers");
    if (response.ok) return response;
    if (response.status === 503) return fallbackProviders();
    return response;
  } catch {
    return fallbackProviders();
  }
}
