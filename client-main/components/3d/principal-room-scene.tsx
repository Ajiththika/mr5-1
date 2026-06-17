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

const PRINCIPAL_ROOM_GLB = "/assets/3d/rooms/principal.glb";

/** Material palette mapped to Blender mesh names (Ff-01.blend). */
const OFFICE_MATERIALS: Record<string, THREE.MeshStandardMaterialParameters> = {
  Cube: { color: "#e8e2d6", roughness: 0.92, metalness: 0 },
  "Cube.001": { color: "#e8e2d6", roughness: 0.92, metalness: 0 },
  "Cube.002": { color: "#4a3728", roughness: 0.78, metalness: 0.05 },
  "Cube.003": { color: "#6b4423", roughness: 0.72, metalness: 0.08 },
  "Cube.004": { color: "#2f3f52", roughness: 0.85, metalness: 0.02 },
  "Cube.005": { color: "#4a3728", roughness: 0.78, metalness: 0.05 },
  "Cube.006": { color: "#5c3d2e", roughness: 0.7, metalness: 0.1 },
  "Cube.007": { color: "#2f3f52", roughness: 0.85, metalness: 0.02 },
};

const DEFAULT_MATERIAL: THREE.MeshStandardMaterialParameters = {
  color: "#c9b896",
  roughness: 0.8,
  metalness: 0,
};

function applyOfficeMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const params = OFFICE_MATERIALS[child.name] ?? DEFAULT_MATERIAL;
    const mat = new THREE.MeshStandardMaterial(params);
    child.material = mat;
    child.castShadow = false;
    child.receiveShadow = false;
  });
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="bg-black/80 text-white px-3 py-2 rounded text-sm">
        Loading principal office: {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function PrincipalRoomModel() {
  const { scene } = useGLTF(PRINCIPAL_ROOM_GLB, true);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    applyOfficeMaterials(clone);
    return clone;
  }, [scene]);

  return (
    <Center>
      <primitive object={model} scale={0.55} rotation={[0, Math.PI, 0]} />
    </Center>
  );
}

function PrincipalNPC() {
  return (
    <group position={[-1.6, 0.2, -1.2]} rotation={[0, Math.PI / 6, 0]}>
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f0d5b8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.2, 0.55, 8, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.85} />
      </mesh>
      <Html position={[0, 1.75, 0]} center>
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Principal
        </div>
      </Html>
    </group>
  );
}

interface HotspotProps {
  position: [number, number, number];
  label: string;
  onClick?: () => void;
}

function Hotspot({ position, label, onClick }: HotspotProps) {
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
        <meshStandardMaterial
          color="#c9a227"
          emissive="#c9a227"
          emissiveIntensity={0.35}
        />
      </mesh>
      <Html position={[0, 0.35, 0]} center>
        <button
          type="button"
          onClick={onClick}
          className="bg-amber-700 text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-amber-600"
        >
          {label}
        </button>
      </Html>
    </group>
  );
}

interface PrincipalRoomContentProps {
  courseId?: string;
  onExit?: () => void;
}

function PrincipalRoomContent({ courseId, onExit }: PrincipalRoomContentProps) {
  const openRecords = () => {
    if (courseId && typeof window !== "undefined") {
      window.location.href = `/course/${courseId}`;
    }
  };

  return (
    <>
      <color attach="background" args={["#1c1917"]} />
      <fog attach="fog" args={["#1c1917", 12, 28]} />
      <Environment preset="apartment" environmentIntensity={0.45} />
      <ambientLight intensity={0.55} color="#fff8f0" />
      <directionalLight
        position={[4, 8, 2]}
        intensity={0.85}
        color="#fff4e6"
      />
      <directionalLight
        position={[-3, 5, -4]}
        intensity={0.35}
        color="#c4d4ff"
      />
      <hemisphereLight
        args={["#fff8f0", "#3d3428", 0.35]}
        position={[0, 6, 0]}
      />
      <PrincipalRoomModel />
      <PrincipalNPC />
      {courseId && (
        <>
          <Hotspot position={[-1.8, 0.9, -0.8]} label="Principal Desk" />
          <Hotspot
            position={[-3.2, 1.4, -2.2]}
            label="School Records"
            onClick={openRecords}
          />
          <Hotspot
            position={[0.5, 0.6, 2.2]}
            label="Exit"
            onClick={onExit}
          />
        </>
      )}
      <OrbitControls
        target={[0, 1.8, -0.5]}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={2.5}
        maxDistance={12}
        enablePan={false}
      />
    </>
  );
}

export interface PrincipalRoomSceneProps {
  courseId?: string;
  onExit?: () => void;
}

export function PrincipalRoomScene({ courseId, onExit }: PrincipalRoomSceneProps) {
  return (
    <div className="w-full h-full bg-[#1c1917] flex flex-col">
      <div className="p-4 bg-[#292524] text-white flex justify-between items-center z-10 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">Principal&apos;s Office</h1>
        <span className="text-xs text-white/60 hidden sm:inline">
          School administration
        </span>
      </div>
      <div className="flex-1 relative min-h-0">
        <Canvas
          camera={{ position: [5.5, 3.8, 5.2], fov: 48, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={<Loader />}>
            <PrincipalRoomContent courseId={courseId} onExit={onExit} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

useGLTF.preload(PRINCIPAL_ROOM_GLB, true);
