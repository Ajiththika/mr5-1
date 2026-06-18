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
  ContactShadows,
  Environment,
  Html,
  Image,
  Text,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import {
  ArrowLeft,
  BookOpen,
  DoorOpen,
  Eye,
  GraduationCap,
  Presentation,
  UserRound,
} from "lucide-react";
import * as THREE from "three";

const CLASSROOM_GLB = "/assets/3d/rooms/classroom.glb";
const LOGO_URL = "/images/mr5-logo.png";

const LOOK_SENSITIVITY = 0.0021;
const CAMERA_BLEND_SPEED = 5.5;
const MIN_EYE_HEIGHT = 1.05;

export type CameraMode = "student" | "teacher";

export interface ClassroomAnchor {
  id: "board" | "teacher" | "lesson" | "exit";
  label: string;
  position: [number, number, number];
}

interface CameraPreset {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  pitchMin: number;
  pitchMax: number;
  yawRange: number;
  fov: number;
}

interface ClassroomViewState {
  seat: THREE.Vector3;
  board: THREE.Vector3;
  boardBox: THREE.Box3;
  floorY: number;
  classDirection: THREE.Vector3;
  teacherStand: THREE.Vector3;
  teacherLookAt: THREE.Vector3;
  logoPosition: THREE.Vector3;
  logoLookAt: THREE.Vector3;
  studentPreset: CameraPreset;
  teacherPreset: CameraPreset;
  anchors: ClassroomAnchor[];
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex w-72 flex-col items-center gap-3 rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-5 backdrop-blur-md">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-mono text-xs text-indigo-100">
          Loading classroom… {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function meshCenters(root: THREE.Object3D, matchers: string[]): THREE.Vector3[] {
  const wanted = matchers.map(normalizeName);
  const centers: THREE.Vector3[] = [];

  root.traverse((child) => {
    const key = normalizeName(child.name);
    if (!wanted.some((w) => key.includes(w))) return;
    if (!(child instanceof THREE.Mesh) && child.type !== "Mesh") return;
    const box = new THREE.Box3().setFromObject(child);
    if (!Number.isFinite(box.min.x)) return;
    centers.push(box.getCenter(new THREE.Vector3()));
  });

  return centers;
}

function getMeshBounds(root: THREE.Object3D, matchers: string[]): THREE.Box3 | null {
  const wanted = matchers.map(normalizeName);
  const box = new THREE.Box3();
  let found = false;

  root.traverse((child) => {
    const key = normalizeName(child.name);
    if (!wanted.some((w) => key.includes(w))) return;
    if (!(child instanceof THREE.Mesh)) return;
    const meshBox = new THREE.Box3().setFromObject(child);
    if (!found) {
      box.copy(meshBox);
      found = true;
    } else {
      box.union(meshBox);
    }
  });

  return found ? box : null;
}

function averageCenter(points: THREE.Vector3[]): THREE.Vector3 | null {
  if (!points.length) return null;
  const sum = points.reduce((acc, p) => acc.add(p), new THREE.Vector3());
  return sum.multiplyScalar(1 / points.length);
}

function pickStudentSeat(
  chairCenters: THREE.Vector3[],
  board: THREE.Vector3,
): THREE.Vector3 {
  if (!chairCenters.length) {
    const fallback = board.clone();
    fallback.y = 0.35;
    fallback.z += board.z >= 0 ? -3.2 : 3.2;
    return fallback;
  }

  const ranked = chairCenters
    .map((chair) => ({ chair, distance: chair.distanceTo(board) }))
    .sort((a, b) => b.distance - a.distance);
  const backRow = ranked
    .filter((entry) => entry.distance >= ranked[0].distance - 0.45)
    .map((entry) => entry.chair);
  const pool = backRow.length ? backRow : chairCenters;

  return pool.reduce((best, point) =>
    Math.abs(point.x) < Math.abs(best.x) ? point : best,
  );
}

function centerModelAtOrigin(root: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);
}

function clonePreset(
  position: THREE.Vector3,
  lookAt: THREE.Vector3,
  pitchMin: number,
  pitchMax: number,
  yawRange: number,
  fov: number,
): CameraPreset {
  return {
    position: position.clone(),
    lookAt: lookAt.clone(),
    pitchMin,
    pitchMax,
    yawRange,
    fov,
  };
}

function deriveClassroomViewState(root: THREE.Object3D): ClassroomViewState {
  root.updateWorldMatrix(true, true);

  const roomBox = new THREE.Box3().setFromObject(root);
  const floorY = roomBox.min.y + 0.02;

  const boardBounds =
    getMeshBounds(root, ["board"]) ??
    new THREE.Box3(
      new THREE.Vector3(-1.8, 1.2, -3.9),
      new THREE.Vector3(1.8, 2.4, -3.4),
    );
  const boardCenter = boardBounds.getCenter(new THREE.Vector3());
  const board = new THREE.Vector3(
    boardCenter.x,
    Math.max(boardCenter.y, 1.75),
    boardCenter.z,
  );

  const chairCenter = pickStudentSeat(meshCenters(root, ["chair"]), board);
  const seat = new THREE.Vector3(
    chairCenter.x,
    chairCenter.y + 0.35,
    chairCenter.z,
  );

  const classDirection = seat.clone().sub(board);
  classDirection.y = 0;
  if (classDirection.lengthSq() < 0.01) {
    classDirection.set(0, 0, 1);
  }
  classDirection.normalize();

  const wallNormal = classDirection.clone().multiplyScalar(-1);
  const boardSide = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), classDirection)
    .normalize();

  const teacherStand = board
    .clone()
    .add(boardSide.clone().multiplyScalar(1.85))
    .add(classDirection.clone().multiplyScalar(0.95));
  teacherStand.y = floorY;

  const teacherLookAt = teacherStand
    .clone()
    .add(classDirection.clone().multiplyScalar(2.5));

  const logoPosition = boardCenter
    .clone()
    .add(wallNormal.clone().multiplyScalar(0.07));
  logoPosition.y = boardBounds.max.y + 0.34;
  const logoLookAt = logoPosition
    .clone()
    .add(classDirection.clone().multiplyScalar(2));

  const studentEye = new THREE.Vector3(
    seat.x,
    floorY + 1.32,
    seat.z,
  );
  const studentLook = board.clone();
  studentLook.y -= 0.22;

  const classFocus = seat.clone();
  classFocus.y = floorY + 1.05;

  const teacherEye = teacherStand
    .clone()
    .add(new THREE.Vector3(0, 1.62, 0))
    .add(classDirection.clone().multiplyScalar(0.18));
  const teacherLook = classFocus;

  const studentPreset = clonePreset(
    studentEye,
    studentLook,
    -0.2,
    0.16,
    0.52,
    50,
  );
  const teacherPreset = clonePreset(
    teacherEye,
    teacherLook,
    -0.14,
    0.1,
    0.38,
    46,
  );

  const doorCenter = averageCenter(meshCenters(root, ["door"]));
  const lessonCenter = averageCenter(meshCenters(root, ["desk", "chair"]));

  const anchors: ClassroomAnchor[] = [
    {
      id: "board",
      label: "Whiteboard",
      position: [board.x, board.y, board.z],
    },
    {
      id: "teacher",
      label: "AI Teacher",
      position: [
        teacherStand.x,
        teacherStand.y + 1.55,
        teacherStand.z,
      ],
    },
    {
      id: "lesson",
      label: "Start Lesson",
      position: lessonCenter
        ? [lessonCenter.x, Math.max(lessonCenter.y, 1.0), lessonCenter.z]
        : [seat.x, seat.y, seat.z - 0.6],
    },
    {
      id: "exit",
      label: "Exit",
      position: doorCenter
        ? [doorCenter.x, Math.max(doorCenter.y, 1.3), doorCenter.z]
        : [3.2, 1.3, 4.2],
    },
  ];

  return {
    seat,
    board,
    boardBox: boardBounds,
    floorY,
    classDirection,
    teacherStand,
    teacherLookAt,
    logoPosition,
    logoLookAt,
    studentPreset,
    teacherPreset,
    anchors,
  };
}

function tuneMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const key = normalizeName(child.name);
    const isFloor = key.includes("floor") || key.includes("ground");
    const isDesk =
      key.includes("desk") ||
      key.includes("chair") ||
      key.includes("table") ||
      key.includes("teacherdesk");
    const isWall =
      key.includes("wall") ||
      key.includes("ceiling") ||
      key.includes("beam");
    const isBoard = key.includes("board");

    child.castShadow = isDesk || isBoard;
    child.receiveShadow = isFloor || isDesk || isWall || isBoard;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const mat of materials) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;

      mat.envMapIntensity = isFloor ? 0.95 : 0.72;

      if (isFloor) {
        mat.roughness = THREE.MathUtils.clamp(mat.roughness * 0.85, 0.48, 0.72);
        mat.metalness = THREE.MathUtils.clamp(mat.metalness + 0.06, 0, 0.14);
      } else if (isDesk) {
        mat.roughness = THREE.MathUtils.clamp(mat.roughness * 0.78, 0.38, 0.62);
        mat.metalness = THREE.MathUtils.clamp(mat.metalness + 0.1, 0, 0.18);
      } else if (isWall) {
        mat.roughness = THREE.MathUtils.clamp(mat.roughness, 0.82, 0.96);
        mat.metalness = 0.02;
      }
    }
  });
}

