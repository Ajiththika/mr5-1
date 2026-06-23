"use client";

import { Suspense, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { GaneshaModel } from "@/components/3d/GaneshaModel";
import type { TeacherAnchorState } from "@/lib/classroom-teacher-placement";

export type { TeacherAnchorState };

/**
 * Teacher Avatar entity — grounded on classroom floor, in front of whiteboard,
 * rotated to face the student desk. Not a ceiling decoration.
 */
export function TeacherAvatar({ anchor }: { anchor: TeacherAnchorState }) {
  const anchorRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const node = anchorRef.current;
    if (!node) return;
    node.position.set(anchor.position.x, anchor.position.y, anchor.position.z);
    node.rotation.set(0, 0, 0);
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

  return (
    <group ref={anchorRef} name="teacher_avatar">
      <Suspense fallback={null}>
        <GaneshaModel variant="teacher" embedded targetHeight={anchor.height} />
      </Suspense>
    </group>
  );
}

/** @deprecated Use TeacherAvatar */
export const TeacherAnchor = TeacherAvatar;
