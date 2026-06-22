"use client";

import { Fan, Gauge } from "lucide-react";
import type { FanSpeedLevel } from "../environment/environment.types";

const LEVELS: FanSpeedLevel[] = ["OFF", "LOW", "MEDIUM", "HIGH", "AUTO"];

interface FanControlCardProps {
  enabled: boolean;
  mode: FanSpeedLevel;
  currentSpeed: number;
  onToggle: () => void;
  onModeChange: (mode: FanSpeedLevel) => void;
}

export function FanControlCard({
  enabled,
  mode,
  currentSpeed,
  onToggle,
  onModeChange,
}: FanControlCardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Fan
            className={`h-3.5 w-3.5 ${enabled ? "animate-spin text-sky-300" : "text-slate-400"}`}
            style={{ animationDuration: `${1.4 - currentSpeed * 0.6}s` }}
          />
          <span className="text-[11px] font-semibold text-slate-100">Fan</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
            enabled
              ? "bg-sky-500/25 text-sky-100"
              : "bg-white/10 text-slate-400 hover:bg-white/15"
          }`}
        >
          {enabled ? "On" : "Off"}
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            disabled={!enabled && level !== "OFF"}
            onClick={() => onModeChange(level)}
            className={`rounded-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide transition-colors disabled:opacity-35 ${
              mode === level
                ? "bg-indigo-500/30 text-indigo-100 ring-1 ring-indigo-400/30"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <Gauge className="h-3 w-3" />
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-300"
            style={{ width: `${Math.round(currentSpeed * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
