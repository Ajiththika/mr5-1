"use client";

import { Html } from "@react-three/drei";
import { Fan, GraduationCap, UserRound } from "lucide-react";
import * as THREE from "three";
import { useLayoutEffect, useRef } from "react";

export interface WallControlLabels {
  panel: string;
  fan: string;
  fanOn: string;
  fanOff: string;
  teacher: string;
  student: string;
}

interface WallControlPanelProps {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fanOn: boolean;
  onFanToggle: () => void;
  onTeacher: () => void;
  onStudent: () => void;
  labels: WallControlLabels;
  showTeacherShortcut?: boolean;
  showStudentShortcut?: boolean;
}

export function WallControlPanel({
  position,
  lookAt,
  fanOn,
  onFanToggle,
  onTeacher,
  onStudent,
  labels,
  showTeacherShortcut = true,
  showStudentShortcut = true,
}: WallControlPanelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(position);
    groupRef.current.lookAt(lookAt);
  }, [lookAt, position]);

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.025]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.72, 0.04]} />
        <meshStandardMaterial color="#d4cfc4" roughness={0.5} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.46, 0.76, 0.012]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>

      <Html
        transform
        occlude
        distanceFactor={2.4}
        position={[0, 0, 0.03]}
        style={{ pointerEvents: "auto" }}
      >
        <div
          role="group"
          aria-label={labels.panel}
          className="flex w-[108px] flex-col gap-1.5 rounded-xl border border-slate-500/30 bg-slate-900/95 p-2 shadow-xl"
        >
          <p className="text-center text-[7px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {labels.panel}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFanToggle();
            }}
            aria-pressed={fanOn}
            className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left transition-all ${
              fanOn
                ? "border-sky-400/40 bg-sky-600/80 text-white"
                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            }`}
          >
            <Fan
              className={`h-4 w-4 shrink-0 ${fanOn ? "animate-spin text-sky-100" : ""}`}
              style={{ animationDuration: "0.9s" }}
            />
            <span className="text-[9px] font-bold uppercase leading-tight">
              {labels.fan}
              <br />
              <span className="text-[8px] opacity-80">
                {fanOn ? labels.fanOn : labels.fanOff}
              </span>
            </span>
          </button>

          {showTeacherShortcut && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTeacher();
              }}
              className="flex items-center gap-2 rounded-lg border border-violet-400/25 bg-violet-500/15 px-2 py-2 text-left text-violet-100 transition-colors hover:bg-violet-500/25"
            >
              <GraduationCap className="h-4 w-4 shrink-0" />
              <span className="text-[9px] font-bold uppercase">{labels.teacher}</span>
            </button>
          )}

          {showStudentShortcut && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStudent();
              }}
              className="flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/15 px-2 py-2 text-left text-emerald-100 transition-colors hover:bg-emerald-500/25"
            >
              <UserRound className="h-4 w-4 shrink-0" />
              <span className="text-[9px] font-bold uppercase">{labels.student}</span>
            </button>
          )}
        </div>
      </Html>
    </group>
  );
}
