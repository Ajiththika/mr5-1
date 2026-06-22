"use client";

import { PanelTop } from "lucide-react";

interface CurtainControlCardProps {
  openLevel: number;
  onChange: (value: number) => void;
}

export function CurtainControlCard({ openLevel, onChange }: CurtainControlCardProps) {
  const percent = Math.round(openLevel * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PanelTop className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-[11px] font-semibold text-slate-100">Curtains</span>
        </div>
        <span className="text-[10px] font-medium text-slate-400">{percent}% open</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={percent}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-indigo-400"
        aria-label="Curtain openness"
      />
      <div className="flex justify-between gap-1">
        <button
          type="button"
          onClick={() => onChange(0)}
          className="flex-1 rounded-md bg-white/5 py-1 text-[9px] font-semibold text-slate-400 hover:bg-white/10"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => onChange(1)}
          className="flex-1 rounded-md bg-white/5 py-1 text-[9px] font-semibold text-slate-400 hover:bg-white/10"
        >
          Open
        </button>
      </div>
    </div>
  );
}
