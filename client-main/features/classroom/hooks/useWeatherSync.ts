"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useClassroomEnvironment } from "@/contexts/ClassroomEnvironmentContext";
import {
  computeEnvironment,
  lerpComputedEnvironment,
} from "../environment/EnvironmentEngine";
import type { ComputedEnvironment } from "../environment/environment.types";

const LERP_T = 0.04;

export function useWeatherSync() {
  const { weather, environment, loading, error } = useClassroomEnvironment();
  const target = useMemo(
    () => computeEnvironment({ weather, derived: environment }),
    [weather, environment],
  );

  const [computed, setComputed] = useState<ComputedEnvironment>(target);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      setComputed((prev) => lerpComputedEnvironment(prev, target, LERP_T));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target]);

  return { computed, weather, environment, loading, error };
}
