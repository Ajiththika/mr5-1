"use client";

import { useEffect, useRef } from "react";
import { FanPhysicsEngine } from "../simulation/FanPhysicsEngine";
import type { FanSpeedLevel } from "../environment/environment.types";

export function useFanPhysics(
  enabled: boolean,
  mode: FanSpeedLevel,
  autoIntensity: number,
) {
  const engineRef = useRef(new FanPhysicsEngine());
  const snapshotRef = useRef(engineRef.current.step(0));

  useEffect(() => {
    if (!enabled) {
      engineRef.current.setTargetFromLevel("OFF");
      return;
    }
    engineRef.current.setTargetFromLevel(mode, autoIntensity);
  }, [enabled, mode, autoIntensity]);

  const step = (delta: number) => {
    snapshotRef.current = engineRef.current.step(delta);
    return snapshotRef.current;
  };

  return { step, getSnapshot: () => snapshotRef.current };
}
