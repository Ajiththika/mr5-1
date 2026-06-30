import * as THREE from "three";
import type { ChairSeat } from "@/lib/classroom-seat";

export const DEFAULT_SEAT_ID = 3;

export type SeatRow = "front" | "middle" | "back";

export interface ClassroomSeatSlot {
  id: number;
  label: string;
  row: SeatRow;
  surface: THREE.Vector3;
  bounds: THREE.Box3;
}

const ROW_NAMES: SeatRow[] = ["front", "middle", "back"];
const ROW_BASE_IDS = [1, 4, 7] as const;

function pickThreePerRow(row: ChairSeat[]): ChairSeat[] {
  if (!row.length) return [];
  const sorted = [...row].sort((a, b) => a.surface.x - b.surface.x);
  if (sorted.length <= 3) return sorted.slice(0, 3);
  return [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted[sorted.length - 1]];
}

function clusterThreeRows(chairs: ChairSeat[], board: THREE.Vector3): ChairSeat[][] {
  const sorted = [...chairs].sort(
    (a, b) => a.surface.distanceTo(board) - b.surface.distanceTo(board),
  );
  const third = Math.max(1, Math.floor(sorted.length / 3));
  return [
    sorted.slice(0, third),
    sorted.slice(third, third * 2),
    sorted.slice(third * 2),
  ];
}

/** Build a fixed 3×3 seat grid (IDs 1–9). */
export function buildClassroomSeatGrid(
  chairs: ChairSeat[],
  board: THREE.Vector3,
  _floorY: number,
): ClassroomSeatSlot[] {
  if (!chairs.length) return [];

  const rows = clusterThreeRows(chairs, board);
  const grid: ClassroomSeatSlot[] = [];

  rows.forEach((cluster, rowIndex) => {
    const picked = pickThreePerRow(cluster);
    const baseId = ROW_BASE_IDS[rowIndex] ?? 7;
    picked.forEach((chair, colIndex) => {
      grid.push({
        id: baseId + colIndex,
        label: `Seat ${baseId + colIndex}`,
        row: ROW_NAMES[rowIndex] ?? "back",
        surface: chair.surface.clone(),
        bounds: chair.bounds.clone(),
      });
    });
  });

  return grid.sort((a, b) => a.id - b.id);
}

export function resolveSeatSlot(
  grid: ClassroomSeatSlot[],
  seatId: number,
): ClassroomSeatSlot | null {
  return grid.find((s) => s.id === seatId) ?? null;
}
