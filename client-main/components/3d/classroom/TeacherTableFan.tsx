"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FanPhysicsEngine } from "@/features/classroom/simulation/FanPhysicsEngine";
import type { FanSpeedLevel } from "@/features/classroom/environment/environment.types";
import { MODEL_ASSETS } from "@/lib/3d/model-registry";

const BLADE_COUNT = 3;

function Blade({
  index,
  material,
}: {
  index: number;
  material: THREE.MeshStandardMaterial;
}) {
  const angle = (index / BLADE_COUNT) * Math.PI * 2;
  return (
    <group rotation={[0, angle, 0]}>
      <mesh position={[0.052, 0, 0]} rotation={[0.08, 0, 0]} castShadow material={material}>
        <boxGeometry args={[0.1, 0.012, 0.038]} />
      </mesh>
    </group>
  );
}

export interface TeacherTableFanProps {
  enabled: boolean;
  mode: FanSpeedLevel;
  autoIntensity: number;
  scale?: number;
}

export function TeacherTableFan({
  enabled,
  mode,
  autoIntensity,
  scale = 1,
}: TeacherTableFanProps) {
  const rotorRef = useRef<THREE.Group>(null);
  const engineRef = useRef(new FanPhysicsEngine());

  const textures = useTexture([
    "/textures/fan-3dhaupt-col.png",
    "/textures/fan-3dhaupt-cage.png",
    "/textures/fan-3dhaupt-fan_nor.png",
  ]);

  const materials = useMemo(() => {
    const [colMap, cageMap, normalMap] = textures;
    for (const map of [colMap, cageMap, normalMap]) {
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 4;
    }
    normalMap.colorSpace = THREE.LinearSRGBColorSpace;

    return {
      body: new THREE.MeshStandardMaterial({
        map: colMap,
        normalMap,
        roughness: 0.62,
        metalness: 0.08,
      }),
      cage: new THREE.MeshStandardMaterial({
        map: cageMap,
        alphaMap: cageMap,
        transparent: true,
        alphaTest: 0.35,
        side: THREE.DoubleSide,
        roughness: 0.55,
        metalness: 0.18,
        depthWrite: false,
      }),
      blade: new THREE.MeshStandardMaterial({
        map: colMap,
        normalMap,
        roughness: 0.48,
        metalness: 0.12,
      }),
      hub: new THREE.MeshStandardMaterial({
        color: "#d8d2c8",
        roughness: 0.42,
        metalness: 0.22,
      }),
    };
  }, [textures]);

  useEffect(() => {
    if (!enabled) {
      engineRef.current.setTargetFromLevel("OFF");
      return;
    }
    engineRef.current.setTargetFromLevel(mode, autoIntensity);
  }, [enabled, mode, autoIntensity]);

  useFrame((_, delta) => {
    const snap = engineRef.current.step(delta);
    if (rotorRef.current) {
      rotorRef.current.rotation.z -= snap.angularVelocity * delta;
    }
  });

  return (
    <group scale={scale}>
      <mesh position={[0, 0.028, 0]} castShadow receiveShadow material={materials.body}>
        <cylinderGeometry args={[0.1, 0.11, 0.056, 24]} />
      </mesh>

      <group position={[0, 0.056, 0]} rotation={[-0.38, 0, 0]}>
        <mesh position={[0, 0.09, 0]} castShadow material={materials.body}>
          <cylinderGeometry args={[0.018, 0.022, 0.18, 12]} />
        </mesh>

        <group position={[0, 0.19, 0]}>
          <mesh castShadow material={materials.hub}>
            <cylinderGeometry args={[0.045, 0.05, 0.05, 20]} />
          </mesh>

          <mesh position={[0, 0.01, 0]} castShadow material={materials.cage}>
            <cylinderGeometry args={[0.13, 0.13, 0.045, 32, 1, true]} />
          </mesh>

          <group ref={rotorRef} position={[0, 0.01, 0]}>
            {Array.from({ length: BLADE_COUNT }, (_, i) => (
              <Blade key={i} index={i} material={materials.blade} />
            ))}
            <mesh material={materials.hub}>
              <cylinderGeometry args={[0.02, 0.02, 0.018, 16]} />
            </mesh>
          </group>

          <mesh position={[0, 0.028, 0]} castShadow material={materials.cage}>
            <torusGeometry args={[0.128, 0.006, 8, 32]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

useTexture.preload([
  "/textures/fan-3dhaupt-col.png",
  "/textures/fan-3dhaupt-cage.png",
  "/textures/fan-3dhaupt-fan_nor.png",
]);

export const TEACHER_TABLE_FAN_CREDIT = MODEL_ASSETS.fan3dhaupt.credit;
