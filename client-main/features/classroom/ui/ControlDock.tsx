"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useClassroomStore } from "../store/classroom.store";
import { FanControlCard } from "./FanControlCard";
import { LightControlCard } from "./LightControlCard";
import { CurtainControlCard } from "./CurtainControlCard";
import { useTranslation } from "@/hooks/useTranslation";
import { useAudio } from "@/hooks/useAudio";

interface ControlDockProps {
  fanSpeed: number;
  /** Render controls inline (e.g. inside mobile burger menu). */
  embedded?: boolean;
}

export function ControlDock({ fanSpeed, embedded = false }: ControlDockProps) {
  const { controls, setFanEnabled, setFanMode, setLightsOn, setCurtainOpen } =
    useClassroomStore();
  const { t } = useTranslation();
  const { playToggle } = useAudio();
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <div className="space-y-3">
      <FanControlCard
        enabled={controls.fanEnabled}
        mode={controls.fanMode}
        currentSpeed={fanSpeed}
        onToggle={() => {
          playToggle();
          setFanEnabled(!controls.fanEnabled);
        }}
        onModeChange={(mode) => {
          playToggle();
          setFanMode(mode);
          if (mode !== "OFF") setFanEnabled(true);
          if (mode === "OFF") setFanEnabled(false);
        }}
      />
      <div className="h-px bg-white/8" />
      <LightControlCard
        lightsOn={controls.lightsOn}
        onToggle={() => {
          playToggle();
          setLightsOn(!controls.lightsOn);
        }}
      />
      <div className="h-px bg-white/8" />
      <CurtainControlCard
        openLevel={controls.curtainOpen}
        onChange={(level) => {
          playToggle();
          setCurtainOpen(level);
        }}
      />
    </div>
  );

  const panelShell = "classroom-glass p-3 shadow-2xl";

  if (embedded) {
    return (
      <div className={panelShell}>
        <div className="mb-2 flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-300" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-200">
            {t("classroom.controls.title")}
          </span>
        </div>
        {content}
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet — fixed bottom-right above action bar */}
      <div className="pointer-events-auto hidden w-[min(100%,248px)] md:block">
        <div className={panelShell}>
          <div className="mb-2 flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-300" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-200">
              {t("classroom.controls.title")}
            </span>
          </div>
          {content}
        </div>
      </div>

      {/* Mobile — compact FAB + slide-up panel */}
      <div className="pointer-events-auto md:hidden">
        {!mobileOpen ? (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 rounded-full border border-indigo-400/30 bg-slate-950/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md"
          >
            <SlidersHorizontal className="h-4 w-4 text-indigo-300" />
            {t("classroom.controls.title")}
          </button>
        ) : (
          <div className={`${panelShell} max-h-[min(52vh,360px)] w-[min(calc(100vw-1.5rem),280px)] overflow-y-auto`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-200">
                <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-300" />
                {t("classroom.controls.title")}
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close controls"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {content}
          </div>
        )}
      </div>
    </>
  );
}
