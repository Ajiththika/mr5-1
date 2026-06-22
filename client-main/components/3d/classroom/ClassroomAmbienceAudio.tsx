"use client";

import { useClassroomAmbience } from "@/features/classroom/hooks/useClassroomAmbience";

/** Invisible R3F child — loops classroom background ambience while the scene is mounted. */
export function ClassroomAmbienceAudio() {
  useClassroomAmbience();
  return null;
}
