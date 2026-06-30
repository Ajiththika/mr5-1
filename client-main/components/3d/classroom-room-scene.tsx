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
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import TeachingAIModal from "@/components/ai/TeachingAIModal";
import { useEnhancedUser } from "@/contexts/EnhancedUserContext";
import { ClassroomStoreProvider, useClassroomStore } from "@/features/classroom/store/classroom.store";
import { useWeatherSync } from "@/features/classroom/hooks/useWeatherSync";
import { ClassroomImmersiveHud } from "@/features/classroom/ui/ClassroomImmersiveHud";
import { ClassroomUiProvider } from "@/features/classroom/store/classroom-ui.store";
import { TeacherAvatar } from "@/components/3d/classroom/TeacherAvatar";
import { StudentFirstPersonPresence } from "@/components/3d/classroom/StudentFirstPersonPresence";
import { resolveTeacherAnchor } from "@/lib/classroom-teacher-placement";
import type { TeacherAnchorState } from "@/lib/classroom-teacher-placement";
import { ClassroomEnvironmentProvider, useClassroomEnvironment } from "@/contexts/ClassroomEnvironmentContext";
import { ClassroomAtmosphere } from "@/components/3d/classroom/ClassroomAtmosphere";
import { CeilingFan } from "@/components/3d/classroom/CeilingFan";
import { ClassroomAmbienceAudio } from "@/components/3d/classroom/ClassroomAmbienceAudio";
import { useAudio } from "@/hooks/useAudio";
import { useTranslation } from "@/hooks/useTranslation";
import type { EnvironmentLighting } from "@/lib/classroom-environment";
import { resolveStudentSeatedPoseBySeatId, collectChairSeats } from "@/lib/classroom-seat";
import { buildClassroomSeatGrid } from "@/lib/classroom/seat-grid";
import type { ClassroomSeatSlot } from "@/lib/classroom/seat-grid";
import {
  readStoredSeatId,
  writeStoredSeatId,
  DEFAULT_SEAT_ID,
} from "@/lib/classroom/seat-storage";
import { SmartBlackboard } from "@/components/3d/classroom/SmartBlackboard";
import { SeatSelectionOverlay } from "@/components/classroom/SeatSelectionOverlay";
import { AskTeacherButton } from "@/components/classroom/AskTeacherButton";
import { useClassroomLesson } from "@/features/classroom/hooks/useClassroomLesson";
import { useVoiceInteraction } from "@/hooks/useVoiceInteraction";
import { courseService } from "@/services/course.service";
import {
  CAMERA_PITCH_MAX,
  CAMERA_PITCH_MIN,
  type TeacherPresenceMode,
} from "@/lib/classroom/teacher-presence";
import type { ClassroomLessonSection } from "@/types/classroom-session";
import { useDeviceOrientationLook } from "@/hooks/useDeviceOrientationLook";
import { MotionViewButton } from "@/components/classroom/MotionViewButton";
import { ChangeTeacherModal } from "@/components/classroom/ChangeTeacherModal";
import { ClassroomSettingsPanel } from "@/components/classroom/ClassroomSettingsPanel";
import { useClassroomOwnStoreRuntime } from "@/hooks/useClassroomOwnStoreRuntime";
import { get3DPerformanceProfile } from "@/lib/3d/performance-profile";
import { useActiveTeacher, getTeacherPersonalityPrompt } from "@/contexts/ActiveTeacherContext";
import { ModelCreditNotice } from "@/components/3d/ModelCreditNotice";
import { getGaneshaModelUrl } from "@/lib/3d/aws-assets";
import { deriveClassroomBrandPlacements } from "@/lib/classroom/classroom-brand-placement";
import type { ClassroomBrandPlacements } from "@/lib/classroom/classroom-brand-placement";
import { ClassroomBrandStickers } from "@/components/3d/classroom/ClassroomBrandStickers";

const CLASSROOM_GLB = "/assets/3d/rooms/classroom.glb";

const LOOK_SENSITIVITY = 0.0021;
const CAMERA_BLEND_SPEED = 5.5;
const CAMERA_DAMPING_FACTOR = 0.08;
const HEAD_BOB_AMOUNT = 0.009;
const FULL_YAW_RANGE = Math.PI;

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
  teacherAnchor: TeacherAnchorState;
  studentPreset: CameraPreset;
  teacherPreset: CameraPreset;
  anchors: ClassroomAnchor[];
  ceilingY: number;
  roomCenter: THREE.Vector3;
  welcomeGuidePosition: THREE.Vector3;
  welcomeGuideLookAt: THREE.Vector3;
  seatGrid: ClassroomSeatSlot[];
  selectedSeatId: number;
  brandPlacements: ClassroomBrandPlacements;
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
        <ModelCreditNotice variant="loading" />
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

