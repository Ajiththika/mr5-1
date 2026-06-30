"use client";

import { Armchair, X } from "lucide-react";
import type { ClassroomSeatSlot } from "@/lib/classroom/seat-grid";

const ROWS = [
  { label: "Front row", ids: [1, 2, 3] },
  { label: "Middle row", ids: [4, 5, 6] },
  { label: "Back row", ids: [7, 8, 9] },
] as const;

export function SeatSelectionOverlay({
  seats,
  selectedId,
  onSelect,
  onConfirm,
  onClose,
}: {
  seats: ClassroomSeatSlot[];
  selectedId: number;
  onSelect: (id: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const seatMap = new Map(seats.map((s) => [s.id, s]));

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-40 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Choose your seat"
    >
      <div className="classroom-glass w-full max-w-sm rounded-2xl border border-white/15 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Choose your seat</h2>
            <p className="text-xs text-white/60">
              Seat 3 (front-right) is recommended for the best view.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {ROWS.map((row) => (
            <div key={row.label}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                {row.label}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {row.ids.map((id) => {
                  const available = seatMap.has(id);
                  const active = id === selectedId;
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={!available}
                      onClick={() => onSelect(id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-sm transition ${
                        active
                          ? "border-amber-400/60 bg-amber-400/15 text-amber-100"
                          : available
                            ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                            : "border-white/5 text-white/30"
                      }`}
                      aria-pressed={active}
                    >
                      <Armchair className="h-5 w-5" />
                      <span>{id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Confirm seat {selectedId}
        </button>
      </div>
    </div>
  );
}
