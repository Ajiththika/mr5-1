"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface OrientationSample {
  alpha: number;
  beta: number;
  gamma: number;
}

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

export function useDeviceOrientationLook() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const sampleRef = useRef<OrientationSample>({ alpha: 0, beta: 0, gamma: 0 });
  const baselineRef = useRef<OrientationSample | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "DeviceOrientationEvent" in window);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    try {
      const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied" | "prompt">;
      };
      if (typeof DOE.requestPermission === "function") {
        const result = await DOE.requestPermission();
        if (result !== "granted") return false;
      }
      setEnabled(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
    baselineRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      const sample = {
        alpha: event.alpha ?? 0,
        beta: event.beta,
        gamma: event.gamma,
      };
      if (!baselineRef.current) {
        baselineRef.current = { ...sample };
      }
      sampleRef.current = sample;
    };

    window.addEventListener("deviceorientation", onOrientation, true);
    return () => window.removeEventListener("deviceorientation", onOrientation, true);
  }, [enabled]);

  const getDelta = useCallback(() => {
    const base = baselineRef.current;
    const cur = sampleRef.current;
    if (!base) return { yaw: 0, pitch: 0 };
    return {
      yaw: degToRad((cur.gamma - base.gamma) * 0.85),
      pitch: degToRad((cur.beta - base.beta) * 0.65),
    };
  }, []);

  return {
    enabled,
    supported,
    requestPermission,
    disable,
    getDelta,
  };
}
