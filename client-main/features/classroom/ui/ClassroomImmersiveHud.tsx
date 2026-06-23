"use client";

import type { ReactNode } from "react";
import {
  BookOpen,
  DoorOpen,
  Eye,
  EyeOff,
  Gamepad2,
  Menu,
  Maximize2,
  Minimize2,
  Presentation,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EnvironmentPanel } from "./EnvironmentPanel";
import { EnvironmentDevPanel } from "@/components/classroom/EnvironmentDevPanel";
import { ControlDock } from "./ControlDock";
import { PlaytimePanel } from "./PlaytimePanel";
import { TeacherChallengePanel } from "./TeacherChallengePanel";
import { TeacherPlaytimePanel } from "@/components/classroom/teacher-playtime-panel";
import { GlassIconButton, GlassPanel } from "./GlassPanel";
import { ModelCreditNotice } from "@/components/3d/ModelCreditNotice";
import { useClassroomUILayout } from "./ClassroomUILayout";
import { useClassroomStore } from "../store/classroom.store";
import { useTranslation } from "@/hooks/useTranslation";

type CameraMode = "student" | "teacher";
type ActionId = "board" | "lesson" | "teacher" | "exit";

function NavItem({
  icon,
  label,
  tone = "hover:bg-white/10",
  onClick,
}: {
  icon: ReactNode;
  label: string;
  tone?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`classroom-glass pointer-events-auto flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white transition-colors ${tone}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
        {icon}
      </span>
      {label}
    </button>
  );
}

export interface ClassroomImmersiveHudProps {
  cameraMode: CameraMode;
  fanSpeed: number;
  courseTitle?: string;
  modeLabel: string;
  onBack?: () => void;
  onAction: (id: ActionId) => void;
}

export function ClassroomImmersiveHud({
  cameraMode,
  fanSpeed,
  courseTitle,
  modeLabel,
  onBack,
  onAction,
}: ClassroomImmersiveHudProps) {
  const { t } = useTranslation();
  const { togglePlaytime, toggleChallenge } = useClassroomStore();
  const {
    menuOpen,
    focusMode,
    controlsOpen,
    closeMenu,
    toggleMenu,
    toggleFocusMode,
    setControlsOpen,
    setLessonMode,
    runMenuAction,
    retractForImmersion,
  } = useClassroomUILayout();

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") retractForImmersion();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [retractForImmersion]);

  const toggleFullscreen = async () => {
    const root = document.querySelector(".classroom-scene-viewport");
    if (!root) return;
    if (!document.fullscreenElement) {
      await root.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Floating top dock */}
      <div className="flex items-start justify-between gap-2 p-3 sm:p-4">
        {focusMode && !menuOpen && (
          <GlassPanel className="max-w-[min(100%,220px)] px-3 py-2">
            <p className="truncate text-[11px] font-semibold text-white">
              {courseTitle ?? t("classroom.title")}
            </p>
            <p className="truncate text-[10px] text-white/55">{modeLabel}</p>
          </GlassPanel>
        )}

        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          <GlassIconButton
            label={menuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
            active={menuOpen}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </GlassIconButton>
          <GlassIconButton
            label={focusMode ? "Hide HUD" : "Show HUD"}
            onClick={toggleFocusMode}
            active={!focusMode}
          >
            {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </GlassIconButton>
          <GlassIconButton
            label="Room controls"
            onClick={() => setControlsOpen(!controlsOpen)}
            active={controlsOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </GlassIconButton>
          <GlassIconButton
            label="Fullscreen"
            onClick={toggleFullscreen}
            active={isFullscreen}
            className="hidden sm:inline-flex"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </GlassIconButton>
        </div>
      </div>

      {controlsOpen && (
        <div className="pointer-events-auto absolute right-3 top-[4.25rem] z-30 w-[min(calc(100vw-1.5rem),260px)] sm:right-4 sm:top-[4.5rem]">
          <ControlDock fanSpeed={fanSpeed} embedded />
        </div>
      )}

      {menuOpen && (
        <div
          className="pointer-events-auto absolute inset-0 z-30 bg-black/50 backdrop-blur-[10px]"
          onClick={closeMenu}
          aria-hidden={false}
        />
      )}

      <aside
        className={`classroom-side-dock classroom-glass pointer-events-auto absolute inset-y-0 left-0 z-40 flex w-[min(88vw,300px)] flex-col border-r border-white/15 transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Classroom navigation"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-sm font-bold text-white">{t("classroom.title")}</p>
          <button
            type="button"
            onClick={closeMenu}
            className="classroom-glass rounded-lg p-2 text-white/80"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          <NavItem
            icon={<Presentation className="h-4 w-4 text-indigo-300" />}
            label={t("classroom.whiteboard")}
            onClick={() => runMenuAction(() => onAction("board"))}
          />
          <NavItem
            icon={<BookOpen className="h-4 w-4 text-emerald-300" />}
            label={t("classroom.startLesson")}
            tone="hover:bg-emerald-500/15"
            onClick={() =>
              runMenuAction(() => {
                setLessonMode(true);
                onAction("lesson");
              })
            }
          />
          <NavItem
            icon={<UserRound className="h-4 w-4 text-sky-300" />}
            label={t("classroom.aiTeacher")}
            onClick={() => runMenuAction(() => onAction("teacher"))}
          />
          {cameraMode === "student" && (
            <NavItem
              icon={<Gamepad2 className="h-4 w-4 text-violet-300" />}
              label={t("classroom.playtime")}
              onClick={() => runMenuAction(() => togglePlaytime())}
            />
          )}
          {cameraMode === "teacher" && (
            <NavItem
              icon={<Gamepad2 className="h-4 w-4 text-violet-300" />}
              label={t("classroom.challenges")}
              onClick={() => runMenuAction(() => toggleChallenge())}
            />
          )}
          {onBack && (
            <NavItem
              icon={<DoorOpen className="h-4 w-4 text-amber-300" />}
              label={t("classroom.exit")}
              onClick={() => runMenuAction(() => onAction("exit"))}
            />
          )}

          {menuOpen && (
            <div className="space-y-3 pt-2">
              <EnvironmentPanel className="w-full max-w-none !bg-transparent !border-0 !shadow-none" />
              <EnvironmentDevPanel />
              {cameraMode === "student" && <PlaytimePanel />}
              {cameraMode === "teacher" && (
                <>
                  <TeacherChallengePanel />
                  <TeacherPlaytimePanel />
                </>
              )}
              <ModelCreditNotice variant="scene" className="pointer-events-auto" />
            </div>
          )}
        </div>
      </aside>

      {focusMode && !menuOpen && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <GlassPanel className="px-3 py-1.5 text-[10px] text-white/55">
            Drag to look around · ☰ for menu
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
