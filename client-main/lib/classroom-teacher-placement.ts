import * as THREE from "three";
import {
  TEACHER_HEIGHT_MAX_M,
  TEACHER_HEIGHT_MIN_M,
  resolveTeacherHeightM,
} from "@/lib/classroom/teacher-presence";

export const TEACHER_AVATAR_HEIGHT_M = 1.72;

export interface TeacherAnchorState {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  height: number;
}

/**
 * Teacher centered in front of the board, feet on floor, human scale (1.65–1.8 m).
 */
export function resolveTeacherAnchor(
  boardBounds: THREE.Box3,
  studentSeat: THREE.Vector3,
  floorY: number,
  classDirection: THREE.Vector3,
): TeacherAnchorState {
  const boardCenter = boardBounds.getCenter(new THREE.Vector3());
  const boardSize = boardBounds.getSize(new THREE.Vector3());
  const boardHeight = Math.max(boardSize.y, 0.9);

  const height = resolveTeacherHeightM(boardHeight);

  const position = new THREE.Vector3(boardCenter.x, floorY, boardCenter.z);
  position.add(
    classDirection.clone().multiplyScalar(Math.max(boardSize.z * 0.35 + 0.48, 0.52)),
  );

  const lookAt = studentSeat.clone();
  lookAt.y = floorY + height * 0.42;

  return {
    position,
    lookAt,
    height: THREE.MathUtils.clamp(height, TEACHER_HEIGHT_MIN_M, TEACHER_HEIGHT_MAX_M),
  };
}

/** Hard clamp after GLB scaling so the mesh can never explode. */
export function clampTeacherRootScale(
  root: THREE.Object3D,
  targetHeightM: number,
): void {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (!Number.isFinite(size.y) || size.y < 0.01) return;

  if (size.y > TEACHER_HEIGHT_MAX_M * 1.08) {
    const factor = targetHeightM / size.y;
    root.scale.multiplyScalar(factor);
    root.updateMatrixWorld(true);
  }
}
