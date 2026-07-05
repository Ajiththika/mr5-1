import { NextRequest } from "next/server";
import { proxyAuthApi } from "@/lib/auth-proxy";

export async function POST(request: NextRequest) {
  return proxyAuthApi(request, { apiPath: "/api/auth/logout" });
}
