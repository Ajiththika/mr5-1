"use client";

import { getAvatarPreset } from "@/lib/avatar-presets";

interface AvatarPresetBadgeProps {
  presetId?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const sizeMap = {
  sm: "w-8 h-8 text-base",
  md: "w-12 h-12 text-2xl",
  lg: "w-16 h-16 text-3xl",
};

export function AvatarPresetBadge({
  presetId,
  size = "md",
  showName = false,
}: AvatarPresetBadgeProps) {
  const preset = presetId ? getAvatarPreset(presetId) : undefined;
  const fallback = { emoji: "🧑‍🎓", name: "Student", color: "#6366f1" };
  const display = preset || fallback;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeMap[size]} rounded-full flex items-center justify-center shrink-0`}
        style={{ backgroundColor: `${display.color}33` }}
        aria-hidden
      >
        {display.emoji}
      </div>
      {showName && (
        <span className="text-sm font-medium">{display.name}</span>
      )}
    </div>
  );
}
