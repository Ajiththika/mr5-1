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
  Environment,
  Html,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
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
  Menu,
  X,
} from "lucide-react";
import { get3DPerformanceProfile } from "@/lib/3d/performance-profile";
import { ModelCreditNotice } from "@/components/3d/ModelCreditNotice";
import { CAMPUS_ROOMS, type CampusRoomId } from "@/lib/campus-rooms";

const SCHOOL_CAMPUS_GLB = "/assets/3d/school-campus.glb";
const CAMPUS_TARGET_SIZE = 22;

export type { CampusRoomId };

export interface CampusAnchor {
  id: CampusRoomId;
  label: string;
  position: [number, number, number];
}

export interface CampusLayout {
  anchors: CampusAnchor[];
  radius: number;
  focusY: number;
}

const ROOM_MESH_LOOKUP: Record<Exclude<CampusRoomId, "classroom">, string[]> = {
  mensa: ["mensa"],
  principal: ["sala preside", "salapreside"],
  bathroom: ["bagno"],
};

function labelForRoom(id: CampusRoomId): string {
  return CAMPUS_ROOMS.find((room) => room.id === id)?.label ?? id;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex w-72 flex-col items-center gap-3 rounded-2xl border border-sky-500/30 bg-black/85 p-5 backdrop-blur-md">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-mono text-xs text-sky-100">
          Loading campus… {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

function tuneCampusMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = false;
    child.receiveShadow = true;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (!mat) continue;
      mat.side = THREE.DoubleSide;
      if (mat instanceof THREE.MeshStandardMaterial) {
        if (mat.color.getHex() < 0x111111) mat.color.setHex(0x64748b);
        mat.roughness = Math.min(1, mat.roughness + 0.05);
        mat.envMapIntensity = 0.65;
      }
    }
  });
}

function centerAndScaleModel(root: THREE.Object3D, targetSize: number) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / maxDim;
  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  root.updateMatrixWorld(true);
  const fitted = new THREE.Box3().setFromObject(root);
  const fittedSize = fitted.getSize(new THREE.Vector3());
  const radius = Math.max(fittedSize.x, fittedSize.z) * 0.5;
  const focusY = fitted.min.y + fittedSize.y * 0.35;
  return { radius, focusY };
}

function findMeshWorldCenter(root: THREE.Object3D, names: string[]): THREE.Vector3 | null {
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
  const box = new THREE.Box3().setFromObject(found);
  return box.getCenter(new THREE.Vector3());
}

function deriveAnchors(root: THREE.Object3D, focusY: number): CampusAnchor[] {
  const anchors: CampusAnchor[] = [];
  const usedIds = new Set<CampusRoomId>();

  for (const room of CAMPUS_ROOMS) {
    if (room.id === "classroom") continue;
    const center = findMeshWorldCenter(root, ROOM_MESH_LOOKUP[room.id]);
    if (center) {
      anchors.push({
        id: room.id,
        label: room.label,
        position: [center.x, Math.max(center.y, focusY + 0.5), center.z],
      });
      usedIds.add(room.id);
    }
  }

  const campusBox = new THREE.Box3().setFromObject(root);
  const campusSize = campusBox.getSize(new THREE.Vector3());
  const campusCenter = campusBox.getCenter(new THREE.Vector3());

  if (!usedIds.has("classroom")) {
    anchors.push({
      id: "classroom",
      label: labelForRoom("classroom"),
      position: [
        campusCenter.x,
        Math.max(campusBox.min.y + campusSize.y * 0.2, focusY + 1),
        campusCenter.z + campusSize.z * 0.08,
      ],
    });
  }

  return anchors;
}

