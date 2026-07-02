"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getBrandSoundManager } from "@/lib/audio";

export const GRAND_PIANO_GLB = "/assets/3d/props/grand-piano.glb";

interface GamingGrandPianoProps {
  visible: boolean;
  floorY: number;
  roomCenter: THREE.Vector3;
  classDirection: THREE.Vector3;
}

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

export function GamingGrandPiano({
  visible,
  floorY,
  roomCenter,
  classDirection,
}: GamingGrandPianoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(GRAND_PIANO_GLB);
  const reveal = useRef(0);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    tunePianoMaterials(clone);
    return clone;
  }, [scene]);

  const { position, rotationY } = useMemo(() => {
    const side = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), classDirection)
      .normalize();
    const pos = roomCenter
      .clone()
      .add(side.multiplyScalar(2.35))
      .add(classDirection.clone().multiplyScalar(-1.2));
    pos.y = floorY;
    const rotY = Math.atan2(roomCenter.x - pos.x, roomCenter.z - pos.z);
    return { position: pos, rotationY: rotY };
  }, [roomCenter, classDirection, floorY]);

  useEffect(() => {
    if (!visible) reveal.current = 0;
  }, [visible]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = visible ? 1 : 0;
    reveal.current = THREE.MathUtils.damp(reveal.current, target, 6, delta);
    const scale = 0.85 + reveal.current * 0.15;
    groupRef.current.scale.setScalar(scale * reveal.current);
    groupRef.current.visible = reveal.current > 0.02;
  });

  const playNote = () => {
    getBrandSoundManager().playReward();
  };

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[0, rotationY, 0]}
      visible={false}
      onClick={(event) => {
        event.stopPropagation();
        playNote();
      }}
    >
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(GRAND_PIANO_GLB);
