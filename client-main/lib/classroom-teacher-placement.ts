import * as THREE from "three";

/** Standard human teacher height in meters (1:1 classroom scale). */
export const TEACHER_AVATAR_HEIGHT_M = 1.65;

export interface TeacherAnchorState {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  height: number;
}

/**
 * Teacher at whiteboard front, grounded on floor, facing the student desk.
 */
export function resolveTeacherAnchor(
  boardBounds: THREE.Box3,
  studentSeat: THREE.Vector3,
  floorY: number,
  classDirection: THREE.Vector3,
): TeacherAnchorState {
  const boardCenter = boardBounds.getCenter(new THREE.Vector3());
  const boardSize = boardBounds.getSize(new THREE.Vector3());
  const boardSide = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), classDirection)
    .normalize();

  const position = boardCenter.clone();
  position.add(classDirection.clone().multiplyScalar(0.75));
  position.add(boardSide.clone().multiplyScalar(boardSize.x * 0.08));
  position.y = floorY;

  const lookAt = studentSeat.clone();
  lookAt.y = floorY + 1.48;

  return {
    position,
    lookAt,
    height: TEACHER_AVATAR_HEIGHT_M,
  };
}
