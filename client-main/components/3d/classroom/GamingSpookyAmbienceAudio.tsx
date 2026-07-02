"use client";

import { useGamingSpookyAmbience } from "@/features/classroom/hooks/useGamingSpookyAmbience";

/** Zombie ambient + screech SFX during gaming rest. */
export function GamingSpookyAmbienceAudio() {
  useGamingSpookyAmbience();
  return null;
}
