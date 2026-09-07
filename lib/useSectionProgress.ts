"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

/**
 * Progress 0..1 of a pinned section as it scrolls through the viewport —
 * `0` when its top hits the top of the viewport, `1` when its bottom hits
 * the bottom.
 *
 * Read straight from the section's live `getBoundingClientRect()` on every
 * animation frame, so it is always exactly in step with wherever Lenis'
 * eased scroll has actually painted the page. Motion's own `useScroll`
 * keeps a separate cached measurement that drifts against Lenis and made
 * the pinned fly-throughs feel like the scroll was jamming.
 */
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? -rect.top / span : 0;
      const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
      if (clamped !== progress.get()) progress.set(clamped);
    };

    const loop = () => {
      measure();
      frame = requestAnimationFrame(loop);
    };

    measure();
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [ref, progress]);

  return progress;
}
