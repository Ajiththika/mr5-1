"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { EnvironmentLighting } from "@/lib/classroom-environment";
import { PhysicsCurtainSystem } from "@/features/classroom/simulation/PhysicsCurtainSystem";

interface ClassroomAtmosphereProps {
  lighting: EnvironmentLighting;
  windowNormal: THREE.Vector3;
  windowCenter: THREE.Vector3;
  curtainOpen: number;
  fanSpeed: number;
  curtainStrength: number;
  windSpeed: number;
  lightsOn: boolean;
}

function WindowBackdrop({
  top,
  bottom,
  center,
  normal,
  sunIntensity,
  curtainOpen,
  lightsOn,
}: {
  top: string;
  bottom: string;
  center: THREE.Vector3;
  normal: THREE.Vector3;
  sunIntensity: number;
  curtainOpen: number;
  lightsOn: boolean;
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

  const glowOpacity = (0.15 + sunIntensity * 0.12) * (0.35 + curtainOpen * 0.65);

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[4.5, 1.8]} />
        <meshBasicMaterial map={texture} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[4, 1.55]} />
        <meshBasicMaterial
          color="#fef3c7"
          transparent
          opacity={glowOpacity * (lightsOn ? 1 : 0.25)}
          toneMapped={false}
        />
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
  const flashRef = useRef(0);

  useFrame((_, delta) => {
    if (!active) return;
    if (Math.random() < 0.002) flashRef.current = 1;
    if (flashRef.current > 0) {
      flashRef.current = Math.max(0, flashRef.current - delta * 3.5);
      if (lightRef.current) lightRef.current.intensity = flashRef.current * 2.4;
    } else if (lightRef.current) {
      lightRef.current.intensity = 0;
    }
  });

  if (!active) return null;
  return <pointLight ref={lightRef} position={[0, 4, -5]} color="#e0f2fe" distance={18} />;
}

function PhysicsCurtain({
  active,
  openLevel,
  fanSpeed,
  windSpeed,
  curtainStrength,
  position,
}: {
  active: boolean;
  openLevel: number;
  fanSpeed: number;
  windSpeed: number;
  curtainStrength: number;
  position: [number, number, number];
}) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  const systemRef = useRef(new PhysicsCurtainSystem());

  useFrame((state, delta) => {
    const snap = systemRef.current.step(delta, {
      openLevel,
      windSpeed,
      fanSpeed,
      curtainStrength,
      elapsed: state.clock.elapsedTime,
    });

    const spread = 0.35 + openLevel * 0.45;
    if (leftRef.current) {
      leftRef.current.rotation.z = snap.swayX + snap.flutter;
      leftRef.current.position.x = position[0] - spread * 0.5;
      leftRef.current.scale.y = 0.55 + openLevel * 0.45;
    }
    if (rightRef.current) {
      rightRef.current.rotation.z = -snap.swayZ - snap.flutter * 0.8;
      rightRef.current.position.x = position[0] + spread * 0.5;
      rightRef.current.scale.y = 0.55 + openLevel * 0.45;
    }
  });

  if (!active && openLevel < 0.05) return null;

  const opacity = 0.12 + openLevel * 0.22;

  return (
    <group position={position}>
      <mesh ref={leftRef} position={[-0.2, 0, 0]}>
        <planeGeometry args={[0.75, 2.5, 6, 14]} />
        <meshStandardMaterial
          color="#e8edf5"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
      <mesh ref={rightRef} position={[0.2, 0, 0]}>
        <planeGeometry args={[0.75, 2.5, 6, 14]} />
        <meshStandardMaterial
          color="#e2e8f0"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

export function ClassroomAtmosphere({
  lighting,
  windowNormal,
  windowCenter,
  curtainOpen,
  fanSpeed,
  curtainStrength,
  windSpeed,
  lightsOn,
}: ClassroomAtmosphereProps) {
  const curtainPos = useMemo((): [number, number, number] => {
    const offset = windowCenter.clone().add(windowNormal.clone().multiplyScalar(0.15));
    return [offset.x + 1.2, offset.y, offset.z];
  }, [windowCenter, windowNormal]);

  return (
    <group>
      <WindowBackdrop
        top={lighting.windowSkyTop}
        bottom={lighting.windowSkyBottom}
        center={windowCenter}
        normal={windowNormal}
        sunIntensity={lighting.sunIntensity}
        curtainOpen={curtainOpen}
        lightsOn={lightsOn}
      />
      {lighting.effects.rain && <WindowRain />}
      <LightningFlash active={lighting.effects.lightning} />
      <PhysicsCurtain
        active={lighting.effects.wind || fanSpeed > 0.08}
        openLevel={curtainOpen}
        fanSpeed={fanSpeed}
        windSpeed={windSpeed}
        curtainStrength={curtainStrength}
        position={curtainPos}
      />
      {lightsOn && lighting.ceilingIntensity > 0.2 && (
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