function SceneRendererSetup() {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);

  return null;
}

function ClassroomCameraRig({
  viewState,
  mode,
}: {
  viewState: ClassroomViewState;
  mode: CameraMode;
}) {
  const { camera, gl } = useThree();
  const preset =
    mode === "student" ? viewState.studentPreset : viewState.teacherPreset;

  const currentPos = useRef(preset.position.clone());
  const currentLook = useRef(preset.lookAt.clone());
  const targetPos = useRef(preset.position.clone());
  const targetLook = useRef(preset.lookAt.clone());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const baseYaw = useRef(0);
  const looking = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const transitioning = useRef(true);
  const transitionTimer = useRef(0);

  const applyPresetBase = useCallback(
    (nextPreset: CameraPreset) => {
      targetPos.current.copy(nextPreset.position);
      targetLook.current.copy(nextPreset.lookAt);
      transitioning.current = true;
      transitionTimer.current = 0;

      const forward = nextPreset.lookAt
        .clone()
        .sub(nextPreset.position)
        .normalize();
      euler.current.setFromQuaternion(
        new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, -1),
          forward,
        ),
        "YXZ",
      );
      baseYaw.current = euler.current.y;
    },
    [],
  );

  useLayoutEffect(() => {
    applyPresetBase(preset);
    camera.near = 0.1;
    camera.far = 42;
    camera.fov = preset.fov;
    camera.updateProjectionMatrix();
  }, [applyPresetBase, camera, mode, preset]);

  const applyLook = useCallback(() => {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(euler.current);
    const lookAt = currentPos.current
      .clone()
      .add(direction.multiplyScalar(8));
    currentLook.current.copy(lookAt);
  }, []);

  useFrame((_, delta) => {
    if (transitioning.current) {
      transitionTimer.current += delta;
      const blend = 1 - Math.exp(-CAMERA_BLEND_SPEED * delta);
      currentPos.current.lerp(targetPos.current, blend);
      currentLook.current.lerp(targetLook.current, blend);

      if (transitionTimer.current > 0.55) {
        transitioning.current = false;
        currentPos.current.copy(targetPos.current);
        currentLook.current.copy(targetLook.current);
        applyLook();
      }
    }

    currentPos.current.y = Math.max(
      currentPos.current.y,
      viewState.floorY + MIN_EYE_HEIGHT,
    );

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
    camera.fov = THREE.MathUtils.lerp(camera.fov, preset.fov, 1 - Math.exp(-6 * delta));
    camera.updateProjectionMatrix();
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || transitioning.current) return;
      looking.current = true;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!looking.current || transitioning.current) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };

      euler.current.y -= dx * LOOK_SENSITIVITY;
      euler.current.x -= dy * LOOK_SENSITIVITY;
      euler.current.x = THREE.MathUtils.clamp(
        euler.current.x,
        preset.pitchMin,
        preset.pitchMax,
      );
      euler.current.y = THREE.MathUtils.clamp(
        euler.current.y,
        baseYaw.current - preset.yawRange,
        baseYaw.current + preset.yawRange,
      );
      applyLook();
    };

    const endLook = (event: PointerEvent) => {
      looking.current = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endLook);
    canvas.addEventListener("pointerleave", endLook);
    canvas.addEventListener("pointercancel", endLook);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endLook);
      canvas.removeEventListener("pointerleave", endLook);
      canvas.removeEventListener("pointercancel", endLook);
    };
  }, [applyLook, gl, preset]);

  return null;
}

