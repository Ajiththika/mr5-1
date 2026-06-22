"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Center,
  Environment,
  Html,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  MapPin,
  GraduationCap,
} from "lucide-react";

const SCHOOL_CAMPUS_GLB = "/assets/3d/school-campus.glb";
const MODEL_SCALE = 0.01;

export type CampusRoomId = "classroom" | "principal" | "mensa" | "bathroom";

export interface CampusAnchor {
  id: CampusRoomId;
  label: string;
  position: [number, number, number];
}

const ROOM_DEFINITIONS: Array<{
  id: CampusRoomId;
  label: string;
  meshNames: string[];
}> = [
  { id: "mensa", label: "Mensa", meshNames: ["mensa"] },
  { id: "principal", label: "Principal", meshNames: ["sala preside", "salapreside"] },
  { id: "bathroom", label: "Gallery", meshNames: ["bagno"] },
  { id: "classroom", label: "Classroom", meshNames: ["aula", "classroom", "classe"] },
];

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 p-5 bg-black/85 backdrop-blur-md rounded-2xl border border-sky-500/30 w-72">
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sky-100 text-xs font-mono">
          Loading campus model… {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

function findMeshCenter(root: THREE.Object3D, names: string[]): THREE.Vector3 | null {
  const wanted = names.map((n) => n.toLowerCase());
  let found: THREE.Object3D | null = null;

  root.traverse((child) => {
    if (found) return;
    const name = child.name.toLowerCase();
    if (wanted.some((w) => name.includes(w))) {
      found = child;
    }
  });

  if (!found) return null;
  return new THREE.Box3().setFromObject(found).getCenter(new THREE.Vector3());
}

function deriveAnchors(root: THREE.Object3D): CampusAnchor[] {
  const anchors: CampusAnchor[] = [];

  for (const room of ROOM_DEFINITIONS) {
    const center = findMeshCenter(root, room.meshNames);
    if (center) {
      anchors.push({
        id: room.id,
        label: room.label,
        position: [center.x, Math.max(center.y, 1.2), center.z],
      });
    }
  }

  if (!anchors.find((a) => a.id === "classroom")) {
    const campusBox = new THREE.Box3().setFromObject(root);
    const campusCenter = campusBox.getCenter(new THREE.Vector3());
    anchors.push({
      id: "classroom",
      label: "Classroom",
      position: [
        campusCenter.x,
        Math.max(campusCenter.y + campusBox.getSize(new THREE.Vector3()).y * 0.15, 2),
        campusCenter.z + campusBox.getSize(new THREE.Vector3()).z * 0.12,
      ],
    });
  }

  return anchors;
}

function CampusModel({
  onAnchorsReady,
}: {
  onAnchorsReady: (anchors: CampusAnchor[]) => void;
}) {
  const { scene } = useGLTF(SCHOOL_CAMPUS_GLB, true);
  const groupRef = useRef<THREE.Group>(null);
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    const anchors = deriveAnchors(groupRef.current);
    onAnchorsReady(anchors);
  }, [model, onAnchorsReady]);

  return (
    <Center>
      <group ref={groupRef} scale={MODEL_SCALE}>
        <primitive object={model} />
      </group>
    </Center>
  );
}

function CameraRig({ anchors }: { anchors: CampusAnchor[] }) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    camera.position.set(14, 10, 14);
    camera.lookAt(0, 2, 0);
    camera.updateProjectionMatrix();
  }, [camera, anchors]);

  return null;
}

function CampusHotspot({
  anchor,
  onSelect,
}: {
  anchor: CampusAnchor;
  onSelect: (id: CampusRoomId) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = anchor.position[1] + Math.sin(clock.elapsedTime * 2) * 0.08;
  });

  return (
    <group position={[anchor.position[0], anchor.position[1], anchor.position[2]]}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(anchor.id);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.55}
          transparent
          opacity={0.92}
        />
      </mesh>
      <Html position={[0, 1.1, 0]} center distanceFactor={12}>
        <button
          type="button"
          onClick={() => onSelect(anchor.id)}
          className="px-3 py-1.5 rounded-full bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg border border-white/20 whitespace-nowrap"
        >
          {anchor.label}
        </button>
      </Html>
    </group>
  );
}

