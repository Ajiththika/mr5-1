"use client";

import { useCallback } from "react";
import { useClassroomUi } from "../store/classroom-ui.store";

/**
 * UI layout controller — toggles overlays without touching the 3D scene.
 */
export function useClassroomUILayout() {
  const ui = useClassroomUi();

  const retractForImmersion = useCallback(() => {
    ui.setControlsOpen(false);
    ui.closeMenu();
    ui.setFocusMode(true);
  }, [ui]);

  const runMenuAction = useCallback(
    (action: () => void, options?: { keepOpen?: boolean }) => {
      action();
      if (!options?.keepOpen) {
        retractForImmersion();
      }
    },
    [retractForImmersion],
  );

  return {
    ...ui,
    retractForImmersion,
    runMenuAction,
  };
}
