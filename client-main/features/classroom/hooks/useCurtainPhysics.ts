"use client";

import { useRef } from "react";
import { PhysicsCurtainSystem } from "../simulation/PhysicsCurtainSystem";

export function useCurtainPhysics() {
  const systemRef = useRef(new PhysicsCurtainSystem());

  const step = (
    delta: number,
    input: {
      openLevel: number;
      windSpeed: number;
      fanSpeed: number;
      curtainStrength: number;
      elapsed: number;
    },
  ) => systemRef.current.step(delta, input);

  return { step };
}
