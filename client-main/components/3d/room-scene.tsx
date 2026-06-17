"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  useGLTF,
  useProgress,
  Center,
} from "@react-three/drei";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="bg-black/80 text-white px-3 py-2 rounded text-sm">
        Loading room: {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene.clone()} scale={0.8} />
    </Center>
  );
}

function TeacherNPC() {
  return (
    <group position={[0, 0, -2]}>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#f5d0a0" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 8, 16]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      <Html position={[0, 2.2, 0]} center>
        <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          AI Teacher
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
      <mesh onClick={onClick} onPointerOver={() => document.body.style.cursor = "pointer"} onPointerOut={() => document.body.style.cursor = "auto"}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      <Html position={[0, 0.4, 0]} center>
        <button
          type="button"
          onClick={onClick}
          className="bg-primary text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-primary/90"
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
  showTeacher?: boolean;
  showHotspots?: boolean;
}

function RoomContent({
  modelUrl,
  courseId,
  showTeacher,
  showHotspots,
}: Pick<RoomSceneProps, "modelUrl" | "courseId" | "showTeacher" | "showHotspots">) {
  const isGlb = modelUrl.endsWith(".glb") || modelUrl.endsWith(".gltf");

  const startLesson = () => {
    if (courseId && typeof window !== "undefined") {
      window.location.href = `/course/${courseId}/lesson/start`;
    }
  };

  return (
    <>
      <Environment preset="apartment" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      {isGlb ? (
        <GLBModel url={modelUrl} />
      ) : (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8, 4, 8]} />
          <meshStandardMaterial color="#334155" wireframe />
        </mesh>
      )}
      {showTeacher && <TeacherNPC />}
      {showHotspots && courseId && (
        <>
          <Hotspot position={[-1.5, 1.5, -1]} label="Board" onClick={startLesson} />
          <Hotspot position={[1.5, 0.8, 0]} label="Start Lesson" onClick={startLesson} />
          <Hotspot position={[0, 0.5, 2]} label="Exit" onClick={() => window.history.back()} />
        </>
      )}
      <OrbitControls maxPolarAngle={Math.PI / 2} minDistance={3} maxDistance={15} />
    </>
  );
}

export function RoomScene({
  modelUrl,
  name,
  courseId,
  showTeacher = false,
  showHotspots = false,
}: RoomSceneProps) {
  return (
    <div className="w-full h-screen bg-[#1a1a1a] flex flex-col">
      <div className="p-4 bg-[#2a2a2a] text-white flex justify-between items-center z-10">
        <h1 className="text-xl font-bold">{name}</h1>
      </div>
      <div className="flex-1 relative">
        <Canvas camera={{ position: [6, 4, 6], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <RoomContent
              modelUrl={modelUrl}
              courseId={courseId}
              showTeacher={showTeacher}
              showHotspots={showHotspots}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

useGLTF.preload("/assets/3d/rooms/classroom.glb");
