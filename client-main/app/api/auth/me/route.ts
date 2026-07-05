import { NextRequest } from "next/server";
import { proxyAuthApi } from "@/lib/auth-proxy";

export async function GET(request: NextRequest) {
  return proxyAuthApi(request, { apiPath: "/api/auth/me", includeBody: false });
}
