import { NextRequest } from "next/server";
import { proxyToApi } from "@/lib/api-proxy";

/** Start Google OAuth — proxied so cookies land on the web origin (localhost:3000). */
export async function GET(request: NextRequest) {
  return proxyToApi(request, "/api/auth/google");
}
