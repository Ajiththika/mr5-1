"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { SkeletonUtils } from "three-stdlib";
import { getGaneshaModelUrl } from "@/lib/3d/aws-assets";
import { GANESHA_METADATA } from "@/lib/3d/ganesha-loader";
import { clampTeacherRootScale } from "@/lib/classroom-teacher-placement";

const MAX_SCALE = 2.2;
const MIN_SCALE = 0.12;

function isFbxModelUrl(url: string) {
  return url.toLowerCase().endsWith(".fbx");
}

function isMainBodyDanceClip(name: string) {
  const n = name.toLowerCase();
  if (n.includes("_end_") || n.includes("eye") || n.includes("jaw") || n.includes("tooth")) {
    return false;
  }
  return (
    n.includes("hip") ||
    n.includes("spine") ||
    n.includes("neck") ||
    n.includes("head") ||
    n.includes("shoulder") ||
    n.includes("arm") ||
    n.includes("forearm") ||
    n.includes("hand") ||
    n.includes("leg") ||
    n.includes("foot") ||
    n.includes("thigh") ||
    n.includes("calf") ||
    n.includes("root")
  );
}

function mergeFbxClips(clips: THREE.AnimationClip[], url: string): THREE.AnimationClip[] {
  const lower = url.toLowerCase();
  if (lower.includes("manuel")) return mergeFbxDanceClips(clips);
  if (lower.includes("sophia") || lower.includes("creep")) {
    const idle =
      clips.find((c) => /idle|idling/i.test(c.name)) ??
      clips.find((c) => /take 001/i.test(c.name)) ??
      clips.find((c) => /sniff/i.test(c.name)) ??
      clips[0];
    return idle ? [idle] : clips;
  }
  return clips.length ? [clips[0]] : clips;
}

function mergeFbxDanceClips(clips: THREE.AnimationClip[]): THREE.AnimationClip[] {
  const tracks: THREE.KeyframeTrack[] = [];
  let maxDuration = 0;
  for (const clip of clips) {
    if (!clip?.tracks?.length || !isMainBodyDanceClip(clip.name)) continue;
    tracks.push(...clip.tracks);
    maxDuration = Math.max(maxDuration, clip.duration || 0);
  }
  if (!tracks.length) {
    const fallback =
      clips.find((c) => /danc/i.test(c.name)) ??
      clips.find((c) => /take 001/i.test(c.name)) ??
      clips[0];
    return fallback ? [fallback] : clips;
  }
  return [new THREE.AnimationClip("dance", maxDuration || 44, tracks)];
}

function stripNonCharacterMeshes(root: THREE.Object3D) {
  const remove: THREE.Object3D[] = [];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (child instanceof THREE.SkinnedMesh) return;
    const name = child.name.toLowerCase();
    if (name.includes("plane") || name.includes("backdrop") || name.includes("background")) {
      remove.push(child);
      return;
    }
    const box = new THREE.Box3().setFromObject(child);
    const size = box.getSize(new THREE.Vector3());
    if (Math.max(size.x, size.y, size.z) > 8) remove.push(child);
  });
  for (const node of remove) node.parent?.remove(node);
}

function tuneMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.frustumCulled = true;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of materials) {
      if (!mat) continue;
      if ("map" in mat && mat.map instanceof THREE.Texture) {
        mat.map.anisotropy = 4;
        mat.map.minFilter = THREE.LinearFilter;
      }
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.envMapIntensity = 0.45;
        const hsl = { h: 0, s: 0, l: 0 };
        mat.color.getHSL(hsl);
        if (!mat.map && hsl.h > 0.58 && hsl.h < 0.72 && hsl.s > 0.4) {
          child.visible = false;
        }
      }
    }
  });
}

function measureSkinnedHeight(root: THREE.Object3D): number {
  const box = new THREE.Box3();
  let found = false;
  root.traverse((child) => {
    if (!(child instanceof THREE.SkinnedMesh)) return;
    box.union(new THREE.Box3().setFromObject(child));
    found = true;
  });
  if (!found) {
    return Math.max(new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).y, 0.001);
  }
  return Math.max(box.getSize(new THREE.Vector3()).y, 0.001);
}

function measureTeacherHeight(root: THREE.Object3D): number {
  const skinned = measureSkinnedHeight(root);
  if (skinned > 0.1) return skinned;
  return Math.max(new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).y, 0.001);
}

function normalizeBodyHeightMeters(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1.7;
  if (raw > 20) return raw / 100;
  if (raw > 3.5) return raw / 100;
  return raw;
}

function resetLocalTransform(node: THREE.Object3D) {
  node.position.set(0, 0, 0);
  node.rotation.set(0, 0, 0);
  node.scale.set(1, 1, 1);
  node.updateMatrix();
}