function ClassroomModel({
  onViewStateReady,
}: {
  onViewStateReady: (state: ClassroomViewState) => void;
}) {
  const { scene } = useGLTF(CLASSROOM_GLB, true);
  const groupRef = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    tuneMaterials(clone);
    centerModelAtOrigin(clone);
    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    onViewStateReady(deriveClassroomViewState(groupRef.current));
  }, [model, onViewStateReady]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function WallBranding({
  position,
  lookAt,
}: {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(position);
    groupRef.current.lookAt(lookAt);
  }, [lookAt, position]);

  return (
    <group ref={groupRef}>
      <mesh receiveShadow castShadow position={[0, 0, -0.01]}>
        <boxGeometry args={[1.85, 0.48, 0.035]} />
        <meshStandardMaterial
          color="#0b1224"
          roughness={0.42}
          metalness={0.22}
          envMapIntensity={0.85}
        />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[1.5, 0.38]} />
        <meshStandardMaterial
          color="#111827"
          roughness={0.88}
          metalness={0.04}
          transparent
          opacity={0.35}
        />
      </mesh>
      <Image
        url={LOGO_URL}
        position={[-0.56, 0.01, 0.03]}
        scale={[0.38, 0.38]}
        transparent
      />
      <Text
        position={[0.04, 0.05, 0.03]}
        fontSize={0.115}
        color="#f8fafc"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.045}
        outlineWidth={0.008}
        outlineColor="#0f172a"
      >
        MR5 SCHOOL
      </Text>
      <Text
        position={[0.02, -0.09, 0.03]}
        fontSize={0.042}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.08}
      >
        LEARN WITH AI
      </Text>
    </group>
  );
}

