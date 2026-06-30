"use client";

import { Smartphone } from "lucide-react";

export function MotionViewButton({
  active,
  onEnable,
  onDisable,
}: {
  active: boolean;
  onEnable: () => void;
  onDisable: () => void;
}) {
  return (
    <button
      type="button"
      onClick={active ? onDisable : onEnable}
      className={`classroom-glass flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
        active
          ? "border-sky-400/50 bg-sky-500/20 text-sky-100"
          : "border-white/15 text-white/80 hover:bg-white/10"
      }`}
      aria-pressed={active}
    >
      <Smartphone className="h-4 w-4" />
      {active ? "Motion on" : "Motion view"}
    </button>
  );
}
