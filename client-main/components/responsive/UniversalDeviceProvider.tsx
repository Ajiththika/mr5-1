"use client";

import { useEffect, type ReactNode } from "react";
import {
  readViewportSegmentCount,
  resolveDeviceProfile,
  type DeviceProfile,
} from "@/lib/responsive/device-profile";

function applyDeviceProfile(profile: DeviceProfile) {
  const root = document.documentElement;
  root.dataset.device = profile;
  root.dataset.touch =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
      ? "coarse"
      : "fine";
}

/** Sets `data-device` on `<html>` for CSS device modes — no routing or API impact. */
export function UniversalDeviceProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const update = () => {
      applyDeviceProfile(
        resolveDeviceProfile(window.innerWidth, readViewportSegmentCount()),
      );
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    window.visualViewport?.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  return <>{children}</>;
}
