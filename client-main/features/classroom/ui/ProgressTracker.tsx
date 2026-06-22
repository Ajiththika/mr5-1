"use client";

import { Star, Trophy } from "lucide-react";
import type { PlaytimeProgress } from "../store/classroom.store";

interface ProgressTrackerProps {
  progress: PlaytimeProgress;
  compact?: boolean;
}

export function ProgressTracker({ progress, compact = false }: ProgressTrackerProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 ${
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      }`}
    >
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-200">
        <Star className="h-3 w-3" />
        {progress.stars}
      </span>
      <span className="text-[10px] text-slate-400">{progress.xp} XP</span>
      {progress.badges.length > 0 && (
        <span className="inline-flex items-center gap-1 text-[10px] text-violet-200">
          <Trophy className="h-3 w-3" />
          {progress.badges.length}
        </span>
      )}
    </div>
  );
}