function alignClassroomToFloor(root: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
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

function deriveClassroomViewState(
  root: THREE.Object3D,
  seatId: number = DEFAULT_SEAT_ID,
): ClassroomViewState {
  root.updateWorldMatrix(true, true);

  const roomBox = new THREE.Box3().setFromObject(root);
  const floorY = roomBox.min.y + 0.02;
  const ceilingY = roomBox.max.y - 0.05;
  const roomCenter = roomBox.getCenter(new THREE.Vector3());

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

  const chairs = collectChairSeats(root);
  const seatGrid = buildClassroomSeatGrid(chairs, board, floorY);
  const seated = resolveStudentSeatedPoseBySeatId(root, board, floorY, seatId);
  const seat = seated.seat;
  const classDirection = seated.classDirection;

  const boardSide = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), classDirection)
    .normalize();

  const teacherAnchor = resolveTeacherAnchor(
    boardBounds,
    seat,
    floorY,
    classDirection,
  );
  const teacherStand = teacherAnchor.position.clone();
  const teacherLookAt = teacherAnchor.lookAt.clone();

  const studentEye = seated.eye.clone();
  const studentLook = seated.lookAt.clone();

  const classFocus = seat.clone();
  classFocus.y = seat.y + 0.08;

  const teacherEye = teacherStand
    .clone()
    .add(new THREE.Vector3(0, 1.62, 0))
    .add(classDirection.clone().multiplyScalar(0.18));
  const teacherLook = classFocus;

  const studentPreset = clonePreset(
    studentEye,
    studentLook,
    CAMERA_PITCH_MIN,
    CAMERA_PITCH_MAX,
    FULL_YAW_RANGE,
    54,
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

  const welcomeGuidePosition = doorCenter
    ? doorCenter.clone().add(boardSide.clone().multiplyScalar(-1.35))
    : roomCenter.clone().add(new THREE.Vector3(-2.4, 0, 2.2));
  welcomeGuidePosition.y = floorY;
  const welcomeGuideLookAt = seat.clone();
  welcomeGuideLookAt.y += 1.15;

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
        teacherStand.y + teacherAnchor.height * 0.92,
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
    teacherAnchor,
    studentPreset,
    teacherPreset,
    anchors,
    ceilingY,
    roomCenter,
    welcomeGuidePosition,
    welcomeGuideLookAt,
    seatGrid,
    selectedSeatId: seatId,
    brandPlacements: deriveClassroomBrandPlacements(root, classDirection, boardBounds),
  };
}

function sanitizeClassroomMeshes(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const key = normalizeName(child.name);

    if (key.includes("plane") && key.includes("window")) {
      child.visible = false;
      return;
    }

    const box = new THREE.Box3().setFromObject(child);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const minDim = Math.min(size.x, size.y, size.z);

    if (
      maxDim > 6 &&
      minDim < 0.18 &&
      !key.includes("wall") &&
      !key.includes("floor") &&
      !key.includes("ground") &&
      !key.includes("desk")
    ) {
      child.visible = false;
      return;
    }

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of materials) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
      if (key.includes("ceilling") || key.includes("ceiling")) {
        mat.color.setHex(0xece7df);
        mat.emissive.setHex(0x000000);
        mat.roughness = 0.92;
      }
      const hsl = { h: 0, s: 0, l: 0 };
      mat.color.getHSL(hsl);
      if (hsl.h > 0.72 && hsl.h < 0.9 && hsl.s > 0.3 && maxDim > 2.5) {
        mat.color.setHex(0xccc7c2);
        mat.emissive.setHex(0x000000);
      }
    }
  });
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
      } else if (isBoard) {
        mat.color.set("#1a3d2e");
        mat.roughness = 0.94;
        mat.metalness = 0.01;
        mat.envMapIntensity = 0.35;
      }

      if ("map" in mat && mat.map instanceof THREE.Texture) {
        mat.map.anisotropy = 8;
        mat.map.minFilter = THREE.LinearMipmapLinearFilter;
        mat.map.magFilter = THREE.LinearFilter;
      }
    }
  });
}