function TeacherCharacter({
  position,
  lookAt,
}: {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(position);
    groupRef.current.lookAt(lookAt);
  }, [lookAt, position]);

  const skin = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#efd9c2", roughness: 0.82, metalness: 0 }),
    [],
  );
  const blazer = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1e2a5a",
        roughness: 0.68,
        metalness: 0.06,
      }),
    [],
  );
  const shirt = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e2e8f0",
        roughness: 0.78,
        metalness: 0.02,
      }),
    [],
  );
  const pants = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1f2937",
        roughness: 0.86,
        metalness: 0.03,
      }),
    [],
  );
  const shoe = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0f172a",
        roughness: 0.72,
        metalness: 0.12,
      }),
    [],
  );
  const hair = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2d1f14",
        roughness: 0.92,
        metalness: 0,
      }),
    [],
  );

  return (
    <group ref={groupRef}>
      <mesh position={[-0.09, 0.36, 0.04]} castShadow receiveShadow material={pants}>
        <capsuleGeometry args={[0.075, 0.42, 6, 12]} />
      </mesh>
      <mesh position={[0.09, 0.36, 0.04]} castShadow receiveShadow material={pants}>
        <capsuleGeometry args={[0.075, 0.42, 6, 12]} />
      </mesh>
      <mesh position={[-0.09, 0.07, 0.1]} castShadow material={shoe}>
        <boxGeometry args={[0.11, 0.06, 0.2]} />
      </mesh>
      <mesh position={[0.09, 0.07, 0.1]} castShadow material={shoe}>
        <boxGeometry args={[0.11, 0.06, 0.2]} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow receiveShadow material={blazer}>
        <capsuleGeometry args={[0.24, 0.58, 10, 18]} />
      </mesh>
      <mesh position={[0, 1.02, 0.11]} castShadow material={shirt}>
        <boxGeometry args={[0.1, 0.22, 0.04]} />
      </mesh>
      <mesh position={[0, 1.56, 0.02]} castShadow receiveShadow material={skin}>
        <sphereGeometry args={[0.155, 24, 24]} />
      </mesh>
      <mesh position={[0, 1.72, -0.02]} castShadow material={hair}>
        <sphereGeometry args={[0.158, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>
      <mesh position={[-0.2, 1.02, 0.02]} castShadow material={blazer}>
        <capsuleGeometry args={[0.07, 0.34, 6, 10]} />
      </mesh>
      <mesh position={[0.2, 1.02, 0.02]} castShadow material={blazer}>
        <capsuleGeometry args={[0.07, 0.34, 6, 10]} />
      </mesh>
      <ContactShadows
        position={[0, 0.01, 0.08]}
        opacity={0.42}
        scale={1.1}
        blur={2.2}
        far={1.2}
      />
    </group>
  );
}

function ClassroomLighting({ viewState }: { viewState: ClassroomViewState }) {
  const windowDir = useMemo(() => {
    const side = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), viewState.classDirection)
      .normalize();
    return side.multiplyScalar(-1);
  }, [viewState.classDirection]);

  return (
    <>
      <ambientLight intensity={0.42} color="#eef2ff" />
      <hemisphereLight
        args={["#dbeafe", "#1e293b", 0.48]}
        position={[0, 6, 0]}
      />
      <directionalLight
        position={[
          windowDir.x * 7,
          5.5,
          windowDir.z * 7,
        ]}
        intensity={1.15}
        color="#fff7ed"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.00015}
      />
      <directionalLight
        position={[
          viewState.classDirection.x * -3,
          3.5,
          viewState.classDirection.z * -3,
        ]}
        intensity={0.32}
        color="#c7d2fe"
      />
      <pointLight
        position={[
          viewState.board.x,
          viewState.board.y + 0.8,
          viewState.board.z,
        ]}
        intensity={0.28}
        color="#fef3c7"
        distance={10}
      />
      <spotLight
        position={[
          viewState.teacherStand.x,
          viewState.floorY + 3.2,
          viewState.teacherStand.z,
        ]}
        angle={0.55}
        penumbra={0.65}
        intensity={0.22}
        color="#f8fafc"
        castShadow={false}
      />
    </>
  );
}

function ClassroomContent({
  viewState,
  cameraMode,
  onViewStateReady,
}: {
  viewState: ClassroomViewState | null;
  cameraMode: CameraMode;
  onViewStateReady: (state: ClassroomViewState) => void;
}) {
  return (
    <>
      <SceneRendererSetup />
      <color attach="background" args={["#141c2b"]} />
      <fog attach="fog" args={["#141c2b", 20, 36]} />
      <Environment preset="apartment" environmentIntensity={0.52} />
      <ClassroomModel onViewStateReady={onViewStateReady} />
      {viewState && (
        <>
          <ClassroomLighting viewState={viewState} />
          <WallBranding
            position={viewState.logoPosition}
            lookAt={viewState.logoLookAt}
          />
          <TeacherCharacter
            position={viewState.teacherStand}
            lookAt={viewState.teacherLookAt}
          />
          <ContactShadows
            position={[0, viewState.floorY + 0.01, 0]}
            opacity={0.35}
            scale={14}
            blur={2.8}
            far={5.5}
          />
          <ClassroomCameraRig viewState={viewState} mode={cameraMode} />
        </>
      )}
    </>
  );
}

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  tone: "indigo" | "emerald" | "amber" | "slate" | "violet";
  onClick: () => void;
  active?: boolean;
}

