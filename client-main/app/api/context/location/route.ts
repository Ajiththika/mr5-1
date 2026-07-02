import { NextResponse } from "next/server";

type IpLocationPayload = {
  country: string;
  region?: string;
  state?: string;
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string;
};

const DEFAULT: IpLocationPayload = {
  country: "Sri Lanka",
  region: "Western Province",
  state: "Western Province",
  city: "Colombo",
  timezone: "Asia/Colombo",
};

export async function GET() {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error("IP geolocation provider error");

    const data = await response.json();
    const payload: IpLocationPayload = {
      country: data.country_name ?? DEFAULT.country,
      region: data.region ?? undefined,
      state: data.region ?? undefined,
      city: data.city ?? undefined,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      timezone: data.timezone ?? DEFAULT.timezone,
    };

    return NextResponse.json(
      { success: true, data: payload },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      },
    );
  } catch {
    return NextResponse.json({ success: true, data: DEFAULT });
  }
}
