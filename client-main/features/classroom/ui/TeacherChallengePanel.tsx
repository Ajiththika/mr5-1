"use client";

import { useCallback, useEffect, useState } from "react";
import { Brain, Timer, X } from "lucide-react";
import { useClassroomStore } from "../store/classroom.store";
import { ProgressTracker } from "./ProgressTracker";
import { getBrandSoundManager, getVoiceFeedbackManager } from "@/lib/audio";

const CHALLENGES = [
  {
    id: "focus-5",
    title: "5-minute focus",
    seconds: 5 * 60,
    xp: 20,
    prompt: "Keep students engaged while the timer runs.",
  },
  {
    id: "board-check",
    title: "Board check",
    seconds: 2 * 60,
    xp: 12,
    prompt: "Review the whiteboard and lesson anchor.",
  },
  {
    id: "room-scan",
    title: "Room scan",
    seconds: 3 * 60,
    xp: 15,
    prompt: "Scan desks, fan, and window lighting.",
  },
];

export function TeacherChallengePanel() {
  const { challengeOpen, toggleChallenge, addReward, playtime } = useClassroomStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const active = CHALLENGES.find((c) => c.id === activeId);

  useEffect(() => {
    if (!activeId || secondsLeft <= 0) return;
    const t = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [activeId, secondsLeft]);

  useEffect(() => {
    if (!active || secondsLeft > 0) return;
    addReward(active.xp, 2, "Teacher Challenge");
    getBrandSoundManager().playReward();
    getVoiceFeedbackManager().speak("challenge_completed");
    setActiveId(null);
  }, [active, secondsLeft, addReward]);

  const startChallenge = useCallback((id: string, seconds: number) => {
    getBrandSoundManager().play("CARD_OPEN");
    setActiveId(id);
    setSecondsLeft(seconds);
  }, []);

  if (!challengeOpen) return null;

  const format = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-violet-300">
            Teacher Challenges
          </p>
          <p className="text-xs text-slate-300">Quick classroom tasks</p>
        </div>
        <button
          type="button"
          onClick={toggleChallenge}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10"
          aria-label="Close challenges"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ProgressTracker progress={playtime} compact />

      {active && secondsLeft > 0 ? (
        <div className="mt-3 rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-center">
          <p className="text-[11px] text-violet-100">{active.prompt}</p>
          <p className="mt-2 font-mono text-2xl font-bold text-white">
            {format(secondsLeft)}
          </p>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          {CHALLENGES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => startChallenge(c.id, c.seconds)}
              className="flex w-full items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10"
            >
              <Brain className="h-4 w-4 shrink-0 text-violet-300" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-100">{c.title}</p>
                <p className="truncate text-[9px] text-slate-500">{c.prompt}</p>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-400">
                <Timer className="h-3 w-3" />
                {Math.floor(c.seconds / 60)}m
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
