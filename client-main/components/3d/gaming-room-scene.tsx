"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, OrbitControls } from "@react-three/drei";
import { GrandPianoProp } from "@/components/3d/props/GrandPianoProp";

function Loader() {
  return (
    <Html center>
      <div className="rounded bg-black/80 px-3 py-2 text-sm text-white">Loading gaming lounge…</div>
    </Html>
  );
}

function Hotspot({
  position,
  label,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  onClick?: () => void;
}) {
  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.45} />
      </mesh>
      <Html position={[0, 0.35, 0]} center>
        <button
          type="button"
          onClick={onClick}
          className="rounded bg-violet-600 px-2 py-1 text-xs text-white shadow-lg hover:bg-violet-500"
        >
          {label}
        </button>
      </Html>
    </group>
  );
}

function GamingLoungeRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.85} metalness={0.08} />
      </mesh>
      <mesh position={[0, 2.5, -6.8]} receiveShadow>
        <boxGeometry args={[14, 5, 0.35]} />
        <meshStandardMaterial color="#312e81" roughness={0.9} />
      </mesh>
      {[-6.8, 6.8].map((x) => (
        <mesh key={x} position={[x, 2.5, 0]} receiveShadow>
          <boxGeometry args={[0.35, 5, 14]} />
          <meshStandardMaterial color="#3730a3" roughness={0.88} />
        </mesh>
      ))}
      {/* Neon strip */}
      <mesh position={[0, 4.6, -6.6]}>
        <boxGeometry args={[10, 0.08, 0.1]} />
        <meshStandardMaterial color="#c4b5fd" emissive="#8b5cf6" emissiveIntensity={1.2} />
      </mesh>
      {/* Bean bags */}
      {[
        [-3.2, 0.35, 2.5],
        [3.4, 0.35, 2.8],
        [-2, 0.35, 4.2],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1.1, 0.65, 1.1]}>
          <sphereGeometry args={[0.55, 16, 12]} />
          <meshStandardMaterial color={i === 0 ? "#f472b6" : i === 1 ? "#38bdf8" : "#34d399"} roughness={0.95} />
        </mesh>
      ))}
      {/* Arcade cabinet (procedural) */}
      <group position={[4.5, 0, -2]} rotation={[0, -Math.PI / 5, 0]}>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.9, 1.8, 0.65]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.35, 0.28]}>
          <boxGeometry args={[0.75, 0.55, 0.05]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <GrandPianoProp position={[0, 0, -1.2]} rotationY={Math.PI} scale={1.15} pulse />
      <pointLight position={[0, 3.5, -1]} intensity={0.9} color="#a78bfa" distance={8} />
      <pointLight position={[4, 2, 2]} intensity={0.45} color="#38bdf8" distance={6} />
    </group>
  );
}

function GamingLoungeContent({
  courseId,
  onExit,
}: {
  courseId?: string;
  onExit?: () => void;
}) {
  const openClassroom = () => {
    if (courseId && typeof window !== "undefined") {
      window.location.href = `/course/${courseId}/room/classroom`;
    }
  };

  return (
    <>
      <color attach="background" args={["#0f0a1a"]} />
      <fog attach="fog" args={["#0f0a1a", 10, 26]} />
      <Environment preset="night" environmentIntensity={0.35} />
      <ambientLight intensity={0.4} color="#e9d5ff" />
      <directionalLight position={[3, 8, 4]} intensity={0.7} color="#f5f3ff" />
      <hemisphereLight args={["#c4b5fd", "#1e1b4b", 0.45]} />
      <GamingLoungeRoom />
      {courseId && (
        <>
          <Hotspot position={[0, 1.2, -0.5]} label="Play Piano" />
          <Hotspot position={[4.5, 1.4, -2]} label="Arcade" />
          <Hotspot position={[-3, 0.8, 2.5]} label="Relax" />
          <Hotspot position={[0, 0.6, 5.5]} label="Back to Class" onClick={openClassroom} />
          <Hotspot position={[5.5, 0.6, 5]} label="Exit Campus" onClick={onExit} />
        </>
      )}
      <OrbitControls
        target={[0, 1.4, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={3}
        maxDistance={14}
        enablePan={false}
      />
    </>
  );
}

export interface GamingRoomSceneProps {
  courseId?: string;
  onExit?: () => void;
}

export function GamingRoomScene({ courseId, onExit }: GamingRoomSceneProps) {
  return (
    <div className="flex h-full w-full flex-col bg-[#0f0a1a]">
      <div className="z-10 flex items-center justify-between border-b border-white/10 bg-[#1e1b4b] p-4 text-white">
        <h1 className="text-xl font-bold tracking-tight">Gaming Lounge</h1>
        <span className="hidden text-xs text-violet-200/80 sm:inline">
          Piano · Arcade · Student chill zone
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        <Canvas
          camera={{ position: [6, 3.5, 6], fov: 48, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          shadows
        >
          <Suspense fallback={<Loader />}>
            <GamingLoungeContent courseId={courseId} onExit={onExit} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

/** @deprecated Use GamingRoomScene */
export const PrincipalRoomScene = GamingRoomScene;
