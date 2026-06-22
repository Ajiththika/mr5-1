"use client";

import { Lightbulb } from "lucide-react";

interface LightControlCardProps {
  lightsOn: boolean;
  onToggle: () => void;
}

export function LightControlCard({ lightsOn, onToggle }: LightControlCardProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <Lightbulb
          className={`h-3.5 w-3.5 ${lightsOn ? "text-amber-200" : "text-slate-500"}`}
        />
        <span className="text-[11px] font-semibold text-slate-100">Lights</span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={lightsOn}
        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
          lightsOn
            ? "bg-amber-500/20 text-amber-100"
            : "bg-white/10 text-slate-400 hover:bg-white/15"
        }`}
      >
        {lightsOn ? "On" : "Off"}
      </button>
    </div>
  );
}
