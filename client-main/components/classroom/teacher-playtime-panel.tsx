"use client";

import { useCallback, useEffect, useState } from "react";
import { Coffee, Gamepad2, Plus, Timer } from "lucide-react";
import { useClassroomStore } from "@/features/classroom/store/classroom.store";
import {
  isGamingTime,
  phaseLabel,
  type PlaytimePhase,
} from "@/lib/classroom/playtime-phase";

const BREAK_FOCUS_SEC = process.env.NODE_ENV === "development" ? 15 : 25 * 60;
const BREAK_REST_SEC = process.env.NODE_ENV === "development" ? 10 : 5 * 60;
const GAME_FOCUS_SEC = process.env.NODE_ENV === "development" ? 20 : 60 * 60;
const GAME_REST_SEC = process.env.NODE_ENV === "development" ? 30 : 5 * 60;
const BONUS_SEC = 5 * 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function phaseAccent(phase: PlaytimePhase) {
  switch (phase) {
    case "break_focus":
    case "game_focus":
      return "text-sky-300";
    case "break_rest":
      return "text-amber-300";
    case "game_rest":
      return "text-emerald-300";
    default:
      return "text-slate-400";
  }
}

export function TeacherPlaytimePanel() {
  const { setPlaytimePhase } = useClassroomStore();
  const [phase, setPhase] = useState<PlaytimePhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const isRestPhase = phase === "break_rest" || phase === "game_rest";
  const isRunning = phase !== "idle";
  const gamingActive = isGamingTime(phase);

  useEffect(() => {
    setPlaytimePhase(phase);
  }, [phase, setPlaytimePhase]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft > 0) return;

    if (phase === "break_focus") {
      setPhase("break_rest");
      setSecondsLeft(BREAK_REST_SEC);
      return;
    }
    if (phase === "break_rest") {
      setPhase("idle");
      return;
    }
    if (phase === "game_focus") {
      setPhase("game_rest");
      setSecondsLeft(GAME_REST_SEC);
      return;
    }
    if (phase === "game_rest") {
      setPhase("idle");
    }
  }, [phase, secondsLeft]);

  const startBreakCycle = useCallback(() => {
    setPhase("break_focus");
    setSecondsLeft(BREAK_FOCUS_SEC);
  }, []);

  const startGameCycle = useCallback(() => {
    setPhase("game_focus");
    setSecondsLeft(GAME_FOCUS_SEC);
  }, []);

  const addFiveMinutes = useCallback(() => {
    if (!isRestPhase) return;
    setSecondsLeft((current) => current + BONUS_SEC);
  }, [isRestPhase]);

  const stopTimer = useCallback(() => {
    setPhase("idle");
    setSecondsLeft(0);
  }, []);

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-md sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-300">
            Teacher Playtime
          </p>
          <p className={`text-sm font-bold ${phaseAccent(phase)}`}>
            {phaseLabel(phase)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
          <Timer className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-mono text-sm font-bold text-white">
            {isRunning ? formatTime(secondsLeft) : "--:--"}
          </span>
        </div>
      </div>

      <p className="mb-3 text-[10px] leading-relaxed text-slate-400">
        Break: 25 min class, then 5 min break · Gaming: 1 hr lesson, then 5 min
        game · Piano, bats, and Creep specter appear during gaming time
      </p>

      {gamingActive && (
        <p className="mb-3 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-2 py-1.5 text-[10px] text-emerald-100">
          Gaming time — piano, flying bats, and Creep in the room. Click Creep for a
          screech. Sounds: Pixabay DRAGON-STUDIO + community zombie ambient.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={startBreakCycle}
          disabled={isRunning}
          className="inline-flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-400/25 bg-amber-500/15 px-2 py-2.5 text-[10px] font-semibold text-amber-100 transition-colors hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          <Coffee className="h-4 w-4" />
          Break Time
        </button>
        <button
          type="button"
          onClick={startGameCycle}
          disabled={isRunning}
          className="inline-flex flex-col items-center justify-center gap-1 rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-2 py-2.5 text-[10px] font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          <Gamepad2 className="h-4 w-4" />
          Gaming Time
        </button>
        <button
          type="button"
          onClick={addFiveMinutes}
          disabled={!isRestPhase}
          className="inline-flex flex-col items-center justify-center gap-1 rounded-xl border border-indigo-400/25 bg-indigo-500/15 px-2 py-2.5 text-[10px] font-semibold text-indigo-100 transition-colors hover:bg-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-40 sm:text-xs"
        >
          <Plus className="h-4 w-4" />
          +5 min
        </button>
      </div>

      {isRunning && (
        <button
          type="button"
          onClick={stopTimer}
          className="mt-2 w-full rounded-lg border border-white/10 py-1.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
        >
          Stop timer
        </button>
      )}
    </div>
  );
}
