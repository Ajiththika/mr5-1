"use client";

import type { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function GlassPanel({
  children,
  className = "",
  interactive = false,
}: GlassPanelProps) {
  return (
    <div
      className={`classroom-glass ${interactive ? "pointer-events-auto" : "pointer-events-none"} ${className}`}
    >
      {children}
    </div>
  );
}

export function GlassIconButton({
  children,
  label,
  onClick,
  active = false,
  className = "",
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`classroom-glass pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all hover:bg-white/10 ${
        active ? "ring-1 ring-white/30 bg-white/12" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
