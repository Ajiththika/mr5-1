"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { MODEL_ASSETS } from "@/lib/3d/model-registry";
import { useClassroomEnvironment } from "@/contexts/ClassroomEnvironmentContext";
import { getSchoolClockAngles } from "@/hooks/useSchoolClock";

const TARGET_DIAMETER = 0.36;

type ClockHands = {
  hour: THREE.Object3D | null;
  minute: THREE.Object3D | null;
  second: THREE.Object3D | null;
};

function findClockHands(root: THREE.Object3D): ClockHands {
  const hands: ClockHands = { hour: null, minute: null, second: null };

  root.traverse((child) => {
    const name = child.name;
    const lower = name.toLowerCase();

    if (lower === "min_zeiger" || lower.endsWith("|min_zeiger")) {
      hands.minute = child;
      return;
    }
    if (lower === "sec_zeiger" || lower.endsWith("|sec_zeiger")) {
      hands.second = child;
      return;
    }
    if (/stunden/i.test(name) && !/minuten|sekunden|action|\.tak/i.test(name)) {
      if (!hands.hour || name.length < hands.hour.name.length) {
        hands.hour = child;
      }
    }
  });

  return hands;
}

function prepareClockModel(scene: THREE.Object3D, targetDiameter: number) {
  const clone = SkeletonUtils.clone(scene) as THREE.Object3D;
  clone.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  clone.scale.setScalar(targetDiameter / maxDim);
  clone.updateMatrixWorld(true);

  const centered = new THREE.Box3().setFromObject(clone);
  const center = centered.getCenter(new THREE.Vector3());
  clone.position.sub(center);
  clone.updateMatrixWorld(true);

  clone.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of materials) {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.envMapIntensity = 0.55;
      }
    }
  });

  return clone;
}

export function ClassroomWallClock({
  diameter = TARGET_DIAMETER,
  rotationY = 0,
}: {
  diameter?: number;
  rotationY?: number;
}) {
  const { timezone } = useClassroomEnvironment();
  const fbx = useLoader(FBXLoader, MODEL_ASSETS.clock3dhaupt.path);
  const model = useMemo(() => prepareClockModel(fbx, diameter), [diameter, fbx]);
  const handsRef = useRef<ClockHands>({ hour: null, minute: null, second: null });

  useLayoutEffect(() => {
    handsRef.current = findClockHands(model);
  }, [model]);

  useFrame(() => {
    const angles = getSchoolClockAngles(timezone);
    const { hour, minute, second } = handsRef.current;

    if (second) second.rotation.z = -angles.second;
    if (minute) minute.rotation.z = -angles.minute;
    if (hour) hour.rotation.z = -angles.hour;
  });

  return (
    <group rotation={[0, rotationY, 0]}>
      <primitive object={model} />
    </group>
  );
}
