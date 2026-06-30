"use client";

import { MessageCircle, Mic, Type } from "lucide-react";
import { useState } from "react";

export function AskTeacherButton({
  onAskText,
  onAskVoice,
}: {
  onAskText: () => void;
  onAskVoice: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-2">
      {open && (
        <div className="classroom-glass flex flex-col gap-1 rounded-2xl border border-white/15 p-2 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAskVoice();
            }}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white hover:bg-white/10"
          >
            <Mic className="h-4 w-4 text-sky-300" />
            Voice question
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAskText();
            }}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white hover:bg-white/10"
          >
            <Type className="h-4 w-4 text-emerald-300" />
            Text question
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500"
        aria-label="Ask AI Teacher"
      >
        <MessageCircle className="h-5 w-5" />
        Ask AI Teacher
      </button>
    </div>
  );
}
