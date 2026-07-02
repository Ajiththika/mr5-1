import { NextRequest, NextResponse } from "next/server";

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const search = searchParams.get("search")?.trim() ?? "";
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "50";
  const category = searchParams.get("category")?.trim() ?? "";
  const level = searchParams.get("level")?.trim() ?? "";

  const backendParams = new URLSearchParams();
  if (search) backendParams.set("search", search);
  backendParams.set("page", page);
  backendParams.set("limit", limit);
  if (category) backendParams.set("category", category);
  if (level) backendParams.set("level", level);

  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/courses?${backendParams.toString()}`,
      {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { data: [], total: 0, page: Number(page), limit: Number(limit) },
        { status: response.status },
      );
    }

    const body = await response.json();
    const data = Array.isArray(body.data) ? body.data : [];
    const total =
      body.pagination?.totalItems ?? body.total ?? data.length;
    const currentPage = body.pagination?.currentPage ?? Number(page);
    const itemsPerPage = body.pagination?.itemsPerPage ?? Number(limit);

    return NextResponse.json({
      data,
      total,
      page: currentPage,
      limit: itemsPerPage,
    });
  } catch {
    return NextResponse.json(
      { data: [], total: 0, page: Number(page), limit: Number(limit) },
      { status: 502 },
    );
  }
}
