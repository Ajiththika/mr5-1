"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ClassroomAmbienceManager } from "@/lib/audio/ClassroomAmbienceManager";
import { useClassroomStore } from "@/features/classroom/store/classroom.store";

export function useClassroomAmbience() {
  const managerRef = useRef<ClassroomAmbienceManager | null>(null);
  const { controls } = useClassroomStore();

  useEffect(() => {
    managerRef.current = new ClassroomAmbienceManager();
    return () => {
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, []);

  useFrame((_, delta) => {
    managerRef.current?.setCurtainOpenness(controls.curtainOpen);
    managerRef.current?.update(delta);
  });
}

/** For non-R3F parents (e.g. classroom page shell). */
export function useClassroomAmbienceLoop() {
  const managerRef = useRef<ClassroomAmbienceManager | null>(null);

  useEffect(() => {
    managerRef.current = new ClassroomAmbienceManager();
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      managerRef.current?.update(delta);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, []);
}