function CampusModel({
  onLayoutReady,
}: {
  onLayoutReady: (layout: CampusLayout) => void;
}) {
  const { scene } = useGLTF(SCHOOL_CAMPUS_GLB, true);
  const groupRef = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    tuneCampusMaterials(clone);
    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    const { radius, focusY } = centerAndScaleModel(groupRef.current, CAMPUS_TARGET_SIZE);
    const anchors = deriveAnchors(groupRef.current, focusY);
    onLayoutReady({ anchors, radius, focusY });
  }, [model, onLayoutReady]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function CampusCamera({
  layout,
  controlsRef,
}: {
  layout: CampusLayout | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    if (!layout) return;
    const { radius, focusY } = layout;
    const dist = radius * 2.4;
    camera.position.set(dist * 0.75, focusY + radius * 0.85, dist * 0.75);
    camera.near = 0.1;
    camera.far = Math.max(500, dist * 8);
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(0, focusY, 0);
      controlsRef.current.minDistance = radius * 0.65;
      controlsRef.current.maxDistance = radius * 4.5;
      controlsRef.current.update();
    }
  }, [camera, layout, controlsRef]);

  return null;
}

function CampusHotspot({
  anchor,
  markerSize,
  onSelect,
}: {
  anchor: CampusAnchor;
  markerSize: number;
  onSelect: (id: CampusRoomId) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 2) * (markerSize * 0.15);
  });

  return (
    <group position={anchor.position}>
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
        <sphereGeometry args={[markerSize, 16, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.6}
          transparent
          opacity={0.95}
        />
      </mesh>
      <Html position={[0, markerSize * 3.2, 0]} center distanceFactor={14}>
        <button
          type="button"
          onClick={() => onSelect(anchor.id)}
          className="whitespace-nowrap rounded-full border border-white/20 bg-sky-600/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-sky-500"
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
  layout,
  controlsRef,
  onLayoutReady,
  onRoomSelect,
}: {
  isNight: boolean;
  courseId?: string;
  layout: CampusLayout | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onLayoutReady: (layout: CampusLayout) => void;
  onRoomSelect: (id: CampusRoomId) => void;
}) {
  const groundSize = layout ? layout.radius * 5 : 80;
  const markerSize = layout ? layout.radius * 0.055 : 0.35;
  const focusY = layout?.focusY ?? 2;

  return (
    <>
      <color attach="background" args={[isNight ? "#0b1226" : "#87ceeb"]} />
      <fog
        attach="fog"
        args={[isNight ? "#0b1226" : "#cfe8ff", layout ? layout.radius * 2 : 25, layout ? layout.radius * 10 : 120]}
      />
      <CampusCamera layout={layout} controlsRef={controlsRef} />
      <Environment preset={isNight ? "night" : "city"} environmentIntensity={isNight ? 0.45 : 0.7} />
      <ambientLight intensity={isNight ? 0.5 : 0.75} color={isNight ? "#c7d2fe" : "#fff8f0"} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={isNight ? 0.55 : 1.15}
        color={isNight ? "#a5b4fc" : "#fff4e6"}
      />
      <hemisphereLight
        args={[isNight ? "#1e293b" : "#dbeafe", isNight ? "#020617" : "#4a7c59", 0.5]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color={isNight ? "#0f172a" : "#3d6b4f"} roughness={0.95} />
      </mesh>
      <CampusModel onLayoutReady={onLayoutReady} />
      {courseId &&
        layout?.anchors.map((anchor) => (
          <CampusHotspot
            key={anchor.id}
            anchor={anchor}
            markerSize={markerSize}
            onSelect={onRoomSelect}
          />
        ))}
      <OrbitControls
        ref={controlsRef}
        target={[0, focusY, 0]}
        enablePan
        enableDamping
        dampingFactor={0.06}
        minDistance={layout?.radius ? layout.radius * 0.65 : 4}
        maxDistance={layout?.radius ? layout.radius * 4.5 : 60}
        maxPolarAngle={Math.PI / 2.08}
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
  const [layout, setLayout] = useState<CampusLayout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const perf3d = useMemo(() => get3DPerformanceProfile(), []);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour < 6 || hour > 18);
  }, []);

  const handleLayoutReady = useCallback((next: CampusLayout) => {
    setLayout(next);
  }, []);

  const handleRoomSelect = useCallback(
    (roomId: CampusRoomId) => {
      if (!courseId) return;
      router.push(`/course/${courseId}/room/${roomId}`);
    },
    [courseId, router],
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
    variant === "immersive" ? "h-screen min-h-[600px]" : "h-full min-h-[280px]";

  const rootClass =
    variant === "preview"
      ? `relative w-full min-w-0 ${heightClass} overflow-hidden ${className}`
      : `preview-3d-root relative w-full min-w-0 ${heightClass} overflow-hidden rounded-3xl border border-white/10 bg-[#020617] shadow-2xl ${className}`;

  return (
    <div ref={containerRef} className={rootClass}>
      {variant === "immersive" && onBack && (
        <div className="absolute left-4 top-4 z-20">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-white/20 bg-black/40 text-white hover:bg-black/60"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
          </Button>
        </div>
      )}

      <Canvas
        className="preview-3d-canvas-host !absolute inset-0 h-full w-full"
        dpr={perf3d.dpr}
        gl={{ antialias: perf3d.antialias, powerPreference: "high-performance" }}
        shadows={false}
        camera={{ fov: 45, near: 0.1, far: 500, position: [20, 14, 20] }}
        style={{ touchAction: "none" }}
      >
        <Suspense fallback={<Loader />}>
          <CampusSceneContent
            isNight={isNight}
            courseId={courseId}
            layout={layout}
            controlsRef={controlsRef}
            onLayoutReady={handleLayoutReady}
            onRoomSelect={handleRoomSelect}
          />
        </Suspense>
      </Canvas>

      <div className="preview-3d-ui preview-3d-ui--interactive absolute right-2 top-2 z-20 flex items-center gap-1.5 sm:right-4 sm:top-4 sm:gap-2">
        {courseId && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-2 text-xs font-semibold text-white backdrop-blur md:hidden"
          >
            <Menu className="h-3.5 w-3.5" />
            Rooms
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsNight((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-2 text-xs font-semibold text-white backdrop-blur sm:gap-2 sm:px-3"
          aria-label={isNight ? "Switch to day" : "Switch to night"}
        >
          {isNight ? (
            <Moon className="h-3.5 w-3.5 text-blue-300" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-300" />
          )}
          <span className="hidden sm:inline">{isNight ? "Night" : "Day"}</span>
        </button>
        {variant === "immersive" && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full border border-white/15 bg-black/55 p-2 text-white backdrop-blur"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="preview-3d-ui preview-3d-ui--interactive absolute bottom-2 left-2 right-2 z-20 sm:bottom-3 sm:left-3 sm:right-3">
        <div className="hidden sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-2">
          <div className="space-y-2">
            <div className="rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-md">
              <div className="mb-0.5 flex items-center gap-2 font-semibold text-sky-200">
                <GraduationCap className="h-3.5 w-3.5" />
                MR5 Virtual Campus
              </div>
              <p className="text-[11px] text-white/75">
                {courseId
                  ? "Click a glowing marker or room chip to enter."
                  : "Enroll to explore the campus."}
              </p>
              <p className="mt-1 text-[10px] text-white/50">
                Drag to orbit · scroll to zoom · pinch on mobile
              </p>
            </div>
            {variant !== "preview" && (
              <ModelCreditNotice variant="scene" className="max-w-sm" />
            )}
          </div>

          {courseId && layout && layout.anchors.length > 0 && (
            <div className="flex max-w-[min(100%,360px)] flex-wrap justify-end gap-1.5">
              {layout.anchors.map((anchor) => (
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

        <p className="rounded-lg border border-white/10 bg-black/55 px-2.5 py-1.5 text-center text-[10px] text-white/70 backdrop-blur sm:hidden">
          {courseId ? "Tap Menu for rooms · drag to orbit" : "Enroll to explore campus"}
        </p>
      </div>

      {mobileMenuOpen && courseId && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            aria-label="Close rooms menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-white/10 bg-slate-950 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Campus Rooms</p>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-white/10 p-2 text-slate-300"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {CAMPUS_ROOMS.map((room) => {
                const Icon = room.icon;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRoomSelect(room.id);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white hover:bg-sky-600/30"
                  >
                    <Icon className="h-4 w-4 text-sky-300" />
                    {room.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** @deprecated Use SchoolCampusScene */
export function SchoolScene(props: Omit<SchoolCampusSceneProps, "variant">) {
  return <SchoolCampusScene {...props} />;
}

useGLTF.preload(SCHOOL_CAMPUS_GLB, true);
