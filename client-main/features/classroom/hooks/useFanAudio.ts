"use client";

import { useEffect, useRef } from "react";
import { FanAudioManager } from "@/lib/audio/FanAudioManager";

export function useFanAudioManager() {
  const managerRef = useRef<FanAudioManager | null>(null);

  useEffect(() => {
    managerRef.current = new FanAudioManager();
    return () => {
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, []);

  const update = (speed: number, delta: number) => {
    managerRef.current?.update(speed, delta);
  };

  return { update };
}
