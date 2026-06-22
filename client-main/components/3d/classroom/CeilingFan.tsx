"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FanPhysicsEngine } from "@/features/classroom/simulation/FanPhysicsEngine";
import { FanAudioManager } from "@/lib/audio/FanAudioManager";
import type { FanSpeedLevel } from "@/features/classroom/environment/environment.types";
import type { FanEnvironmentInput } from "@/lib/audio/types";

const BLADE_COUNT = 3;

function Blade({
  index,
  material,
  holderMaterial,
}: {
  index: number;
  material: THREE.MeshStandardMaterial;
  holderMaterial: THREE.MeshStandardMaterial;
}) {
  const angle = (index / BLADE_COUNT) * Math.PI * 2;

  return (
    <group rotation={[0, angle, 0]}>
      <mesh position={[0.4, -0.04, 0]} rotation={[0.1, 0, 0]} castShadow material={material}>
        <boxGeometry args={[0.8, 0.022, 0.13]} />
      </mesh>
      <mesh position={[0.13, -0.05, 0]} castShadow material={holderMaterial}>
        <boxGeometry args={[0.07, 0.035, 0.055]} />
      </mesh>
    </group>
  );
}

export interface CeilingFanProps {
  position: [number, number, number];
  enabled: boolean;
  mode: FanSpeedLevel;
  autoIntensity: number;
  scale?: number;
  onSpeedChange?: (speed: number) => void;
  environment?: FanEnvironmentInput;
}

export function CeilingFan({
  position,
  enabled,
  mode,
  autoIntensity,
  scale = 1,
  onSpeedChange,
  environment,
}: CeilingFanProps) {
  const rotorRef = useRef<THREE.Group>(null);
  const engineRef = useRef(new FanPhysicsEngine());
  const audioRef = useRef<FanAudioManager | null>(null);
  const speedReportTimer = useRef(0);

  const materials = useMemo(
    () => ({
      rod: new THREE.MeshStandardMaterial({ color: "#8b7355", roughness: 0.45, metalness: 0.55 }),
      canopy: new THREE.MeshStandardMaterial({ color: "#f5f0e8", roughness: 0.62, metalness: 0.08 }),
      motor: new THREE.MeshStandardMaterial({ color: "#d4cfc4", roughness: 0.55, metalness: 0.12 }),
      motorRing: new THREE.MeshStandardMaterial({ color: "#b8860b", roughness: 0.35, metalness: 0.65 }),
      blade: new THREE.MeshStandardMaterial({ color: "#c4a574", roughness: 0.72, metalness: 0.05 }),
      holder: new THREE.MeshStandardMaterial({ color: "#a67c00", roughness: 0.38, metalness: 0.7 }),
      cap: new THREE.MeshStandardMaterial({ color: "#8b6914", roughness: 0.42, metalness: 0.55 }),
    }),
    [],
  );

  useEffect(() => {
    audioRef.current = new FanAudioManager();
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      engineRef.current.setTargetFromLevel("OFF");
      return;
    }
    engineRef.current.setTargetFromLevel(mode, autoIntensity);
  }, [enabled, mode, autoIntensity]);

  useEffect(() => {
    audioRef.current?.setEnvironment(environment ?? {});
  }, [environment]);

  useFrame((_, delta) => {
    const snap = engineRef.current.step(delta);

    if (rotorRef.current) {
      rotorRef.current.rotation.y -= snap.angularVelocity * delta;
      rotorRef.current.rotation.x = snap.wobble;
    }

    audioRef.current?.update(snap.currentSpeed, delta);

    speedReportTimer.current += delta;
    if (onSpeedChange && speedReportTimer.current > 0.12) {
      speedReportTimer.current = 0;
      onSpeedChange(snap.currentSpeed);
    }
  });

  return (
    <group position={position} scale={scale}>
      <mesh castShadow material={materials.canopy}>
        <cylinderGeometry args={[0.11, 0.13, 0.055, 24]} />
      </mesh>
      <mesh position={[0, -0.26, 0]} castShadow material={materials.rod}>
        <cylinderGeometry args={[0.016, 0.016, 0.46, 12]} />
      </mesh>
      <mesh position={[0, -0.54, 0]} castShadow material={materials.motor}>
        <cylinderGeometry args={[0.15, 0.17, 0.13, 24]} />
      </mesh>
      <mesh position={[0, -0.48, 0]} castShadow material={materials.motorRing}>
        <torusGeometry args={[0.16, 0.011, 12, 32]} />
      </mesh>
      <group ref={rotorRef} position={[0, -0.58, 0]}>
        {Array.from({ length: BLADE_COUNT }, (_, i) => (
          <Blade key={i} index={i} material={materials.blade} holderMaterial={materials.holder} />
        ))}
        <mesh position={[0, -0.07, 0]} castShadow material={materials.cap}>
          <sphereGeometry args={[0.045, 16, 16]} />
        </mesh>
      </group>
    </group>
  );
}