function ActionButton({
  label,
  icon,
  tone,
  onClick,
  active = false,
}: ActionButtonProps) {
  const tones = {
    indigo: "bg-indigo-600/90 hover:bg-indigo-500 border-indigo-400/30",
    emerald: "bg-emerald-600/90 hover:bg-emerald-500 border-emerald-400/30",
    amber: "bg-amber-600/90 hover:bg-amber-500 border-amber-400/30",
    slate: "bg-slate-700/90 hover:bg-slate-600 border-slate-400/30",
    violet: "bg-violet-600/90 hover:bg-violet-500 border-violet-400/30",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-colors sm:min-w-[8.5rem] sm:text-sm ${
        active ? "ring-2 ring-white/40 " : ""
      }${tones[tone]}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export interface ClassroomRoomSceneProps {
  courseId?: string;
  onExit?: () => void;
}

export function ClassroomRoomScene({ courseId, onExit }: ClassroomRoomSceneProps) {
  const [viewState, setViewState] = useState<ClassroomViewState | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>("student");

  const handleViewStateReady = useCallback((state: ClassroomViewState) => {
    setViewState(state);
  }, []);

  const toggleCameraMode = useCallback(() => {
    setCameraMode((current) => (current === "student" ? "teacher" : "student"));
  }, []);

  const handleAction = useCallback(
    (id: ClassroomAnchor["id"]) => {
      if (!courseId) return;
      if (id === "exit") {
        if (onExit) onExit();
        else window.history.back();
        return;
      }
      if (id === "teacher") {
        setCameraMode("teacher");
        return;
      }
      if (id === "board" || id === "lesson") {
        window.location.href = `/course/${courseId}/lesson/start`;
      }
    },
    [courseId, onExit],
  );

  const modeLabel =
    cameraMode === "student" ? "Student Desk View" : "Teacher View";

  return (
    <div className="flex h-full w-full flex-col bg-slate-950">
      <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900/95 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 sm:px-3 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Campus</span>
              <span className="sm:hidden">Back</span>
            </button>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
              Classroom
            </h1>
            <p className="truncate text-[10px] text-slate-400 sm:text-[11px]">
              MR5 School · {modeLabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleCameraMode}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-100 transition-colors hover:bg-indigo-500/25 sm:text-[11px]"
        >
          <Eye className="h-3.5 w-3.5" />
          {cameraMode === "student" ? "Teacher View" : "Student View"}
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        <Canvas
          dpr={[1, 1.5]}
          shadows
          gl={{ antialias: true, powerPreference: "high-performance" }}
          style={{ touchAction: "none" }}
        >
          <Suspense fallback={<Loader />}>
            <ClassroomContent
              viewState={viewState}
              cameraMode={cameraMode}
              onViewStateReady={handleViewStateReady}
            />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end p-3 sm:p-4">
          <div className="pointer-events-none mb-3 flex justify-center">
            <div className="h-6 w-6 rounded-full border border-white/25 bg-white/5" />
          </div>

          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-2xl backdrop-blur-md sm:p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-slate-300 sm:text-xs">
                {cameraMode === "student"
                  ? "Seated at your desk · drag to look around"
                  : "Teacher perspective · drag to scan the class"}
              </p>
              <button
                type="button"
                onClick={toggleCameraMode}
                className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-violet-400/25 bg-violet-500/15 px-2.5 py-1 text-[10px] font-medium text-violet-100 transition-colors hover:bg-violet-500/25 sm:text-[11px]"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Switch to {cameraMode === "student" ? "Teacher" : "Student"} View
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <ActionButton
                label="Whiteboard"
                icon={<Presentation className="h-4 w-4" />}
                tone="indigo"
                onClick={() => handleAction("board")}
              />
              <ActionButton
                label="Start Lesson"
                icon={<BookOpen className="h-4 w-4" />}
                tone="emerald"
                onClick={() => handleAction("lesson")}
              />
              <ActionButton
                label="AI Teacher"
                icon={<UserRound className="h-4 w-4" />}
                tone="slate"
                active={cameraMode === "teacher"}
                onClick={() => handleAction("teacher")}
              />
              <ActionButton
                label="Exit Room"
                icon={<DoorOpen className="h-4 w-4" />}
                tone="amber"
                onClick={() => handleAction("exit")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(CLASSROOM_GLB, true);
