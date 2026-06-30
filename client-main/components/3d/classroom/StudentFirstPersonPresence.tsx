"use client";

import { useCallback, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Image } from "@react-three/drei";
import * as THREE from "three";
import { getTamilGreeting } from "@/lib/tamil-greetings";
import { sampleStudentBreathOffsets } from "@/lib/classroom/student-presence";
import { MR5_LOGO_PATH } from "@/lib/brand/logo";

const BLAZER = "#1a2748";
const SHIRT = "#f4f4f2";

export function StudentFirstPersonPresence({ enabled = true }: { enabled?: boolean }) {
  const { camera } = useThree();
  const rigRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const badgeRef = useRef<THREE.Group>(null);
  const greetingPulseRef = useRef(0);

  const playGreeting = useCallback(() => {
    if (typeof window === "undefined") return;
    const greeting = getTamilGreeting();
    const line =
      greeting.transliteration || greeting.english || "Welcome to MR5 School";
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(`${line}!`);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    window.speechSynthesis?.speak(utterance);
    greetingPulseRef.current = 1;
  }, []);

  useFrame((state, delta) => {
    if (!enabled || !rigRef.current) return;

    rigRef.current.position.copy(camera.position);
    rigRef.current.quaternion.copy(camera.quaternion);

    const offsets = sampleStudentBreathOffsets(state.clock.elapsedTime);
    const lerp = 1 - Math.exp(-10 * delta);

    if (chestRef.current) {
      chestRef.current.position.y = THREE.MathUtils.lerp(
        chestRef.current.position.y,
        -0.34 + offsets.chestY,
        lerp,
      );
      chestRef.current.scale.setScalar(
        THREE.MathUtils.lerp(chestRef.current.scale.x, offsets.chestScale, lerp),
      );
    }

    if (greetingPulseRef.current > 0) {
      greetingPulseRef.current = Math.max(0, greetingPulseRef.current - delta * 1.8);
    }

    if (badgeRef.current) {
      const pulse = 1 + greetingPulseRef.current * 0.08;
      badgeRef.current.scale.setScalar(pulse);
    }
  });

  if (!enabled) return null;

  return (
    <group ref={rigRef} name="student_first_person">
      <group ref={chestRef} position={[0, -0.34, -0.36]}>
        <mesh position={[0, 0.08, 0]} renderOrder={12}>
          <planeGeometry args={[0.52, 0.14]} />
          <meshStandardMaterial color={SHIRT} roughness={0.88} metalness={0.02} />
        </mesh>

        <mesh position={[0, -0.02, 0.004]} renderOrder={11}>
          <planeGeometry args={[0.62, 0.42]} />
          <meshStandardMaterial color={BLAZER} roughness={0.82} metalness={0.04} />
        </mesh>

        <mesh position={[-0.14, 0.02, 0.006]} rotation={[0, 0, 0.22]} renderOrder={12}>
          <planeGeometry args={[0.18, 0.28]} />
          <meshStandardMaterial
            color={BLAZER}
            roughness={0.8}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0.14, 0.02, 0.006]} rotation={[0, 0, -0.22]} renderOrder={12}>
          <planeGeometry args={[0.18, 0.28]} />
          <meshStandardMaterial
            color={BLAZER}
            roughness={0.8}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>

        <group
          ref={badgeRef}
          position={[-0.1, 0.04, 0.014]}
          onClick={(event) => {
            event.stopPropagation();
            playGreeting();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <mesh renderOrder={20}>
            <circleGeometry args={[0.042, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.1} />
          </mesh>
          <Image url={MR5_LOGO_PATH} scale={0.056} transparent toneMapped={false} renderOrder={21} />
        </group>
      </group>
    </group>
  );
}
