import { NextRequest } from "next/server";
import { proxyToApi } from "@/lib/api-proxy";

/** Google OAuth callback — forwards code/state to API and returns Set-Cookie + redirect. */
export async function GET(request: NextRequest) {
  return proxyToApi(request, "/api/auth/google/callback");
}
