"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Html, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";

const CLASSROOM_GLB = "/assets/3d/rooms/classroom.glb";
const LOOK_SENSITIVITY = 0.0028;
const AUTO_ROTATE_SPEED = 0.22;
const PITCH_MIN = -0.48;
const PITCH_MAX = 0.38;
const CINEMATIC_FOV = 46;

interface MiniViewState {
  eye: THREE.Vector3;
  lookAt: THREE.Vector3;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-full border border-indigo-400/30 bg-slate-950/85 px-3 py-1.5 text-[10px] text-indigo-100">
        Loading classroom {progress.toFixed(0)}%
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
  root.position.sub(box.getCenter(new THREE.Vector3()));
}

function deriveMiniViewState(root: THREE.Object3D): MiniViewState {
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
  const eye = new THREE.Vector3(chairCenter.x, floorY + 1.32, chairCenter.z);
  const lookAt = board.clone();
  lookAt.y -= 0.22;

  return { eye, lookAt };
}

function InteriorPreviewCamera({ viewState }: { viewState: MiniViewState }) {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const looking = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  const applyLook = useCallback(() => {
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(euler.current);
    lookTarget.copy(viewState.eye).add(direction.multiplyScalar(8));
    camera.position.copy(viewState.eye);
    camera.lookAt(lookTarget);
  }, [camera, lookTarget, viewState.eye]);

  useLayoutEffect(() => {
    camera.position.copy(viewState.eye);
    camera.lookAt(viewState.lookAt);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = CINEMATIC_FOV;
    }
    camera.near = 0.08;
    camera.far = 36;
    camera.updateProjectionMatrix();

    const forward = viewState.lookAt.clone().sub(viewState.eye).normalize();
    euler.current.setFromQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, -1),
        forward,
      ),
      "YXZ",
    );
    applyLook();
  }, [applyLook, camera, viewState.eye, viewState.lookAt]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      looking.current = true;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!looking.current) return;
      const dx = event.clientX - lastPointer.current.x;
      const dy = event.clientY - lastPointer.current.y;
      lastPointer.current = { x: event.clientX, y: event.clientY };

      euler.current.y -= dx * LOOK_SENSITIVITY;
      euler.current.x -= dy * LOOK_SENSITIVITY;
      euler.current.x = THREE.MathUtils.clamp(
        euler.current.x,
        PITCH_MIN,
        PITCH_MAX,
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
  }, [applyLook, gl]);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (looking.current) return;
      euler.current.y += AUTO_ROTATE_SPEED * 0.002;
      euler.current.x = THREE.MathUtils.lerp(euler.current.x, -0.03, 0.03);
      applyLook();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [applyLook]);

  return null;
}

function MiniClassroomModel({
  onReady,
}: {
  onReady: (state: MiniViewState) => void;
}) {
  const { scene } = useGLTF(CLASSROOM_GLB, true);
  const groupRef = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    centerModelAtOrigin(clone);
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.frustumCulled = true;
      child.castShadow = true;
      child.receiveShadow = true;
      const mat = child.material;
      const materials = Array.isArray(mat) ? mat : [mat];
      for (const material of materials) {
        if (material && "envMapIntensity" in material) {
          (material as THREE.MeshStandardMaterial).envMapIntensity = 0.85;
        }
      }
    });
    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    if (!groupRef.current) return;
    onReady(deriveMiniViewState(groupRef.current));
  }, [model, onReady]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

function MiniScene({
  viewState,
  setViewState,
}: {
  viewState: MiniViewState | null;
  setViewState: (state: MiniViewState) => void;
}) {
  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <fog attach="fog" args={["#0f172a", 18, 34]} />
      <ambientLight intensity={0.55} color="#eef2ff" />
      <hemisphereLight args={["#dbeafe", "#1e293b", 0.5]} />
      <directionalLight
        position={[-5, 8, 2]}
        intensity={1.15}
        color="#fff7ed"
        castShadow
      />
      <directionalLight position={[4, 5, -2]} intensity={0.42} color="#c7d2fe" />
      <pointLight
        position={[0, 3.4, -2.2]}
        intensity={0.55}
        color="#fef9c3"
        distance={14}
      />
      <spotLight
        position={[0, 4.2, -1.5]}
        angle={0.45}
        penumbra={0.6}
        intensity={0.35}
        color="#fff7ed"
        castShadow
      />
      <Environment preset="apartment" environmentIntensity={0.62} />
      <MiniClassroomModel onReady={setViewState} />
      {viewState && <InteriorPreviewCamera viewState={viewState} />}
    </>
  );
}

interface ClassroomMiniPreviewProps {
  className?: string;
}

export function ClassroomMiniPreview({ className = "" }: ClassroomMiniPreviewProps) {
  const [viewState, setViewState] = useState<MiniViewState | null>(null);

  return (
    <div className={`preview-3d-root relative min-h-[280px] h-full w-full ${className}`}>
      <Canvas
        className="preview-3d-canvas-host !absolute inset-0 h-full w-full"
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.32, 3.2], fov: CINEMATIC_FOV, near: 0.08, far: 36 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ touchAction: "none" }}
      >
        <Suspense fallback={<Loader />}>
          <MiniScene viewState={viewState} setViewState={setViewState} />
        </Suspense>
      </Canvas>
      <div className="preview-cinematic-vignette" aria-hidden />
      <div className="preview-3d-ui left-3 top-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-100 backdrop-blur-md">
          Cinematic · 360°
        </span>
      </div>
      <div className="preview-3d-ui inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent px-3 pb-3 pt-10">
        <p className="text-center text-[10px] font-medium text-white/80">
          Drag to look around · Interior classroom preview
        </p>
      </div>
    </div>
  );
}

useGLTF.preload(CLASSROOM_GLB, true);