function SceneRendererSetup() {
  const { gl, size } = useThree();

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);

  useLayoutEffect(() => {
    const canvas = gl.domElement;
    const lock = () => {
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      canvas.style.transform = "none";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };
    lock();
    const observer = new ResizeObserver(lock);
    observer.observe(canvas.parentElement ?? canvas);
    return () => observer.disconnect();
  }, [gl, size.width, size.height]);

  return null;
}

function ClassroomCameraRig({
  viewState,
  mode,
  motionEnabled,
  getOrientationDelta,
}: {
  viewState: ClassroomViewState;
  mode: CameraMode;
  motionEnabled?: boolean;
  getOrientationDelta?: () => { yaw: number; pitch: number };
}) {
  const { camera, gl } = useThree();
  const preset =
    mode === "student" ? viewState.studentPreset : viewState.teacherPreset;
  const fullRotation = preset.yawRange >= Math.PI - 0.01;

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
  const yawVelocity = useRef(0);
  const pitchVelocity = useRef(0);
  const headBobPhase = useRef(0);

  const applyPresetBase = useCallback(
    (nextPreset: CameraPreset) => {
      targetPos.current.copy(nextPreset.position);
      targetLook.current.copy(nextPreset.lookAt);
      transitioning.current = true;
      transitionTimer.current = 0;
      yawVelocity.current = 0;
      pitchVelocity.current = 0;

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
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = preset.fov;
    }
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

  const clampPitch = useCallback(() => {
    euler.current.x = THREE.MathUtils.clamp(
      euler.current.x,
      preset.pitchMin,
      preset.pitchMax,
    );
  }, [preset.pitchMax, preset.pitchMin]);

  const clampYaw = useCallback(() => {
    if (fullRotation) return;
    euler.current.y = THREE.MathUtils.clamp(
      euler.current.y,
      baseYaw.current - preset.yawRange,
      baseYaw.current + preset.yawRange,
    );
  }, [fullRotation, preset.yawRange]);

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
    } else if (!looking.current) {
      let moved = false;
      if (Math.abs(yawVelocity.current) > 0.00002) {
        euler.current.y += yawVelocity.current * delta;
        yawVelocity.current *= Math.pow(1 - CAMERA_DAMPING_FACTOR, delta * 60);
        clampYaw();
        moved = true;
      }
      if (Math.abs(pitchVelocity.current) > 0.00002) {
        euler.current.x += pitchVelocity.current * delta;
        pitchVelocity.current *= Math.pow(1 - CAMERA_DAMPING_FACTOR, delta * 60);
        clampPitch();
        moved = true;
      }
      if (motionEnabled && getOrientationDelta) {
        const { yaw, pitch } = getOrientationDelta();
        if (Math.abs(yaw) > 0.0001 || Math.abs(pitch) > 0.0001) {
          euler.current.y += yaw * delta * 2.2;
          euler.current.x += pitch * delta * 2.2;
          clampPitch();
          clampYaw();
          applyLook();
        }
      }
      if (moved) applyLook();
    }

    headBobPhase.current += delta * (looking.current ? 5.2 : 0.9);
    const bob =
      Math.sin(headBobPhase.current) *
      HEAD_BOB_AMOUNT *
      (looking.current ? 1.15 : 0.35);

    const floorEye = viewState.floorY + 1.18;
    currentPos.current.y = Math.max(floorEye, targetPos.current.y + bob);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, preset.fov, 1 - Math.exp(-6 * delta));
    }
    camera.updateProjectionMatrix();
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || transitioning.current) return;
      looking.current = true;
      yawVelocity.current = 0;
      pitchVelocity.current = 0;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!looking.current || transitioning.current) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };

      const yawDelta = -dx * LOOK_SENSITIVITY;
      const pitchDelta = -dy * LOOK_SENSITIVITY;
      yawVelocity.current = yawDelta * 28;
      pitchVelocity.current = pitchDelta * 28;

      euler.current.y += yawDelta;
      euler.current.x += pitchDelta;
      clampPitch();
      clampYaw();
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
  }, [applyLook, clampPitch, clampYaw, gl]);

  return null;
}

