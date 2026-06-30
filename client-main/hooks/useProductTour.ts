"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PRODUCT_TOUR_STEPS,
  PRODUCT_TOUR_STORAGE_KEY,
  type ProductTourStep,
} from "@/lib/onboarding/product-tour-steps";

export function useProductTour(enabled: boolean) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = PRODUCT_TOUR_STEPS;
  const step: ProductTourStep = steps[stepIndex] ?? steps[0];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex >= steps.length - 1;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (localStorage.getItem(PRODUCT_TOUR_STORAGE_KEY) === "true") return;
    const timer = window.setTimeout(() => setActive(true), 900);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  const complete = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PRODUCT_TOUR_STORAGE_KEY, "true");
    }
    setActive(false);
  }, []);

  const next = useCallback(() => {
    if (isLast) {
      complete();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [complete, isLast, steps.length]);

  const previous = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        skip();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, previous, skip]);

  return {
    active,
    step,
    stepIndex,
    totalSteps: steps.length,
    isFirst,
    isLast,
    next,
    previous,
    skip,
    complete,
  };
}
