"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { getGaneshaModelUrl } from "@/lib/3d/aws-assets";
import { GANESHA_METADATA } from "@/lib/3d/ganesha-loader";

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
    if (Math.max(size.x, size.y, size.z) > 30) remove.push(child);
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
  if (!found) return Math.max(new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).y, 0.001);
  return Math.max(box.getSize(new THREE.Vector3()).y, 0.001);
}

function prepareTeacherModel(scene: THREE.Object3D, targetHeight: number): THREE.Object3D {
  const clone = SkeletonUtils.clone(scene) as THREE.Object3D;
  stripNonCharacterMeshes(clone);
  tuneMaterials(clone);

  const bodyHeight = measureSkinnedHeight(clone);
  const scale = targetHeight / bodyHeight;
  clone.scale.setScalar(scale);
  clone.updateMatrixWorld(true);

  const feetBox = new THREE.Box3();
  clone.traverse((child) => {
    if (child instanceof THREE.SkinnedMesh) {
      feetBox.union(new THREE.Box3().setFromObject(child));
    }
  });

  const footCenter = feetBox.getCenter(new THREE.Vector3());
  clone.position.set(-footCenter.x, -feetBox.min.y, -footCenter.z);
  clone.updateMatrixWorld(true);

  const rig = new THREE.Group();
  rig.name = "teacher_rig";
  rig.add(clone);
  return rig;
}

export interface GaneshaModelProps {
  position?: THREE.Vector3;
  lookAt?: THREE.Vector3;
  variant?: "teacher" | "statue";
  animate?: boolean;
  embedded?: boolean;
  targetHeight?: number;
}

export function GaneshaModel({
  position,
  lookAt,
  variant = "teacher",
  animate = true,
  embedded = false,
  targetHeight: targetHeightOverride,
}: GaneshaModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const modelUrl = getGaneshaModelUrl();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, rootRef);

  const isTeacher = variant === "teacher";
  const targetHeight =
    targetHeightOverride ??
    (isTeacher ? GANESHA_METADATA.teacherHeight : GANESHA_METADATA.displayScale);

  const model = useMemo(
    () => prepareTeacherModel(scene, targetHeight),
    [scene, targetHeight],
  );

  useEffect(() => {
    if (!isTeacher || !animate) return;
    const action =
      actions["Take 001"] ?? actions[Object.keys(actions)[0] ?? ""];
    if (!action) return;
    action.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.35).play();
    action.timeScale = 0.8;
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, animate, isTeacher]);

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
      userData={{ role: isTeacher ? "ai-teacher" : "welcome-guide" }}
    >
      <primitive object={model} />
    </group>
  );
}

export const GaneshaWelcomeGuide = GaneshaModel;

useGLTF.preload(getGaneshaModelUrl());
