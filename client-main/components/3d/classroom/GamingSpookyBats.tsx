"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const BAT_TEXTURE = "/assets/3d/props/bat/textures/bat.jpg";

interface GamingSpookyBatsProps {
  visible: boolean;
  roomCenter: THREE.Vector3;
  classDirection: THREE.Vector3;
  ceilingY: number;
}

type BatSpec = {
  offset: THREE.Vector3;
  speed: number;
  phase: number;
  scale: number;
  orbit: number;
};

function BatMesh({
  spec,
  visible,
  roomCenter,
  texture,
}: {
  spec: BatSpec;
  visible: boolean;
  roomCenter: THREE.Vector3;
  texture: THREE.Texture;
}) {
  const ref = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const elapsed = state.clock.elapsedTime;
    const reveal = THREE.MathUtils.damp(
      ref.current.userData.reveal ?? 0,
      visible ? 1 : 0,
      5,
      delta,
    );
    ref.current.userData.reveal = reveal;
    ref.current.visible = reveal > 0.03;

    const t = elapsed * spec.speed + spec.phase;
    const orbitX = Math.cos(t) * spec.orbit;
    const orbitZ = Math.sin(t * 0.85) * spec.orbit * 0.7;
    const bob = Math.sin(t * 2.4) * 0.18;

    ref.current.position.set(
      roomCenter.x + spec.offset.x + orbitX,
      spec.offset.y + bob,
      roomCenter.z + spec.offset.z + orbitZ,
    );
    ref.current.rotation.set(
      Math.sin(t * 1.2) * 0.15,
      t + Math.PI,
      Math.sin(t * 1.8) * 0.25,
    );
    ref.current.scale.setScalar(spec.scale * reveal);

    const flap = Math.sin(t * 9) * 0.55;
    if (wingL.current) wingL.current.rotation.z = 0.35 + flap;
    if (wingR.current) wingR.current.rotation.z = -0.35 - flap;
  });

  return (
    <group ref={ref} visible={false}>
      <mesh>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#1a1020" roughness={0.7} />
      </mesh>
      <mesh ref={wingL} position={[-0.12, 0, 0]} rotation={[0, 0, 0.35]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={wingR} position={[0.12, 0, 0]} rotation={[0, 0, -0.35]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function GamingSpookyBats({
  visible,
  roomCenter,
  classDirection,
  ceilingY,
}: GamingSpookyBatsProps) {
  const texture = useTexture(BAT_TEXTURE);

  const bats = useMemo<BatSpec[]>(() => {
    const side = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), classDirection)
      .normalize();
    const baseY = ceilingY - 0.55;
    return [
      { offset: side.clone().multiplyScalar(2.8).add(classDirection.clone().multiplyScalar(-1.5)).setY(baseY), speed: 0.45, phase: 0, scale: 1.1, orbit: 0.9 },
      { offset: side.clone().multiplyScalar(-2.2).add(classDirection.clone().multiplyScalar(0.5)).setY(baseY - 0.2), speed: 0.55, phase: 1.4, scale: 0.95, orbit: 1.1 },
      { offset: classDirection.clone().multiplyScalar(2.4).setY(baseY - 0.35), speed: 0.38, phase: 2.8, scale: 1.25, orbit: 0.75 },
      { offset: classDirection.clone().multiplyScalar(-2.8).add(side.clone().multiplyScalar(1.2)).setY(baseY - 0.1), speed: 0.5, phase: 4.1, scale: 0.85, orbit: 1.0 },
    ].map((b) => ({ ...b, offset: b.offset.clone() }));
  }, [classDirection, ceilingY]);

  useLayoutEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  return (
    <group name="gaming_spooky_bats">
      {bats.map((spec, index) => (
        <BatMesh
          key={`bat-${index}`}
          spec={spec}
          visible={visible}
          roomCenter={roomCenter}
          texture={texture}
        />
      ))}
    </group>
  );
}

useTexture.preload(BAT_TEXTURE);
