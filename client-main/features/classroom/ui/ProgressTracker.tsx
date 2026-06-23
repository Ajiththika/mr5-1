"use client";

import { Flame, Star, Trophy } from "lucide-react";
import { levelProgress } from "@/lib/learning/progression";
import type { PlaytimeProgress } from "../store/classroom.store";

interface ProgressTrackerProps {
  progress: PlaytimeProgress;
  compact?: boolean;
}

export function ProgressTracker({ progress, compact = false }: ProgressTrackerProps) {
  const bar = levelProgress(progress.xp);

  return (
    <div
      className={`flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/5 ${
        compact ? "px-2.5 py-1.5" : "px-3 py-2"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-200">
          Lv {progress.level}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-200">
          <Star className="h-3 w-3" />
          {progress.stars}
        </span>
        <span className="text-[10px] text-slate-400">{progress.xp} XP</span>
        {progress.streakDays > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] text-orange-200">
            <Flame className="h-3 w-3" />
            {progress.streakDays}d
          </span>
        )}
        {progress.badges.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] text-violet-200">
            <Trophy className="h-3 w-3" />
            {progress.badges.length}
          </span>
        )}
      </div>
      {!compact && (
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all"
            style={{ width: `${bar.percent}%` }}
          />
        </div>
      )}
    </div>
  );
}
