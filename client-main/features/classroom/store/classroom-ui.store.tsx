"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface ClassroomUiState {
  menuOpen: boolean;
  lessonMode: boolean;
  focusMode: boolean;
  controlsOpen: boolean;
}

const DEFAULT_UI_STATE: ClassroomUiState = {
  menuOpen: false,
  lessonMode: false,
  focusMode: true,
  controlsOpen: false,
};

interface ClassroomUiContextValue extends ClassroomUiState {
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  setLessonMode: (value: boolean) => void;
  setFocusMode: (value: boolean) => void;
  toggleFocusMode: () => void;
  setControlsOpen: (value: boolean) => void;
  toggleControls: () => void;
}

const ClassroomUiContext = createContext<ClassroomUiContextValue | null>(null);

export function ClassroomUiProvider({ children }: { children: ReactNode }) {
  const [ui, setUi] = useState<ClassroomUiState>(DEFAULT_UI_STATE);

  const patch = useCallback((next: Partial<ClassroomUiState>) => {
    setUi((prev) => ({ ...prev, ...next }));
  }, []);

  const value = useMemo<ClassroomUiContextValue>(
    () => ({
      ...ui,
      openMenu: () => patch({ menuOpen: true }),
      closeMenu: () => patch({ menuOpen: false }),
      toggleMenu: () => patch({ menuOpen: !ui.menuOpen }),
      setLessonMode: (lessonMode) => patch({ lessonMode }),
      setFocusMode: (focusMode) => patch({ focusMode }),
      toggleFocusMode: () => patch({ focusMode: !ui.focusMode }),
      setControlsOpen: (controlsOpen) => patch({ controlsOpen }),
      toggleControls: () => patch({ controlsOpen: !ui.controlsOpen }),
    }),
    [patch, ui],
  );

  return (
    <ClassroomUiContext.Provider value={value}>{children}</ClassroomUiContext.Provider>
  );
}

export function useClassroomUi() {
  const ctx = useContext(ClassroomUiContext);
  if (!ctx) {
    throw new Error("useClassroomUi must be used within ClassroomUiProvider");
  }
  return ctx;
}
