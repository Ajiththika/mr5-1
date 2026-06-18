import { NextRequest, NextResponse } from "next/server";

type WeatherPayload = {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  city: string;
};

function mockWeather(): WeatherPayload {
  return {
    condition: "Clear",
    temperature: 22,
    humidity: 52,
    windSpeed: 2.5,
    city: "Local Classroom",
  };
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lon = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { success: false, message: "lat and lon query parameters are required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: true, data: mockWeather() });
  }

  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", "metric");

    const response = await fetch(url, { next: { revalidate: 900 } });
    if (!response.ok) throw new Error("Weather provider error");

    const payload = await response.json();
    const data: WeatherPayload = {
      condition: payload.weather?.[0]?.main ?? "Clear",
      temperature: payload.main?.temp ?? 22,
      humidity: payload.main?.humidity ?? 50,
      windSpeed: payload.wind?.speed ?? 2,
      city: payload.name ?? "Your area",
    };

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      },
    );
  } catch {
    return NextResponse.json({ success: true, data: mockWeather() });
  }
}
