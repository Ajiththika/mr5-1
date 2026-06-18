"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EnvironmentLighting } from "@/lib/classroom-environment";

interface ClassroomAtmosphereProps {
  lighting: EnvironmentLighting;
  windowNormal: THREE.Vector3;
  windowCenter: THREE.Vector3;
}

function WindowBackdrop({
  top,
  bottom,
  center,
  normal,
}: {
  top: string;
  bottom: string;
  center: THREE.Vector3;
  normal: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, top);
      gradient.addColorStop(1, bottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 4, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [top, bottom]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(center).add(normal.clone().multiplyScalar(0.35));
    groupRef.current.lookAt(center.clone().add(normal));
  }, [center, normal]);

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[14, 5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function WindowRain() {
  const count = 280;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = Math.random() * 4 + 0.5;
      pos[i * 3 + 2] = -4.2 + Math.random() * 0.4;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame(() => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      attr.array[i * 3 + 1] -= 0.06;
      if (attr.array[i * 3 + 1] < 0.4) attr.array[i * 3 + 1] = 4.5;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#a5d8ff"
        size={0.03}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

function LightningFlash({ active }: { active: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const [flash, setFlash] = useState(0);

  useFrame((_, delta) => {
    if (!active) return;
    if (Math.random() < 0.002) setFlash(1);
    if (flash > 0) {
      setFlash((value) => Math.max(0, value - delta * 3.5));
      if (lightRef.current) lightRef.current.intensity = flash * 2.4;
    } else if (lightRef.current) {
      lightRef.current.intensity = 0;
    }
  });

  if (!active) return null;
  return <pointLight ref={lightRef} position={[0, 4, -5]} color="#e0f2fe" distance={18} />;
}

function WindCurtain({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current || !active) return;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.6) * 0.06;
  });

  if (!active) return null;
  return (
    <mesh ref={ref} position={[4.5, 2.2, -2.8]}>
      <planeGeometry args={[0.8, 2.4, 8, 16]} />
      <meshStandardMaterial color="#e2e8f0" transparent opacity={0.22} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function ClassroomAtmosphere({
  lighting,
  windowNormal,
  windowCenter,
}: ClassroomAtmosphereProps) {
  return (
    <group>
      <WindowBackdrop
        top={lighting.windowSkyTop}
        bottom={lighting.windowSkyBottom}
        center={windowCenter}
        normal={windowNormal}
      />
      {lighting.effects.rain && <WindowRain />}
      <LightningFlash active={lighting.effects.lightning} />
      <WindCurtain active={lighting.effects.wind} />
      {lighting.ceilingIntensity > 0.2 && (
        <>
          <pointLight
            position={[-2, 3.2, 1]}
            intensity={lighting.ceilingIntensity}
            color="#fef9c3"
            distance={12}
          />
          <pointLight
            position={[2, 3.2, 1]}
            intensity={lighting.ceilingIntensity * 0.9}
            color="#fef9c3"
            distance={12}
          />
        </>
      )}
    </group>
  );
}
