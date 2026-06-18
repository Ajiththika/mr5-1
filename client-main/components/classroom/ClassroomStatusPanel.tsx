"use client";

import { Cloud, Droplets, MapPin, Sun, Moon, Wind, Loader2 } from "lucide-react";
import { useClassroomEnvironment } from "@/contexts/ClassroomEnvironmentContext";

export function ClassroomStatusPanel() {
  const { loading, error, weather, locationLabel, environment } = useClassroomEnvironment();

  const TimeIcon =
    environment.timePeriod === "night" || environment.isNight ? Moon : Sun;

  return (
    <aside
      className="pointer-events-auto w-[min(100%,240px)] rounded-xl border border-white/12 bg-slate-950/80 p-3 text-xs text-slate-200 shadow-xl backdrop-blur-md"
      aria-label="Classroom environment status"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-indigo-200">
        Live Environment
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Syncing weather…
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 capitalize">
              <Cloud className="h-3.5 w-3.5 text-sky-300" />
              {environment.theme}
            </span>
            <span className="font-semibold text-white">
              {Math.round(weather.temperature)}°C
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-slate-400">
            <span className="inline-flex items-center gap-1.5 capitalize">
              <TimeIcon className="h-3.5 w-3.5" />
              {environment.timePeriod}
            </span>
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {weather.humidity}%
            </span>
            <span className="inline-flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {weather.windSpeed.toFixed(1)} m/s
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-[10px] text-amber-300/90" role="status">
          {error}
        </p>
      )}
    </aside>
  );
}