function prepareTeacherModel(scene: THREE.Object3D, targetHeight: number): THREE.Object3D {
  const clone = SkeletonUtils.clone(scene) as THREE.Object3D;
  resetLocalTransform(clone);
  stripNonCharacterMeshes(clone);
  tuneMaterials(clone);

  let bodyHeight = normalizeBodyHeightMeters(measureTeacherHeight(clone));
  bodyHeight = THREE.MathUtils.clamp(bodyHeight, 0.45, 2.8);

  const scale = THREE.MathUtils.clamp(targetHeight / bodyHeight, MIN_SCALE, MAX_SCALE);
  clone.scale.setScalar(scale);
  clone.updateMatrixWorld(true);

  const feetBox = new THREE.Box3();
  clone.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      feetBox.union(new THREE.Box3().setFromObject(child));
    }
  });

  if (Number.isFinite(feetBox.min.y)) {
    const footCenter = feetBox.getCenter(new THREE.Vector3());
    clone.position.set(-footCenter.x, -feetBox.min.y, -footCenter.z);
  }
  clone.updateMatrixWorld(true);

  const rig = new THREE.Group();
  rig.name = "teacher_rig";
  rig.scale.set(1, 1, 1);
  rig.add(clone);
  clampTeacherRootScale(rig, targetHeight);
  return rig;
}

function pickTeacherAction(
  actions: Record<string, THREE.AnimationAction | null>,
  modelUrl?: string,
): THREE.AnimationAction | null | undefined {
  const keys = Object.keys(actions);
  const lower = (modelUrl ?? "").toLowerCase();

  if (lower.includes("creep")) {
    const idleKey = keys.find((k) => /idle|idling/i.test(k) && !/roar/i.test(k));
    const sniffKey = keys.find((k) => /sniff/i.test(k));
    return (
      (idleKey ? actions[idleKey] : undefined) ??
      (sniffKey ? actions[sniffKey] : undefined) ??
      actions[keys[0]]
    );
  }

  if (lower.includes("sophia")) {
    const idleKey = keys.find((k) => /idle|idling/i.test(k));
    return (idleKey ? actions[idleKey] : undefined) ?? actions[keys[0]];
  }

  const danceKey = keys.find((k) => /danc/i.test(k) && actions[k]);
  return (
    actions.dance ??
    actions["Take 001"] ??
    (danceKey ? actions[danceKey] : undefined) ??
    (keys[0] ? actions[keys[0]] : undefined)
  );
}

export interface GaneshaModelProps {
  position?: THREE.Vector3;
  lookAt?: THREE.Vector3;
  variant?: "teacher" | "statue";
  animate?: boolean;
  embedded?: boolean;
  targetHeight?: number;
  modelUrl?: string;
}

type TeacherModelCoreProps = GaneshaModelProps & {
  resolvedUrl: string;
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};

function TeacherModelCore({
  position,
  lookAt,
  variant = "teacher",
  animate = true,
  embedded = false,
  targetHeight: targetHeightOverride,
  scene,
  animations,
  resolvedUrl,
}: TeacherModelCoreProps) {
  const rootRef = useRef<THREE.Group>(null);
  const animRef = useRef<THREE.Group>(null);

  const isTeacher = variant === "teacher";
  const targetHeight =
    targetHeightOverride ??
    (isTeacher ? GANESHA_METADATA.teacherHeight : GANESHA_METADATA.displayScale);

  const model = useMemo(
    () => prepareTeacherModel(scene, targetHeight),
    [scene, targetHeight],
  );

  const { actions, mixer } = useAnimations(animations, animRef);

  useEffect(() => {
    if (!isTeacher || !animate) return;
    const preferred = pickTeacherAction(actions, resolvedUrl);
    if (!preferred) return;
    preferred.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.35).play();
    const clipName = preferred.getClip().name.toLowerCase();
    preferred.timeScale =
      /danc/i.test(clipName) || resolvedUrl.toLowerCase().includes("manuel") ? 1 : 0.85;
    return () => {
      preferred.fadeOut(0.2);
    };
  }, [actions, animate, isTeacher, resolvedUrl]);

  useLayoutEffect(() => {
    if (embedded || !rootRef.current || !position || !lookAt) return;
    rootRef.current.position.copy(position);
    rootRef.current.lookAt(lookAt);
  }, [embedded, lookAt, position]);

  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
  });

  return (
    <group
      ref={rootRef}
      name={isTeacher ? "ganesha_teacher" : "ganesha_guide"}
      scale={[1, 1, 1]}
      userData={{ role: isTeacher ? "ai-teacher" : "welcome-guide" }}
    >
      <group ref={animRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}

function GltfTeacherModel(props: GaneshaModelProps & { resolvedUrl: string }) {
  const { scene, animations } = useGLTF(props.resolvedUrl);
  return (
    <TeacherModelCore {...props} scene={scene} animations={animations} resolvedUrl={props.resolvedUrl} />
  );
}

function FbxTeacherModel(props: GaneshaModelProps & { resolvedUrl: string }) {
  const fbx = useLoader(FBXLoader, props.resolvedUrl);
  const animations = useMemo(
    () => mergeFbxClips(fbx.animations || [], props.resolvedUrl),
    [fbx, props.resolvedUrl],
  );
  return (
    <TeacherModelCore
      {...props}
      scene={fbx}
      animations={animations}
      resolvedUrl={props.resolvedUrl}
    />
  );
}

export function GaneshaModel(props: GaneshaModelProps) {
  const resolvedUrl = props.modelUrl || getGaneshaModelUrl();
  if (isFbxModelUrl(resolvedUrl)) {
    return <FbxTeacherModel {...props} resolvedUrl={resolvedUrl} />;
  }
  return <GltfTeacherModel {...props} resolvedUrl={resolvedUrl} />;
}

export const GaneshaWelcomeGuide = GaneshaModel;

useGLTF.preload(getGaneshaModelUrl());