function ClassroomModel({
  onViewStateReady,
  selectedSeatId,
}: {
  onViewStateReady: (state: ClassroomViewState) => void;
  selectedSeatId: number;
}) {
  const { scene } = useGLTF(CLASSROOM_GLB, true);
  const groupRef = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    sanitizeClassroomMeshes(clone);
    tuneMaterials(clone);
    alignClassroomToFloor(clone);
    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    onViewStateReady(deriveClassroomViewState(groupRef.current, selectedSeatId));
  }, [model, onViewStateReady, selectedSeatId]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function ClassroomLighting({
  viewState,
  lighting,
  lightsOn,
  curtainOpen,
  sunMultiplier,
}: {
  viewState: ClassroomViewState;
  lighting: EnvironmentLighting;
  lightsOn: boolean;
  curtainOpen: number;
  sunMultiplier: number;
}) {
  const windowDir = useMemo(() => {
    const side = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), viewState.classDirection)
      .normalize();
    return side.multiplyScalar(-1);
  }, [viewState.classDirection]);

  const lightMul = lightsOn ? 1 : 0.22;
  const curtainAtten = 0.38 + curtainOpen * 0.62;
  const sun = lighting.sunIntensity * sunMultiplier * curtainAtten * lightMul;
  const ambient = lighting.ambientIntensity * lightMul;
  const fill = lighting.fillIntensity * lightMul;
  const board = lighting.boardIntensity * lightMul;

  return (
    <>
      <ambientLight intensity={ambient} color={lighting.ambientColor} />
      <hemisphereLight
        args={["#dbeafe", "#1e293b", fill]}
        position={[0, 6, 0]}
      />
      <directionalLight
        position={[windowDir.x * 7, 5.5, windowDir.z * 7]}
        intensity={sun}
        color={lighting.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.00012}
        shadow-normalBias={0.02}
      />
      <directionalLight
        position={[
          viewState.classDirection.x * -3,
          3.5,
          viewState.classDirection.z * -3,
        ]}
        intensity={fill}
        color={lighting.fillColor}
      />
      <pointLight
        position={[
          viewState.board.x,
          viewState.board.y + 0.8,
          viewState.board.z,
        ]}
        intensity={board}
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
        penumbra={0.72}
        intensity={lightsOn ? (lighting.effects.thunder ? 0.35 : 0.24) : 0.06}
        color="#f8fafc"
        castShadow={false}
      />
    </>
  );
}

function ClassroomSceneEnvironment({ lighting }: { lighting: EnvironmentLighting }) {
  return (
    <>
      <color attach="background" args={[lighting.background]} />
      <fog attach="fog" args={[lighting.fogColor, lighting.fogNear, lighting.fogFar]} />
      <Environment preset="apartment" environmentIntensity={lighting.environmentIntensity} />
    </>
  );
}

function EquippedOwnStoreAssets({
  equippedClock,
  equippedTransport,
  viewState,
  windowCenter,
}: {
  equippedClock?: string;
  equippedTransport?: string;
  viewState: ClassroomViewState;
  windowCenter: THREE.Vector3;
}) {
  if (!equippedClock && !equippedTransport) return null;

  const clockPos: [number, number, number] = [
    viewState.board.x - viewState.classDirection.x * 0.4,
    viewState.ceilingY - 0.35,
    viewState.board.z - viewState.classDirection.z * 0.4,
  ];

  const busPos: [number, number, number] = [
    windowCenter.x + viewState.classDirection.x * 4.5,
    viewState.floorY + 0.6,
    windowCenter.z + viewState.classDirection.z * 4.5,
  ];

  return (
    <>
      {equippedClock ? (
        <group position={clockPos}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 32]} />
            <meshStandardMaterial color="#f5e6c8" metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <circleGeometry args={[0.14, 32]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ) : null}
      {equippedTransport ? (
        <group position={busPos} rotation={[0, Math.atan2(viewState.classDirection.x, viewState.classDirection.z), 0]}>
          <mesh>
            <boxGeometry args={[1.8, 0.7, 0.55]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
          <mesh position={[0.55, 0.2, 0]}>
            <boxGeometry args={[0.5, 0.35, 0.52]} />
            <meshStandardMaterial color="#fde68a" />
          </mesh>
        </group>
      ) : null}
    </>
  );
}

