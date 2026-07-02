"use client";

import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { getGamingSpookySoundManager } from "@/lib/audio/GamingSpookySoundManager";
import { isGamingTime } from "@/lib/classroom/playtime-phase";
import { useClassroomStore } from "@/features/classroom/store/classroom.store";

export function useGamingSpookyAmbience() {
  const { playtimePhase } = useClassroomStore();
  const gaming = isGamingTime(playtimePhase);

  useEffect(() => {
    getGamingSpookySoundManager().setActive(gaming);
  }, [gaming]);

  useFrame((_, delta) => {
    getGamingSpookySoundManager().update(delta);
  });
}
