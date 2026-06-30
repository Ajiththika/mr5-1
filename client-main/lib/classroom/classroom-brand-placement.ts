import * as THREE from "three";

import { MR5_LOGO_ASPECT, MR5_LOGO_PATH } from "@/lib/brand/logo";

/** High-res MR5 crest for crisp in-scene stickers. */
export const MR5_LOGO_URL = MR5_LOGO_PATH;

/** Large back-wall sticker — visible but premium. */
export const MR5_WALL_STICKER_OPACITY = 0.22;

/** Small desk / board corner stickers. */
export const MR5_SURFACE_STICKER_OPACITY = 0.42;

export interface WallStickerPlacement {
  position: THREE.Vector3;
  width: number;
  height: number;
  rotationY: number;
}

export interface SurfaceStickerPlacement {
  position: THREE.Vector3;
  width: number;
  height: number;
  /** Euler rotation for sticker plane. */
  rotation: [number, number, number];
}

export interface ClassroomBrandPlacements {
  wall: WallStickerPlacement;
  board: SurfaceStickerPlacement;
  desks: SurfaceStickerPlacement[];
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
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

function getBackWallBounds(
  root: THREE.Object3D,
  boardBounds: THREE.Box3,
): THREE.Box3 | null {
  const boardZ = boardBounds.getCenter(new THREE.Vector3()).z;
  let best: THREE.Box3 | null = null;
  let bestScore = Infinity;

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const raw = child.name.toLowerCase();
    if (raw.includes("window") || raw.includes("door")) return;

    const key = normalizeName(child.name);
    if (!/^wall\d*$/.test(key)) return;

    const meshBox = new THREE.Box3().setFromObject(child);
    const sizeX = meshBox.max.x - meshBox.min.x;
    const sizeY = meshBox.max.y - meshBox.min.y;
    if (sizeX < 1.2 || sizeY < 1.8) return;

    const centerZ = meshBox.getCenter(new THREE.Vector3()).z;
    const score = Math.abs(centerZ - boardZ);
    if (score < bestScore) {
      bestScore = score;
      best = meshBox;
    }
  });

  return best;
}

function classAxes(classDirection: THREE.Vector3) {
  const forward = classDirection.clone().setY(0).normalize();
  const side = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), forward)
    .normalize();
  const rotationY =
    forward.lengthSq() > 0.0001 ? Math.atan2(-forward.x, -forward.z) : 0;
  return { forward, side, rotationY };
}

/** Big centered crest on the back wall blank panel. */
export function deriveWallStickerPlacement(
  root: THREE.Object3D,
  classDirection?: THREE.Vector3,
): WallStickerPlacement {
  root.updateWorldMatrix(true, true);

  const roomBox = new THREE.Box3().setFromObject(root);
  const boardBounds =
    getMeshBounds(root, ["board"]) ??
    new THREE.Box3(
      new THREE.Vector3(-1.8, 1.2, -3.9),
      new THREE.Vector3(1.8, 2.4, -3.4),
    );

  const backWall = getBackWallBounds(root, boardBounds);
  const boardTop = boardBounds.max.y;
  const wallTop = backWall?.max.y ?? roomBox.max.y;
  const centerX = backWall
    ? (backWall.min.x + backWall.max.x) * 0.5
    : (boardBounds.min.x + boardBounds.max.x) * 0.5;

  const panelBottom = boardTop + 0.15;
  const panelTop = wallTop - 0.18;
  const centerY =
    panelTop > panelBottom
      ? (panelBottom + panelTop) * 0.5
      : boardTop + (wallTop - boardTop) * 0.5;

  const wallZ = backWall
    ? backWall.max.z + 0.014
    : boardBounds.max.z - 0.035;

  const wallWidth = backWall
    ? backWall.max.x - backWall.min.x
    : boardBounds.max.x - boardBounds.min.x;
  const width = THREE.MathUtils.clamp(wallWidth * 0.42, 1.65, 2.45);
  const height = width * MR5_LOGO_ASPECT;

  const { rotationY } = classAxes(
    classDirection ?? new THREE.Vector3(0, 0, -1),
  );

  return {
    position: new THREE.Vector3(centerX, centerY, wallZ),
    width,
    height,
    rotationY,
  };
}

/** Top-left crest on the teaching board face. */
export function deriveBoardStickerPlacement(
  boardBounds: THREE.Box3,
  classDirection: THREE.Vector3,
): SurfaceStickerPlacement {
  const size = boardBounds.getSize(new THREE.Vector3());
  const center = boardBounds.getCenter(new THREE.Vector3());
  const { forward, side, rotationY } = classAxes(classDirection);

  const width = THREE.MathUtils.clamp(size.x * 0.14, 0.14, 0.22);
  const height = width * MR5_LOGO_ASPECT;

  const position = center
    .clone()
    .add(new THREE.Vector3(0, size.y * 0.36, 0))
    .add(side.clone().multiplyScalar(-size.x * 0.36))
    .add(forward.clone().multiplyScalar(size.z * 0.5 + 0.01));

  return {
    position,
    width,
    height,
    rotation: [0, rotationY, 0],
  };
}

function isStudentDeskChair(name: string) {
  const key = normalizeName(name);
  return key.includes("chair") && !key.includes("teacher");
}

/** Top-left crest on every student desk surface. */
export function deriveDeskStickerPlacements(
  root: THREE.Object3D,
  classDirection: THREE.Vector3,
): SurfaceStickerPlacement[] {
  root.updateWorldMatrix(true, true);
  const { forward, side, rotationY } = classAxes(classDirection);
  const placements: SurfaceStickerPlacement[] = [];
  const seen = new Set<string>();

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (!isStudentDeskChair(child.name)) return;

    const bounds = new THREE.Box3().setFromObject(child);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const key = `${center.x.toFixed(2)}:${center.z.toFixed(2)}`;
    if (seen.has(key)) return;
    seen.add(key);

    const width = THREE.MathUtils.clamp(Math.min(size.x, size.z) * 0.18, 0.07, 0.11);
    const height = width * MR5_LOGO_ASPECT;
    const topY = bounds.max.y - 0.012;

    const position = center
      .clone()
      .add(forward.clone().multiplyScalar(-size.z * 0.28))
      .add(side.clone().multiplyScalar(-size.x * 0.3));
    position.y = topY;

    placements.push({
      position,
      width,
      height,
      rotation: [-Math.PI / 2, rotationY, 0],
    });
  });

  return placements;
}

export function deriveClassroomBrandPlacements(
  root: THREE.Object3D,
  classDirection: THREE.Vector3,
  boardBounds?: THREE.Box3,
): ClassroomBrandPlacements {
  const board =
    boardBounds ??
    getMeshBounds(root, ["board"]) ??
    new THREE.Box3(
      new THREE.Vector3(-1.8, 1.2, -3.9),
      new THREE.Vector3(1.8, 2.4, -3.4),
    );

  return {
    wall: deriveWallStickerPlacement(root, classDirection),
    board: deriveBoardStickerPlacement(board, classDirection),
    desks: deriveDeskStickerPlacements(root, classDirection),
  };
}

// Back-compat aliases used by older imports.
export const MR5_WALL_LOGO_URL = MR5_LOGO_URL;
export const MR5_WALL_LOGO_OPACITY = MR5_WALL_STICKER_OPACITY;
export type WallWatermarkPlacement = WallStickerPlacement;
export const deriveWallWatermarkPlacement = deriveWallStickerPlacement;