function ClassroomContent({
  viewState,
  cameraMode,
  selectedSeatId,
  onViewStateReady,
  onFanSpeedChange,
  blackboardSection,
  courseTitle,
  lessonLoading,
  teacherMode,
  teacherModelUrl,
  teacherFadeKey,
  equippedClock,
  equippedTransport,
  motionEnabled,
  getOrientationDelta,
}: {
  viewState: ClassroomViewState | null;
  cameraMode: CameraMode;
  selectedSeatId: number;
  onViewStateReady: (state: ClassroomViewState) => void;
  onFanSpeedChange: (speed: number) => void;
  blackboardSection: ClassroomLessonSection | null;
  courseTitle?: string;
  lessonLoading?: boolean;
  teacherMode: TeacherPresenceMode;
  teacherModelUrl?: string;
  teacherFadeKey?: number;
  equippedClock?: string;
  equippedTransport?: string;
  motionEnabled?: boolean;
  getOrientationDelta?: () => { yaw: number; pitch: number };
}) {
  const { environment } = useClassroomEnvironment();
  const { computed, weather } = useWeatherSync();
  const { controls } = useClassroomStore();
  const { lighting } = environment;
  const [fanSpeed, setFanSpeed] = useState(0);

  const handleFanSpeed = useCallback(
    (speed: number) => {
      setFanSpeed(speed);
      onFanSpeedChange(speed);
    },
    [onFanSpeedChange],
  );

  const fanEnvironment = useMemo(
    () => ({
      temperature: weather?.temperature,
      humidity: weather?.humidity,
      comfort: computed.roomComfort,
    }),
    [weather?.temperature, weather?.humidity, computed.roomComfort],
  );

  const windowVectors = useMemo(() => {
    if (!viewState) return null;
    const windowNormal = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), viewState.classDirection)
      .normalize()
      .multiplyScalar(-1);
    const windowCenter = viewState.board
      .clone()
      .add(windowNormal.clone().multiplyScalar(2.8));
    windowCenter.y = viewState.floorY + 2.35;
    return { windowNormal, windowCenter };
  }, [viewState]);

  return (
    <>
      <SceneRendererSetup />
      <ClassroomAmbienceAudio />
      <ClassroomSceneEnvironment lighting={lighting} />
      <ClassroomModel
        onViewStateReady={onViewStateReady}
        selectedSeatId={selectedSeatId}
      />
      {viewState && windowVectors && (
        <>
          <ClassroomLighting
            viewState={viewState}
            lighting={lighting}
            lightsOn={controls.lightsOn}
            curtainOpen={controls.curtainOpen}
            sunMultiplier={computed.sunIntensity}
          />
          <ClassroomAtmosphere
            lighting={lighting}
            windowNormal={windowVectors.windowNormal}
            windowCenter={windowVectors.windowCenter}
            curtainOpen={controls.curtainOpen}
            fanSpeed={fanSpeed}
            curtainStrength={computed.curtainStrength}
            windSpeed={weather.windSpeed}
            lightsOn={controls.lightsOn}
          />
          <SmartBlackboard
            boardBox={viewState.boardBox}
            classDirection={viewState.classDirection}
            section={blackboardSection}
            courseTitle={courseTitle}
            loading={lessonLoading}
          />
          <ClassroomBrandStickers placements={viewState.brandPlacements} />
          <CeilingFan
            position={[
              viewState.roomCenter.x,
              viewState.ceilingY,
              viewState.roomCenter.z,
            ]}
            enabled={controls.fanEnabled}
            mode={controls.fanMode}
            autoIntensity={computed.fanIntensity}
            scale={1.1}
            onSpeedChange={handleFanSpeed}
            environment={fanEnvironment}
          />
          <TeacherAvatar
            anchor={viewState.teacherAnchor}
            mode={teacherMode}
            modelUrl={teacherModelUrl}
            fadeKey={teacherFadeKey}
          />
          <EquippedOwnStoreAssets
            equippedClock={equippedClock}
            equippedTransport={equippedTransport}
            viewState={viewState}
            windowCenter={windowVectors.windowCenter}
          />
          <ContactShadows
            position={[0, viewState.floorY + 0.01, 0]}
            opacity={lighting.effects.rain ? 0.5 : 0.38}
            scale={14}
            blur={3.2}
            far={5.5}
          />
          <ClassroomCameraRig
            viewState={viewState}
            mode={cameraMode}
            motionEnabled={motionEnabled}
            getOrientationDelta={getOrientationDelta}
          />
          {cameraMode === "student" && <StudentFirstPersonPresence />}
        </>
      )}
    </>
  );
}

export interface ClassroomRoomSceneProps {
  courseId?: string;
  onExit?: () => void;
}

