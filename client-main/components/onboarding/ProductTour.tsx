"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";
import { useProductTour } from "@/hooks/useProductTour";
import type { ProductTourPlacement } from "@/lib/onboarding/product-tour-steps";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 10;
const TOOLTIP_GAP = 14;
const TOOLTIP_W = 360;

function measureTarget(targetId?: string): Rect | null {
  if (!targetId || typeof document === "undefined") return null;
  const ids = targetId.split("|");
  for (const id of ids) {
    const el = document.querySelector(`[data-tour-id="${id.trim()}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width >= 1 && r.height >= 1) {
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    }
  }
  return null;
}

function tooltipPosition(
  target: Rect | null,
  placement: ProductTourPlacement,
  viewportW: number,
  viewportH: number,
) {
  if (!target || placement === "center") {
    return {
      top: Math.max(24, viewportH / 2 - 120),
      left: Math.max(16, (viewportW - TOOLTIP_W) / 2),
      arrow: null as null | { top: number; left: number; rotate: number },
    };
  }

  const cx = target.left + target.width / 2;
  const cy = target.top + target.height / 2;
  let top = target.top + target.height + TOOLTIP_GAP;
  let left = cx - TOOLTIP_W / 2;
  let arrowTop = -8;
  let arrowLeft = TOOLTIP_W / 2 - 8;
  let arrowRotate = 0;

  if (placement === "top") {
    top = target.top - TOOLTIP_GAP - 200;
    arrowTop = 192;
    arrowRotate = 180;
  } else if (placement === "left") {
    top = cy - 100;
    left = target.left - TOOLTIP_W - TOOLTIP_GAP;
    arrowTop = 96;
    arrowLeft = TOOLTIP_W - 4;
    arrowRotate = 90;
  } else if (placement === "right") {
    top = cy - 100;
    left = target.left + target.width + TOOLTIP_GAP;
    arrowTop = 96;
    arrowLeft = -8;
    arrowRotate = -90;
  }

  left = Math.max(16, Math.min(left, viewportW - TOOLTIP_W - 16));
  top = Math.max(16, Math.min(top, viewportH - 220));

  return {
    top,
    left,
    arrow: { top: arrowTop, left: arrowLeft, rotate: arrowRotate },
  };
}

export function ProductTour({ enabled }: { enabled: boolean }) {
  const {
    active,
    step,
    stepIndex,
    totalSteps,
    isFirst,
    isLast,
    next,
    previous,
    skip,
  } = useProductTour(enabled);

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltip, setTooltip] = useState<ReturnType<typeof tooltipPosition> | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  const remeasure = useCallback(() => {
    const rect = measureTarget(step.targetId);
    setTargetRect(rect);
    if (typeof window === "undefined") return;
    setTooltip(
      tooltipPosition(
        rect,
        step.placement ?? "bottom",
        window.innerWidth,
        window.innerHeight,
      ),
    );
    if (rect && step.targetId) {
      for (const id of step.targetId.split("|")) {
        const el = document.querySelector(`[data-tour-id="${id.trim()}"]`);
        if (el) {
          el.scrollIntoView({ block: "nearest", behavior: "smooth" });
          break;
        }
      }
    }
  }, [step.placement, step.targetId]);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!active) return;
    remeasure();
    const onResize = () => remeasure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [active, remeasure, stepIndex]);

  if (!mounted || !active || !tooltip) return null;

  const highlight = targetRect
    ? {
        top: targetRect.top - PAD,
        left: targetRect.left - PAD,
        width: targetRect.width + PAD * 2,
        height: targetRect.height + PAD * 2,
      }
    : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal="true"
      aria-label={`Product tour step ${stepIndex + 1} of ${totalSteps}`}
    >
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity"
        onClick={skip}
        aria-hidden
      />

      {highlight && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all duration-300"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
          }}
        />
      )}

      <div
        className="pointer-events-auto absolute w-[min(100vw-2rem,360px)] rounded-2xl border border-white/10 bg-zinc-900/95 p-5 text-white shadow-2xl transition-all duration-300"
        style={{ top: tooltip.top, left: tooltip.left }}
      >
        {tooltip.arrow && (
          <div
            className="absolute h-4 w-4 rotate-45 border-l border-t border-white/10 bg-zinc-900/95"
            style={{
              top: tooltip.arrow.top,
              left: tooltip.arrow.left,
              transform: `rotate(${tooltip.arrow.rotate + 45}deg)`,
            }}
            aria-hidden
          />
        )}

        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-snug">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{step.body}</p>
        <p className="mt-3 text-sm font-medium text-sky-300">{step.action}</p>
        {step.tamilHint && (
          <p className="mt-2 text-xs italic text-amber-200/80">{step.tamilHint}</p>
        )}
        {step.tip && (
          <p className="mt-2 text-xs text-zinc-500">{step.tip}</p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === stepIndex ? "bg-white" : "bg-white/25"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={previous}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/10"
              >
                Previous
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
            >
              {isLast ? "Finish" : "Next"}
              {!isLast && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={skip}
          className="mt-3 w-full text-center text-xs text-zinc-500 transition hover:text-zinc-300"
        >
          Skip tour
        </button>
      </div>
    </div>,
    document.body,
  );
}
