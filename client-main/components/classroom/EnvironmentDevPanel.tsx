"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClassroomEnvironment } from "@/contexts/ClassroomEnvironmentContext";
import type { TimePeriod, WeatherTheme } from "@/lib/classroom-environment";

const WEATHER_PRESETS: WeatherTheme[] = [
  "sunny",
  "clear",
  "cloudy",
  "rainy",
  "thunderstorm",
  "foggy",
  "cold",
  "windy",
];

const TIME_PRESETS: TimePeriod[] = ["morning", "afternoon", "evening", "night"];

export function EnvironmentDevPanel() {
  const { override, setOverride, clearOverride } = useClassroomEnvironment();
  const [open, setOpen] = useState(false);

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="pointer-events-auto">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 border-white/15 bg-slate-900/80 text-[10px] text-white"
        onClick={() => setOpen((value) => !value)}
      >
        <Settings2 className="mr-1.5 h-3.5 w-3.5" />
        Env Debug
      </Button>

      {open && (
        <div className="mt-2 w-56 rounded-xl border border-white/12 bg-slate-950/95 p-3 text-[10px] text-slate-200 shadow-2xl backdrop-blur-md">
          <p className="mb-2 font-semibold uppercase tracking-widest text-indigo-200">
            Override
          </p>
          <p className="mb-1 text-slate-400">Time of day</p>
          <div className="mb-3 flex flex-wrap gap-1">
            {TIME_PRESETS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setOverride({ timePeriod: period })}
                className={`rounded-md px-2 py-1 capitalize ${
                  override.timePeriod === period
                    ? "bg-indigo-500 text-white"
                    : "bg-white/10 hover:bg-white/15"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <p className="mb-1 text-slate-400">Weather</p>
          <div className="mb-3 flex flex-wrap gap-1">
            {WEATHER_PRESETS.map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => setOverride({ theme })}
                className={`rounded-md px-2 py-1 capitalize ${
                  override.theme === theme
                    ? "bg-sky-500 text-white"
                    : "bg-white/10 hover:bg-white/15"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={clearOverride}
            className="w-full rounded-md border border-white/10 py-1.5 text-slate-300 hover:bg-white/10"
          >
            Reset to live data
          </button>
        </div>
      )}
    </div>
  );
}