export function ClassroomRoomScene({ courseId, onExit }: ClassroomRoomSceneProps) {
  return (
    <ClassroomEnvironmentProvider>
      <ClassroomStoreProvider>
        <ClassroomUiProvider>
          <ClassroomRoomSceneInner courseId={courseId} onExit={onExit} />
        </ClassroomUiProvider>
      </ClassroomStoreProvider>
    </ClassroomEnvironmentProvider>
  );
}

function ClassroomRoomSceneInner({ courseId, onExit }: ClassroomRoomSceneProps) {
  const router = useRouter();
  const { user } = useEnhancedUser();
  const { t } = useTranslation();
  const { playBell, playChatOpen } = useAudio();
  const voiceInteraction = useVoiceInteraction("gemini");
  const orientation = useDeviceOrientationLook();

  const [viewState, setViewState] = useState<ClassroomViewState | null>(null);
  const [fanSpeed, setFanSpeed] = useState(0);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState<string | undefined>();
  const [selectedSeatId, setSelectedSeatId] = useState<number>(DEFAULT_SEAT_ID);
  const [seatPickerOpen, setSeatPickerOpen] = useState(false);
  const [seatReady, setSeatReady] = useState(true);
  const [changeTeacherOpen, setChangeTeacherOpen] = useState(false);
  const [classroomSettingsOpen, setClassroomSettingsOpen] = useState(false);
  const {
    activeTeacher,
    fadeToken,
    syncInventory,
    equipped,
  } = useActiveTeacher();

  useClassroomOwnStoreRuntime();

  const {
    currentSection,
    loading: lessonLoading,
    advanceSection,
    lesson,
    sectionIndex,
  } = useClassroomLesson(courseId, courseTitle);

  const cameraMode: CameraMode =
    user?.role === "admin" || user?.role === "AI-TEACHER" ? "teacher" : "student";

  const perf3d = useMemo(() => get3DPerformanceProfile(), []);

  useEffect(() => {
    const stored = readStoredSeatId();
    const seat = stored ?? DEFAULT_SEAT_ID;
    setSelectedSeatId(seat);
    setSeatReady(true);
    if (!stored) writeStoredSeatId(DEFAULT_SEAT_ID);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    courseService
      .getCourseById(courseId)
      .then((res) => setCourseTitle(res.data?.title))
      .catch(() => undefined);
  }, [courseId]);

  useEffect(() => {
    if (!user) return;
    const syncTeachers = async () => {
      try {
        const { ownStoreService } = await import("@/services/own-store.service");
        const invRes = await ownStoreService.getInventory();
        syncInventory(invRes.data);
      } catch {
        // Default teacher remains available
      }
    };
    syncTeachers();
  }, [user, syncInventory]);

  useEffect(() => {
    useGLTF.preload(getGaneshaModelUrl());
  }, []);

  useEffect(() => {
    if (!seatReady || !lesson || lessonLoading) return;
    const timer = window.setInterval(() => advanceSection(), 38000);
    return () => window.clearInterval(timer);
  }, [seatReady, lesson, lessonLoading, advanceSection]);

  const classroomContext = useMemo(
    () => ({
      studentSeat: selectedSeatId,
      seatLabel: viewState?.seatGrid.find((s) => s.id === selectedSeatId)?.label,
      boardContent: currentSection?.boardLines,
      teacherName: activeTeacher?.name,
      teacherPersonality: getTeacherPersonalityPrompt(activeTeacher),
      learningProgress: {
        sectionIndex,
        completedTopics: lesson?.sections
          .slice(0, sectionIndex + 1)
          .map((s) => s.title),
      },
    }),
    [selectedSeatId, viewState, currentSection, sectionIndex, lesson, activeTeacher],
  );

  const teacherMode = useMemo((): TeacherPresenceMode => {
    if (aiChatOpen) return "question";
    if (lesson && !lessonLoading) return "teaching";
    return "idle";
  }, [aiChatOpen, lesson, lessonLoading]);

  const handleEnableMotion = useCallback(async () => {
    await orientation.requestPermission();
  }, [orientation]);

  const handleViewStateReady = useCallback((state: ClassroomViewState) => {
    setViewState(state);
  }, []);

  const handleSeatConfirm = useCallback(() => {
    writeStoredSeatId(selectedSeatId);
    setSeatPickerOpen(false);
    setSeatReady(true);
  }, [selectedSeatId]);

  const handleAskText = useCallback(() => {
    playChatOpen();
    setAiChatOpen(true);
  }, [playChatOpen]);

  const handleAskVoice = useCallback(() => {
    playChatOpen();
    setAiChatOpen(true);
  }, [playChatOpen]);

  const handleAiClose = useCallback(() => {
    voiceInteraction.stopListening();
    setAiChatOpen(false);
  }, [voiceInteraction]);

  const handleAction = useCallback(
    (id: ClassroomAnchor["id"]) => {
      if (id === "exit") {
        if (onExit) onExit();
        else window.history.back();
        return;
      }
      if (!courseId) return;
      if (id === "teacher") {
        playChatOpen();
        setAiChatOpen(true);
        return;
      }
      if (id === "board" || id === "lesson") {
        playBell();
        router.push(`/course/${courseId}/lesson/start`);
        return;
      }
    },
    [courseId, onExit, playBell, playChatOpen, router],
  );

  const modeLabel =
    cameraMode === "student" ? t("classroom.studentView") : t("classroom.teacherView");

  return (
    <div className="flex h-full min-w-0 w-full flex-col bg-slate-950">
      <div className="classroom-scene-viewport relative min-h-0 min-w-0 w-full flex-1 overflow-hidden">
        <Canvas
          className="classroom-scene-canvas"
          dpr={perf3d.dpr}
          shadows={perf3d.shadows}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
          gl={{
            antialias: perf3d.antialias,
            powerPreference: "high-performance",
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            touchAction: "none",
          }}
        >
          <Suspense fallback={<Loader />}>
            <ClassroomContent
              viewState={viewState}
              cameraMode={cameraMode}
              selectedSeatId={selectedSeatId}
              onViewStateReady={handleViewStateReady}
              onFanSpeedChange={setFanSpeed}
              blackboardSection={currentSection}
              courseTitle={courseTitle ?? lesson?.courseName}
              lessonLoading={lessonLoading}
              teacherMode={teacherMode}
              teacherModelUrl={activeTeacher?.modelUrl}
              teacherFadeKey={fadeToken}
              equippedClock={equipped.clock}
              equippedTransport={equipped.transport}
              motionEnabled={orientation.enabled}
              getOrientationDelta={orientation.getDelta}
            />
          </Suspense>
        </Canvas>

        <ClassroomImmersiveHud
          cameraMode={cameraMode}
          fanSpeed={fanSpeed}
          courseTitle={courseTitle}
          modeLabel={`MR5 School · ${modeLabel}`}
          selectedSeatId={selectedSeatId}
          onChangeSeat={() => setSeatPickerOpen(true)}
          onBack={onExit}
          onAction={handleAction}
          onChangeTeacher={() => setChangeTeacherOpen(true)}
          onClassroomSettings={() => setClassroomSettingsOpen(true)}
        />

        <ChangeTeacherModal
          open={changeTeacherOpen}
          onOpenChange={setChangeTeacherOpen}
        />

        <ClassroomSettingsPanel
          open={classroomSettingsOpen}
          onOpenChange={setClassroomSettingsOpen}
          onChangeTeacher={() => setChangeTeacherOpen(true)}
        />

        {seatPickerOpen && viewState && (
          <SeatSelectionOverlay
            seats={viewState.seatGrid}
            selectedId={selectedSeatId}
            onSelect={setSelectedSeatId}
            onConfirm={handleSeatConfirm}
            onClose={() => setSeatPickerOpen(false)}
          />
        )}

        {seatReady && cameraMode === "student" && (
          <div className="pointer-events-auto absolute bottom-20 right-4 z-30 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
            {orientation.supported && (
              <MotionViewButton
                active={orientation.enabled}
                onEnable={handleEnableMotion}
                onDisable={orientation.disable}
              />
            )}
            <AskTeacherButton
              onAskText={handleAskText}
              onAskVoice={handleAskVoice}
            />
          </div>
        )}
      </div>

      <TeachingAIModal
        isOpen={aiChatOpen}
        onClose={handleAiClose}
        courseId={courseId}
        courseTitle={courseTitle ?? lesson?.courseName}
        lessonTitle={currentSection?.title ?? lesson?.title}
        classroomContext={classroomContext}
        voiceInteraction={voiceInteraction}
      />
    </div>
  );
}

useGLTF.preload(CLASSROOM_GLB, true);
