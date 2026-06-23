import * as THREE from "three";

const SEATED_EYE_ABOVE_SEAT = 0.58;
const SEAT_FORWARD_OFFSET = 0.12;
const SEAT_HEIGHT_RATIO = 0.56;

export interface ChairSeat {
  bounds: THREE.Box3;
  surface: THREE.Vector3;
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isChairMesh(name: string) {
  const key = normalizeName(name);
  return key.includes("chair") && !key.includes("teacher");
}

/** Collect per-chair seat surfaces from mesh bounding boxes. */
export function collectChairSeats(root: THREE.Object3D): ChairSeat[] {
  const seats: ChairSeat[] = [];

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (!isChairMesh(child.name)) return;

    const bounds = new THREE.Box3().setFromObject(child);
    if (!Number.isFinite(bounds.min.x)) return;

    const height = bounds.max.y - bounds.min.y;
    const surface = new THREE.Vector3(
      (bounds.min.x + bounds.max.x) * 0.5,
      bounds.min.y + height * SEAT_HEIGHT_RATIO,
      (bounds.min.z + bounds.max.z) * 0.5,
    );

    seats.push({ bounds, surface });
  });

  return seats;
}

/** Pick a back-row, center-aisle student chair facing the board. */
export function pickStudentChairSeat(
  seats: ChairSeat[],
  board: THREE.Vector3,
): ChairSeat | null {
  if (!seats.length) return null;

  const ranked = seats
    .map((seat) => ({
      seat,
      distance: seat.surface.distanceTo(board),
    }))
    .sort((a, b) => b.distance - a.distance);

  const backRow = ranked
    .filter((entry) => entry.distance >= ranked[0].distance - 0.5)
    .map((entry) => entry.seat);

  const pool = backRow.length ? backRow : seats;

  const best = pool.reduce((chosen, candidate) =>
    Math.abs(candidate.surface.x) < Math.abs(chosen.surface.x)
      ? candidate
      : chosen,
  );

  return best;
}

export interface SeatedViewPose {
  seat: THREE.Vector3;
  eye: THREE.Vector3;
  lookAt: THREE.Vector3;
  classDirection: THREE.Vector3;
}

/**
 * Compute seated student eye + look-at from chair seat and board.
 */
export function computeSeatedViewPose(
  chairSeat: THREE.Vector3,
  board: THREE.Vector3,
  floorY: number,
): SeatedViewPose {
  const classDirection = chairSeat.clone().sub(board);
  classDirection.y = 0;
  if (classDirection.lengthSq() < 0.01) {
    classDirection.set(0, 0, 1);
  }
  classDirection.normalize();

  const facingBoard = board.clone().sub(chairSeat);
  facingBoard.y = 0;
  if (facingBoard.lengthSq() < 0.01) {
    facingBoard.set(0, 0, -1);
  }
  facingBoard.normalize();

  const seat = chairSeat.clone();
  seat.y = Math.max(seat.y, floorY + 0.38);

  const eye = seat.clone().add(
    facingBoard.clone().multiplyScalar(SEAT_FORWARD_OFFSET),
  );
  eye.y = seat.y + SEATED_EYE_ABOVE_SEAT;

  const lookAt = board.clone();
  lookAt.y = board.y + 0.12;

  return { seat, eye, lookAt, classDirection };
}

export function resolveStudentSeatedPose(
  root: THREE.Object3D,
  board: THREE.Vector3,
  floorY: number,
): SeatedViewPose {
  const chairs = collectChairSeats(root);
  const picked = pickStudentChairSeat(chairs, board);

  if (picked) {
    return computeSeatedViewPose(picked.surface, board, floorY);
  }

  const fallbackSeat = board.clone();
  fallbackSeat.y = floorY + 0.42;
  fallbackSeat.z += board.z >= 0 ? -3.2 : 3.2;
  return computeSeatedViewPose(fallbackSeat, board, floorY);
}
