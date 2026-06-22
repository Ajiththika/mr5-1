"use client";

import { useCallback, useState } from "react";
import { Gamepad2, Puzzle, Sparkles, X } from "lucide-react";
import { useClassroomStore } from "../store/classroom.store";
import {
  CLASSROOM_QUIZ,
  MATCH_PAIRS,
  checkMatch,
  checkQuizAnswer,
} from "../playtime/MiniGameEngine";
import { ProgressTracker } from "./ProgressTracker";
import { getBrandSoundManager } from "@/lib/audio";

type GameTab = "quiz" | "match" | "observe";

export function PlaytimePanel() {
  const { playtimeOpen, togglePlaytime, addReward, playtime } = useClassroomStore();
  const [tab, setTab] = useState<GameTab>("quiz");
  const [quizIndex, setQuizIndex] = useState(0);
  const [matchSelected, setMatchSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleQuiz = useCallback(
    (optionIndex: number) => {
      const q = CLASSROOM_QUIZ[quizIndex];
      if (checkQuizAnswer(q, optionIndex)) {
        addReward(15, 1, quizIndex === CLASSROOM_QUIZ.length - 1 ? "Quiz Star" : undefined);
        getBrandSoundManager().playReward();
        setMessage("Correct! +15 XP");
        setQuizIndex((i) => (i + 1) % CLASSROOM_QUIZ.length);
      } else {
        setMessage("Try again — look around the room!");
      }
    },
    [addReward, quizIndex],
  );

  const handleMatch = useCallback(
    (id: string, isTerm: boolean) => {
      if (!matchSelected) {
        setMatchSelected(id);
        return;
      }
      const termId = isTerm ? id : matchSelected;
      const defId = isTerm ? matchSelected : id;
      if (checkMatch(termId, defId)) {
        addReward(10, 1);
        getBrandSoundManager().playReward();
        setMessage("Matched! +10 XP");
      } else {
        setMessage("Not a match — try again");
      }
      setMatchSelected(null);
    },
    [addReward, matchSelected],
  );

  if (!playtimeOpen) return null;

  const question = CLASSROOM_QUIZ[quizIndex];

  return (
    <div className="pointer-events-auto w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-emerald-300">
            Playtime
          </p>
          <p className="text-xs font-medium text-slate-200">Optional mini-games</p>
        </div>
        <button
          type="button"
          onClick={togglePlaytime}
          className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Close playtime"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ProgressTracker progress={playtime} compact />

      <div className="mt-2 flex gap-1">
        {(
          [
            ["quiz", "Quiz", Puzzle],
            ["match", "Match", Sparkles],
            ["observe", "Look", Gamepad2],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-semibold uppercase ${
              tab === id
                ? "bg-emerald-500/20 text-emerald-100"
                : "bg-white/5 text-slate-400"
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-[88px]">
        {tab === "quiz" && (
          <div className="space-y-2">
            <p className="text-[11px] leading-snug text-slate-300">{question.prompt}</p>
            <div className="grid gap-1">
              {question.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleQuiz(i)}
                  className="rounded-lg border border-white/8 bg-white/5 px-2 py-1.5 text-left text-[10px] text-slate-200 hover:bg-white/10"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === "match" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              {MATCH_PAIRS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleMatch(p.id, true)}
                  className={`w-full rounded-md px-2 py-1 text-[9px] ${
                    matchSelected === p.id
                      ? "bg-indigo-500/30 text-indigo-100"
                      : "bg-white/5 text-slate-300"
                  }`}
                >
                  {p.term}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              {MATCH_PAIRS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleMatch(p.id, false)}
                  className="w-full rounded-md bg-white/5 px-2 py-1 text-[9px] text-slate-400"
                >
                  {p.definition}
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === "observe" && (
          <p className="text-[11px] leading-relaxed text-slate-400">
            Find the ceiling fan, window curtains, and whiteboard logo. Tap each in
            the room, then return here for a bonus when you spot all three.
          </p>
        )}
      </div>

      {message && (
        <p className="mt-2 text-center text-[10px] text-emerald-300">{message}</p>
      )}
    </div>
  );
}
