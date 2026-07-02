"use client";

import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  useGLTF,
  useProgress,
  Center,
} from "@react-three/drei";
import * as THREE from "three";

export type RoomSceneVariant = "default" | "cafeteria" | "restroom";

function Loader({ label }: { label: string }) {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded bg-black/80 px-3 py-2 text-sm text-white">
        Loading {label}: {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function tuneRoomMaterials(root: THREE.Object3D, variant: RoomSceneVariant) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
      mat.envMapIntensity = 0.5;
      if (variant === "cafeteria") {
        mat.color.lerp(new THREE.Color("#f5e6d3"), 0.25);
        mat.roughness = Math.min(mat.roughness + 0.05, 0.92);
      } else if (variant === "restroom") {
        mat.color.lerp(new THREE.Color("#e8f4fc"), 0.3);
        mat.roughness = Math.min(mat.roughness + 0.08, 0.95);
        mat.metalness = Math.min(mat.metalness + 0.05, 0.35);
      }
    }
  });
}

function GLBModel({ url, variant }: { url: string; variant: RoomSceneVariant }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    tuneRoomMaterials(clone, variant);
    return clone;
  }, [scene, variant]);

  return (
    <Center>
      <primitive object={model} scale={variant === "cafeteria" ? 0.85 : 0.82} />
    </Center>
  );
}

function CafeteriaProps() {
  const tableColor = "#8b5a2b";
  const positions: [number, number, number][] = [
    [-2.5, 0, -1.5],
    [0, 0, -2],
    [2.5, 0, -1.2],
    [-1.5, 0, 1.8],
    [1.8, 0, 2],
  ];
  return (
    <group>
      {positions.map(([x, , z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.06, 16]} />
            <meshStandardMaterial color={tableColor} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
          </mesh>
          {[0, 1, 2, 3].map((seat) => {
            const angle = (seat / 4) * Math.PI * 2;
            return (
              <mesh
                key={seat}
                position={[Math.cos(angle) * 0.75, 0.22, Math.sin(angle) * 0.75]}
                castShadow
              >
                <boxGeometry args={[0.35, 0.06, 0.35]} />
                <meshStandardMaterial color="#f97316" roughness={0.85} />
              </mesh>
            );
          })}
        </group>
      ))}
      <mesh position={[0, 2.8, -4.5]}>
        <boxGeometry args={[3, 0.5, 0.15]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function RestroomProps() {
  return (
    <group>
      {[-2.2, 0, 2.2].map((x, i) => (
        <group key={i} position={[x, 0, -2.5]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.7, 1, 0.45]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} />
          </mesh>
          <mesh position={[0, 1.35, 0.05]}>
            <boxGeometry args={[0.55, 0.7, 0.04]} />
            <meshStandardMaterial
              color="#e0f2fe"
              roughness={0.15}
              metalness={0.35}
              envMapIntensity={1}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[3.2, 0.45, 1.5]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.05} />
      </mesh>
    </group>
  );
}

function Hotspot({
  position,
  label,
  onClick,
  color = "#22c55e",
}: {
  position: [number, number, number];
  label: string;
  onClick?: () => void;
  color?: string;
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
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
      </mesh>
      <Html position={[0, 0.35, 0]} center>
        <button
          type="button"
          onClick={onClick}
          className="rounded bg-slate-900/90 px-2 py-1 text-xs text-white shadow-lg hover:bg-slate-800"
        >
          {label}
        </button>
      </Html>
    </group>
  );
}

interface RoomSceneProps {
  modelUrl: string;
  name: string;
  courseId?: string;
  variant?: RoomSceneVariant;
}

function RoomContent({
  modelUrl,
  courseId,
  variant = "default",
}: Pick<RoomSceneProps, "modelUrl" | "courseId" | "variant">) {
  const isGlb = modelUrl.endsWith(".glb") || modelUrl.endsWith(".gltf");

  const bg =
    variant === "cafeteria" ? "#1c1410" : variant === "restroom" ? "#0f172a" : "#1a1a1a";
  const fog =
    variant === "cafeteria" ? "#1c1410" : variant === "restroom" ? "#0f172a" : "#1a1a1a";

  const backToCampus = () => {
    if (courseId && typeof window !== "undefined") {
      window.location.href = `/course/${courseId}`;
    } else {
      window.history.back();
    }
  };

  const openGaming = () => {
    if (courseId && typeof window !== "undefined") {
      window.location.href = `/course/${courseId}/room/principal`;
    }
  };

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[fog, 12, 28]} />
      <Environment preset={variant === "cafeteria" ? "sunset" : "apartment"} environmentIntensity={0.45} />
      <ambientLight
        intensity={variant === "restroom" ? 0.65 : 0.5}
        color={variant === "cafeteria" ? "#fff7ed" : "#f0f9ff"}
      />
      <directionalLight
        position={[5, 8, 5]}
        intensity={variant === "cafeteria" ? 1.1 : 0.95}
        color="#ffffff"
        castShadow
      />
      {variant === "cafeteria" && (
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#fbbf24" distance={10} />
      )}
      {isGlb ? (
        <GLBModel url={modelUrl} variant={variant} />
      ) : (
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[8, 4, 8]} />
          <meshStandardMaterial color="#334155" wireframe />
        </mesh>
      )}
      {variant === "cafeteria" && <CafeteriaProps />}
      {variant === "restroom" && <RestroomProps />}
      {courseId && (
        <>
          {variant === "cafeteria" && (
            <>
              <Hotspot position={[-2, 1.2, -1]} label="Grab Snacks" color="#f97316" />
              <Hotspot position={[2.5, 1, 1.5]} label="Gaming Lounge" onClick={openGaming} color="#a78bfa" />
            </>
          )}
          {variant === "restroom" && (
            <Hotspot position={[0, 1.5, -2]} label="Wash Up" color="#38bdf8" />
          )}
          <Hotspot position={[0, 0.6, 3.5]} label="Back to Campus" onClick={backToCampus} />
        </>
      )}
      <OrbitControls
        target={[0, 1.5, 0]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={3}
        maxDistance={14}
        enablePan={false}
      />
    </>
  );
}

export function RoomScene({
  modelUrl,
  name,
  courseId,
  variant = "default",
}: RoomSceneProps) {
  const headerBg =
    variant === "cafeteria"
      ? "bg-gradient-to-r from-amber-950 to-orange-950"
      : variant === "restroom"
        ? "bg-gradient-to-r from-slate-900 to-sky-950"
        : "bg-[#2a2a2a]";

  return (
    <div className="flex h-full w-full flex-col bg-[#1a1a1a]">
      <div className={`z-10 flex items-center justify-between p-4 text-white ${headerBg}`}>
        <h1 className="text-xl font-bold tracking-tight">{name}</h1>
        <span className="hidden text-xs text-white/70 sm:inline">
          {variant === "cafeteria"
            ? "Student dining & social hub"
            : variant === "restroom"
              ? "Clean · bright · student-friendly"
              : ""}
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        <Canvas
          camera={{ position: [6, 4, 6], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          shadows
        >
          <Suspense fallback={<Loader label={name} />}>
            <RoomContent modelUrl={modelUrl} courseId={courseId} variant={variant} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

useGLTF.preload("/assets/3d/rooms/mensa.glb", true);
useGLTF.preload("/assets/3d/rooms/bathroom.glb", true);
