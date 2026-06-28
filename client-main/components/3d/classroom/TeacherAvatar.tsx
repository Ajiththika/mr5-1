"use client";

import { Suspense, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GaneshaModel } from "@/components/3d/GaneshaModel";
import type { TeacherAnchorState } from "@/lib/classroom-teacher-placement";
import {
  sampleTeacherIdleOffsets,
  type TeacherPresenceMode,
} from "@/lib/classroom/teacher-presence";

export type { TeacherAnchorState };

export function TeacherAvatar({
  anchor,
  mode = "idle",
}: {
  anchor: TeacherAnchorState;
  mode?: TeacherPresenceMode;
}) {
  const anchorRef = useRef<THREE.Group>(null);
  const breathRef = useRef<THREE.Group>(null);
  const modeRef = useRef(mode);

  modeRef.current = mode;

  useLayoutEffect(() => {
    const node = anchorRef.current;
    if (!node) return;
    node.position.set(anchor.position.x, anchor.position.y, anchor.position.z);
    node.rotation.set(0, 0, 0);
    node.scale.set(1, 1, 1);
    node.lookAt(anchor.lookAt.x, anchor.lookAt.y, anchor.lookAt.z);
    node.updateMatrixWorld(true);
  }, [
    anchor.position.x,
    anchor.position.y,
    anchor.position.z,
    anchor.lookAt.x,
    anchor.lookAt.y,
    anchor.lookAt.z,
  ]);

  useFrame((state, delta) => {
    const offsets = sampleTeacherIdleOffsets(state.clock.elapsedTime, modeRef.current);
    const lerp = 1 - Math.exp(-8 * delta);

    if (anchorRef.current) {
      anchorRef.current.position.x = THREE.MathUtils.lerp(
        anchorRef.current.position.x,
        anchor.position.x + offsets.weightX,
        lerp,
      );
    }

    if (breathRef.current) {
      breathRef.current.position.y = THREE.MathUtils.lerp(
        breathRef.current.position.y,
        offsets.chestY,
        lerp,
      );
    }
  });

  return (
    <group ref={anchorRef} name="teacher_avatar" scale={[1, 1, 1]}>
      <group ref={breathRef} scale={[1, 1, 1]}>
        <Suspense fallback={null}>
          <GaneshaModel
            variant="teacher"
            embedded
            animate
            targetHeight={anchor.height}
          />
        </Suspense>
      </group>
    </group>
  );
}

/** @deprecated Use TeacherAvatar */
export const TeacherAnchor = TeacherAvatar;
