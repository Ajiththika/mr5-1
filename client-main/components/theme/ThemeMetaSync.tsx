"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/** Keeps mobile browser chrome color in sync with light/dark mode. */
export function ThemeMetaSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    meta.setAttribute(
      "content",
      resolvedTheme === "light" ? "#f8fafc" : "#0f1117",
    );
  }, [resolvedTheme]);

  return null;
}
