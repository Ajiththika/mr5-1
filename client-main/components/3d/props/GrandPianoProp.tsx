"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getBrandSoundManager } from "@/lib/audio";

export const GRAND_PIANO_GLB = "/assets/3d/props/grand-piano.glb";

function tunePianoMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.envMapIntensity = 0.55;
        mat.roughness = Math.min(mat.roughness, 0.65);
      }
    }
  });
}

export function GrandPianoProp({
  position = [0, 0, 0] as [number, number, number],
  rotationY = 0,
  scale = 1,
  interactive = true,
  pulse = false,
}: {
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
  interactive?: boolean;
  pulse?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(GRAND_PIANO_GLB);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    tunePianoMaterials(clone);
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (!pulse || !groupRef.current) return;
    const s = scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.015);
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      onClick={
        interactive
          ? (event) => {
              event.stopPropagation();
              getBrandSoundManager().playReward();
            }
          : undefined
      }
    >
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(GRAND_PIANO_GLB);