function CampusSceneContent({
  isNight,
  courseId,
  onAnchorsReady,
  onRoomSelect,
  anchors,
}: {
  isNight: boolean;
  courseId?: string;
  onAnchorsReady: (anchors: CampusAnchor[]) => void;
  onRoomSelect: (id: CampusRoomId) => void;
  anchors: CampusAnchor[];
}) {
  return (
    <>
      <color attach="background" args={[isNight ? "#0b1226" : "#87ceeb"]} />
      <fog attach="fog" args={[isNight ? "#0b1226" : "#cfe8ff", 30, 120]} />
      <PerspectiveCamera makeDefault fov={48} near={0.1} far={500} />
      <CameraRig anchors={anchors} />
      <Environment preset={isNight ? "night" : "city"} environmentIntensity={isNight ? 0.35 : 0.55} />
      <ambientLight intensity={isNight ? 0.35 : 0.65} color={isNight ? "#c7d2fe" : "#fff8f0"} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={isNight ? 0.45 : 1.1}
        color={isNight ? "#a5b4fc" : "#fff4e6"}
      />
      <hemisphereLight
        args={[isNight ? "#1e293b" : "#dbeafe", isNight ? "#020617" : "#4a7c59", 0.45]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={isNight ? "#0f172a" : "#3d6b4f"} roughness={0.95} />
      </mesh>
      <CampusModel onAnchorsReady={onAnchorsReady} />
      {courseId &&
        anchors.map((anchor) => (
          <CampusHotspot key={anchor.id} anchor={anchor} onSelect={onRoomSelect} />
        ))}
      <OrbitControls
        target={[0, 2, 0]}
        enablePan
        minDistance={4}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

export interface SchoolCampusSceneProps {
  courseId?: string;
  variant?: "preview" | "immersive";
  className?: string;
  onBack?: () => void;
}

export function SchoolCampusScene({
  courseId,
  variant = "preview",
  className = "",
  onBack,
}: SchoolCampusSceneProps) {
  const router = useRouter();
  const [isNight, setIsNight] = useState(false);
  const [anchors, setAnchors] = useState<CampusAnchor[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour < 6 || hour > 18);
  }, []);

  const handleAnchorsReady = useCallback((next: CampusAnchor[]) => {
    setAnchors(next);
  }, []);

  const handleRoomSelect = useCallback(
    (roomId: CampusRoomId) => {
      if (!courseId) return;
      router.push(`/course/${courseId}/room/${roomId}`);
    },
    [courseId, router]
  );

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const heightClass =
    variant === "immersive" ? "h-screen min-h-[600px]" : "h-full min-h-[300px]";

  return (
    <div
      ref={containerRef}
      className={`preview-3d-root relative w-full ${heightClass} overflow-hidden rounded-3xl border border-white/10 bg-[#020617] shadow-2xl ${className}`}
    >
      {variant === "immersive" && onBack && (
        <div className="absolute top-4 left-4 z-20">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-black/40 text-white border-white/20 hover:bg-black/60"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
          </Button>
        </div>
      )}

      <Canvas
        className="preview-3d-canvas-host !absolute inset-0 h-full w-full"
        dpr={[1, variant === "immersive" ? 1.75 : 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        shadows={false}
        style={{ touchAction: "none" }}
      >
        <Suspense fallback={<Loader />}>
          <CampusSceneContent
            isNight={isNight}
            courseId={courseId}
            anchors={anchors}
            onAnchorsReady={handleAnchorsReady}
            onRoomSelect={handleRoomSelect}
          />
        </Suspense>
      </Canvas>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 preview-3d-ui preview-3d-ui--interactive">
        <button
          type="button"
          onClick={() => setIsNight((v) => !v)}
          className="bg-black/55 backdrop-blur px-3 py-2 rounded-full text-white text-xs font-semibold border border-white/15 flex items-center gap-2"
        >
          {isNight ? <Moon className="h-3.5 w-3.5 text-blue-300" /> : <Sun className="h-3.5 w-3.5 text-amber-300" />}
          {isNight ? "Night" : "Day"}
        </button>
        {variant === "immersive" && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="bg-black/55 backdrop-blur p-2 rounded-full text-white border border-white/15"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="preview-3d-ui preview-3d-ui--interactive absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-md">
          <div className="mb-0.5 flex items-center gap-2 font-semibold text-sky-200">
            <GraduationCap className="h-3.5 w-3.5" />
            MR5 Virtual Campus
          </div>
          <p className="text-[11px] text-white/75">
            {courseId
              ? "Tap a room below to enter."
              : "Enroll to explore the campus."}
          </p>
        </div>

        {courseId && anchors.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {anchors.map((anchor) => (
              <button
                key={anchor.id}
                type="button"
                onClick={() => handleRoomSelect(anchor.id)}
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md transition-colors hover:border-sky-400/40 hover:bg-sky-600/70"
              >
                <MapPin className="h-3 w-3 text-sky-300" />
                {anchor.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** @deprecated Use SchoolCampusScene — kept for existing imports */
export function SchoolScene(props: Omit<SchoolCampusSceneProps, "variant">) {
  return <SchoolCampusScene {...props} />;
}

useGLTF.preload(SCHOOL_CAMPUS_GLB, true);
