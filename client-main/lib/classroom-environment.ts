export type WeatherTheme =
  | "sunny"
  | "clear"
  | "cloudy"
  | "rainy"
  | "thunderstorm"
  | "foggy"
  | "cold"
  | "windy";

export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

export interface WeatherSnapshot {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  city?: string;
}

export interface EnvironmentLighting {
  ambientIntensity: number;
  ambientColor: string;
  sunIntensity: number;
  sunColor: string;
  fillIntensity: number;
  fillColor: string;
  boardIntensity: number;
  ceilingIntensity: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  background: string;
  environmentIntensity: number;
  windowSkyTop: string;
  windowSkyBottom: string;
  effects: {
    rain: boolean;
    thunder: boolean;
    lightning: boolean;
    wind: boolean;
    fog: boolean;
  };
}

export interface DerivedEnvironment {
  theme: WeatherTheme;
  timePeriod: TimePeriod;
  isNight: boolean;
  localHour: number;
  lighting: EnvironmentLighting;
  label: string;
}

const DEFAULT_WEATHER: WeatherSnapshot = {
  condition: "Clear",
  temperature: 22,
  humidity: 50,
  windSpeed: 2,
  city: "Local",
};

export function getDefaultWeather(): WeatherSnapshot {
  return { ...DEFAULT_WEATHER };
}

export function getLocalHour(now = new Date(), timeZone?: string): number {
  if (timeZone) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        hour12: false,
      }).formatToParts(now);
      const hour = parts.find((p) => p.type === "hour")?.value;
      return hour ? Number(hour) : now.getHours();
    } catch {
      return now.getHours();
    }
  }
  return now.getHours();
}

export function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export function mapConditionToTheme(
  condition: string,
  temperature: number,
  windSpeed: number,
): WeatherTheme {
  const key = condition.toLowerCase();

  if (key.includes("thunder")) return "thunderstorm";
  if (key.includes("rain") || key.includes("drizzle")) return "rainy";
  if (key.includes("mist") || key.includes("fog") || key.includes("haze")) {
    return "foggy";
  }
  if (key.includes("cloud")) return "cloudy";
  if (temperature <= 8) return "cold";
  if (windSpeed >= 8) return "windy";
  if (key.includes("clear")) return "clear";
  return "sunny";
}

function periodModifiers(period: TimePeriod, isNight: boolean) {
  if (isNight || period === "night") {
    return {
      ambient: 0.22,
      sun: 0.08,
      fill: 0.18,
      ceiling: 0.85,
      bg: "#0b1220",
      fog: "#0b1220",
      sunColor: "#93c5fd",
    };
  }
  if (period === "morning") {
    return {
      ambient: 0.48,
      sun: 1.05,
      fill: 0.34,
      ceiling: 0.15,
      bg: "#1a2438",
      fog: "#1e293b",
      sunColor: "#fde68a",
    };
  }
  if (period === "evening") {
    return {
      ambient: 0.38,
      sun: 0.72,
      fill: 0.28,
      ceiling: 0.45,
      bg: "#1c1524",
      fog: "#1f172a",
      sunColor: "#fb923c",
    };
  }
  return {
    ambient: 0.44,
    sun: 1.18,
    fill: 0.32,
    ceiling: 0.12,
    bg: "#141c2b",
    fog: "#141c2b",
    sunColor: "#fff7ed",
  };
}

function themeModifiers(theme: WeatherTheme) {
  switch (theme) {
    case "rainy":
      return { sunMul: 0.55, ambientMul: 0.85, rain: true, sky: ["#334155", "#1e293b"] };
    case "thunderstorm":
      return {
        sunMul: 0.35,
        ambientMul: 0.7,
        rain: true,
        thunder: true,
        lightning: true,
        sky: ["#1e293b", "#0f172a"],
      };
    case "cloudy":
      return { sunMul: 0.72, ambientMul: 0.92, sky: ["#64748b", "#334155"] };
    case "foggy":
      return { sunMul: 0.5, ambientMul: 0.88, fog: true, sky: ["#94a3b8", "#64748b"] };
    case "cold":
      return { sunMul: 0.65, ambientMul: 0.9, sunColor: "#dbeafe", sky: ["#cbd5e1", "#94a3b8"] };
    case "windy":
      return { sunMul: 0.9, wind: true, sky: ["#7dd3fc", "#38bdf8"] };
    case "clear":
      return { sunMul: 1.05, sky: ["#7dd3fc", "#38bdf8"] };
    default:
      return { sunMul: 1.1, sky: ["#fde68a", "#60a5fa"] };
  }
}

export function deriveEnvironment(
  weather: WeatherSnapshot,
  hour: number,
  themeOverride?: WeatherTheme | null,
  periodOverride?: TimePeriod | null,
): DerivedEnvironment {
  const timePeriod = periodOverride ?? getTimePeriod(hour);
  const isNight = timePeriod === "night";
  const theme =
    themeOverride ?? mapConditionToTheme(weather.condition, weather.temperature, weather.windSpeed);

  const period = periodModifiers(timePeriod, isNight);
  const themeMod = themeModifiers(theme);

  const sunIntensity = period.sun * (themeMod.sunMul ?? 1);
  const ambientIntensity = period.ambient * (themeMod.ambientMul ?? 1);

  return {
    theme,
    timePeriod,
    isNight,
    localHour: hour,
    label: `${timePeriod} · ${theme}`,
    lighting: {
      ambientIntensity,
      ambientColor: theme === "cold" ? "#e0f2fe" : "#eef2ff",
      sunIntensity,
      sunColor: themeMod.sunColor ?? period.sunColor,
      fillIntensity: period.fill,
      fillColor: "#c7d2fe",
      boardIntensity: isNight ? 0.42 : 0.28,
      ceilingIntensity: period.ceiling,
      fogColor: period.fog,
      fogNear: themeMod.fog ? 14 : 18,
      fogFar: themeMod.fog ? 28 : 36,
      background: period.bg,
      environmentIntensity: isNight ? 0.35 : 0.52,
      windowSkyTop: themeMod.sky?.[0] ?? "#7dd3fc",
      windowSkyBottom: themeMod.sky?.[1] ?? "#1e3a5f",
      effects: {
        rain: Boolean(themeMod.rain),
        thunder: Boolean(themeMod.thunder),
        lightning: Boolean(themeMod.lightning),
        wind: Boolean(themeMod.wind) || weather.windSpeed >= 6,
        fog: Boolean(themeMod.fog),
      },
    },
  };
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpLighting(
  from: EnvironmentLighting,
  to: EnvironmentLighting,
  t: number,
): EnvironmentLighting {
  const mix = (a: number, b: number) => lerp(a, b, t);
  return {
    ...to,
    ambientIntensity: mix(from.ambientIntensity, to.ambientIntensity),
    sunIntensity: mix(from.sunIntensity, to.sunIntensity),
    fillIntensity: mix(from.fillIntensity, to.fillIntensity),
    boardIntensity: mix(from.boardIntensity, to.boardIntensity),
    ceilingIntensity: mix(from.ceilingIntensity, to.ceilingIntensity),
    fogNear: mix(from.fogNear, to.fogNear),
    fogFar: mix(from.fogFar, to.fogFar),
    environmentIntensity: mix(from.environmentIntensity, to.environmentIntensity),
    effects: to.effects,
  };
}
