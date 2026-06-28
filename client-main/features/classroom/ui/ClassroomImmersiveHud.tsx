"use client";

import type { ReactNode } from "react";
import {
  Armchair,
  BookOpen,
  DoorOpen,
  Menu,
  SlidersHorizontal,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EnvironmentPanel } from "./EnvironmentPanel";
import { ControlDock } from "./ControlDock";
import { PlaytimePanel } from "./PlaytimePanel";
import { TeacherChallengePanel } from "./TeacherChallengePanel";
import { TeacherPlaytimePanel } from "@/components/classroom/teacher-playtime-panel";
import { GlassIconButton, GlassPanel } from "./GlassPanel";
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
  selectedSeatId?: number;
  onChangeSeat?: () => void;
  onBack?: () => void;
  onAction: (id: ActionId) => void;
}

export function ClassroomImmersiveHud({
  cameraMode,
  fanSpeed,
  courseTitle,
  modeLabel,
  selectedSeatId,
  onChangeSeat,
  onBack,
  onAction,
}: ClassroomImmersiveHudProps) {
  const { t } = useTranslation();
  const { playtimeOpen, challengeOpen } = useClassroomStore();
  const {
    menuOpen,
    controlsOpen,
    closeMenu,
    toggleMenu,
    setControlsOpen,
    setLessonMode,
    runMenuAction,
    retractForImmersion,
  } = useClassroomUILayout();

  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") retractForImmersion();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [retractForImmersion]);

  const toggleAudio = () => {
    setAudioMuted((m) => !m);
    document.querySelectorAll("audio").forEach((el) => {
      el.muted = !audioMuted;
    });
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="flex items-start justify-between gap-2 p-3 sm:p-4">
        <GlassPanel className="max-w-[min(100%,260px)] px-3 py-2">
          <p className="truncate text-xs font-semibold text-white sm:text-sm">
            {courseTitle ?? t("classroom.title")}
          </p>
          <p className="truncate text-[10px] text-white/60 sm:text-xs">{modeLabel}</p>
        </GlassPanel>

        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          {cameraMode === "student" && onChangeSeat && (
            <GlassIconButton
              label={`Seat ${selectedSeatId ?? 3}`}
              onClick={onChangeSeat}
            >
              <Armchair className="h-4 w-4" />
            </GlassIconButton>
          )}
          <GlassIconButton
            label={audioMuted ? "Unmute audio" : "Mute audio"}
            onClick={toggleAudio}
            active={!audioMuted}
          >
            {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </GlassIconButton>
          <GlassIconButton
            label="Settings"
            onClick={() => setControlsOpen(!controlsOpen)}
            active={controlsOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </GlassIconButton>
          <GlassIconButton
            label={menuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
            active={menuOpen}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
            icon={<UserRound className="h-4 w-4 text-sky-300" />}
            label={t("classroom.aiTeacher")}
            onClick={() => runMenuAction(() => onAction("teacher"))}
          />
          {cameraMode === "student" && onChangeSeat && (
            <NavItem
              icon={<Armchair className="h-4 w-4 text-amber-300" />}
              label={`Change seat (${selectedSeatId ?? 3})`}
              onClick={() => runMenuAction(onChangeSeat)}
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
              <EnvironmentPanel className="w-full max-w-none !border-0 !bg-transparent !shadow-none" />
              {cameraMode === "student" && playtimeOpen && <PlaytimePanel />}
              {cameraMode === "teacher" && (
                <>
                  {challengeOpen && <TeacherChallengePanel />}
                  {playtimeOpen && <TeacherPlaytimePanel />}
                </>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
