"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import LocationService from "@/services/location.service";
import ContextService from "@/services/context.service";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import {
  deriveEnvironment,
  getDefaultWeather,
  getLocalHour,
  lerpLighting,
  type DerivedEnvironment,
  type TimePeriod,
  type WeatherSnapshot,
  type WeatherTheme,
} from "@/lib/classroom-environment";

export type EnvironmentOverride = {
  theme?: WeatherTheme | null;
  timePeriod?: TimePeriod | null;
};

interface ClassroomEnvironmentState {
  loading: boolean;
  error: string | null;
  weather: WeatherSnapshot;
  locationLabel: string;
  environment: DerivedEnvironment;
  override: EnvironmentOverride;
  setOverride: (patch: EnvironmentOverride) => void;
  clearOverride: () => void;
  refresh: () => Promise<void>;
}

const ClassroomEnvironmentContext = createContext<ClassroomEnvironmentState | null>(
  null,
);

async function fetchPublicWeather(lat: number, lon: number): Promise<WeatherSnapshot> {
  const response = await fetch(`/api/context/weather?lat=${lat}&lon=${lon}`);
  if (!response.ok) throw new Error("Weather unavailable");
  const payload = await response.json();
  return payload.data;
}

export function ClassroomEnvironmentProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useEnhancedUser();
  const dashboard = useDashboardContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherSnapshot>(getDefaultWeather());
  const [locationLabel, setLocationLabel] = useState("Detecting location…");
  const [override, setOverrideState] = useState<EnvironmentOverride>({});
  const [now, setNow] = useState(() => new Date());
  const [blendedLighting, setBlendedLighting] = useState<DerivedEnvironment | null>(
    null,
  );
  const targetRef = useRef<DerivedEnvironment | null>(null);

  const setOverride = useCallback((patch: EnvironmentOverride) => {
    setOverrideState((current) => ({ ...current, ...patch }));
  }, []);

  const clearOverride = useCallback(() => setOverrideState({}), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated && dashboard.context?.weather) {
        const ctx = dashboard.context;
        setWeather({
          condition: ctx.weather.condition,
          temperature: ctx.weather.temperature,
          humidity: ctx.weather.humidity,
          windSpeed: ctx.weather.windSpeed,
          city: ctx.hometown?.city,
        });
        setLocationLabel(
          [ctx.hometown?.city, ctx.hometown?.country].filter(Boolean).join(", ") ||
            "Your location",
        );
        return;
      }

      const loc = await LocationService.getLocation();
      if (loc?.city) {
        setLocationLabel(
          [loc.city, loc.state || loc.country].filter(Boolean).join(", "),
        );
      } else {
        setLocationLabel("Default location");
      }

      if (loc?.latitude && loc?.longitude) {
        try {
          if (isAuthenticated) {
            const synced = await ContextService.syncContext(loc);
            if (synced.success) {
              setWeather({
                condition: synced.data.weather.condition,
                temperature: synced.data.weather.temperature,
                humidity: synced.data.weather.humidity,
                windSpeed: synced.data.weather.windSpeed,
                city: synced.data.hometown?.city,
              });
              return;
            }
          }
          const live = await fetchPublicWeather(loc.latitude, loc.longitude);
          setWeather(live);
          return;
        } catch {
          setWeather(getDefaultWeather());
          setError("Using default weather (live data unavailable)");
        }
      } else {
        setWeather(getDefaultWeather());
        setError("Location unavailable — using default weather");
      }
    } catch (err) {
      setWeather(getDefaultWeather());
      setError(err instanceof Error ? err.message : "Environment fallback active");
    } finally {
      setLoading(false);
    }
  }, [dashboard.context, isAuthenticated]);

  useEffect(() => {
    refresh();
    const weatherTimer = window.setInterval(refresh, 15 * 60 * 1000);
    const clockTimer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => {
      window.clearInterval(weatherTimer);
      window.clearInterval(clockTimer);
    };
  }, [refresh]);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hour = getLocalHour(now, timezone);

  const environment = useMemo(
    () => deriveEnvironment(weather, hour, override.theme, override.timePeriod),
    [weather, hour, override.theme, override.timePeriod],
  );

  useEffect(() => {
    targetRef.current = environment;
    if (!blendedLighting) setBlendedLighting(environment);
  }, [environment, blendedLighting]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const target = targetRef.current;
      setBlendedLighting((current) => {
        if (!target || !current) return target;
        return {
          ...target,
          lighting: lerpLighting(current.lighting, target.lighting, 0.03),
        };
      });
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const value: ClassroomEnvironmentState = {
    loading,
    error,
    weather,
    locationLabel,
    environment: blendedLighting ?? environment,
    override,
    setOverride,
    clearOverride,
    refresh,
  };

  return (
    <ClassroomEnvironmentContext.Provider value={value}>
      {children}
    </ClassroomEnvironmentContext.Provider>
  );
}

export function useClassroomEnvironment() {
  const ctx = useContext(ClassroomEnvironmentContext);
  if (!ctx) {
    throw new Error("useClassroomEnvironment must be used within ClassroomEnvironmentProvider");
  }
  return ctx;
}
