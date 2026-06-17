"use client";

import { useEffect } from "react";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { applyFontScale, applyReduceMotion } from "@/lib/color-themes";

const FONT_SCALE: Record<string, number> = {
  small: 0.9,
  medium: 1,
  large: 1.15,
};

export function AccessibilityPreferencesSync() {
  const { userPreferences } = useEnhancedUser();

  useEffect(() => {
    const accessibility = userPreferences?.accessibility ?? {
      highContrast: false,
      reducedMotion: false,
      fontSize: "medium" as const,
    };

    applyReduceMotion(accessibility.reducedMotion);
    applyFontScale(FONT_SCALE[accessibility.fontSize] ?? 1);

    if (accessibility.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [userPreferences]);

  return null;
}
