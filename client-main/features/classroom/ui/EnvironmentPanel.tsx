"use client";

import { Cloud, Droplets, Leaf, MapPin, Moon, Sun, Thermometer } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useClassroomEnvironment } from "@/contexts/ClassroomEnvironmentContext";
import { useWeatherSync } from "../hooks/useWeatherSync";

export function EnvironmentPanel() {
  const { computed, weather, environment, loading, error } = useWeatherSync();
  const { locationLabel } = useClassroomEnvironment();
  const { t } = useTranslation();

  const TimeIcon =
    environment.timePeriod === "night" || environment.isNight ? Moon : Sun;

  return (
    <aside
      className="pointer-events-auto w-[min(100%,220px)] rounded-xl border border-white/10 bg-slate-950/85 p-2.5 text-xs text-slate-200 shadow-xl backdrop-blur-md"
      aria-label={t("env.roomAtmosphere")}
    >
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-indigo-200/90">
        {t("env.roomAtmosphere")}
      </p>

      {loading ? (
        <p className="text-[10px] text-slate-500">Syncing environment…</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 capitalize text-slate-300">
              <Cloud className="h-3 w-3 text-sky-300" />
              {environment.theme}
            </span>
            <span className="inline-flex items-center gap-0.5 font-semibold text-white">
              <Thermometer className="h-3 w-3 text-orange-300" />
              {Math.round(weather.temperature)}°
            </span>
          </div>

          <div className="rounded-lg border border-white/8 bg-white/[0.03] px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-200">
                <Leaf className="h-3 w-3" />
                {computed.comfortLabel}
              </span>
              <span className="font-mono text-[10px] font-bold text-white">
                {computed.roomComfort}%
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                style={{ width: `${computed.roomComfort}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{locationLabel}</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1 capitalize">
              <TimeIcon className="h-3 w-3" />
              {environment.timePeriod}
            </span>
            <span className="inline-flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {weather.humidity}%
            </span>
            <span className="capitalize text-slate-400">{computed.roomMood}</span>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-[9px] text-amber-300/80" role="status">
          Using fallback weather
        </p>
      )}
    </aside>
  );
}
