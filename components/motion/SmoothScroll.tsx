"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "@/lib/reduced-motion";

/**
 * Initializes Lenis smooth scroll on the window. Skipped under reduced
 * motion — including the manual footer toggle, which is why this reads the
 * shared hook rather than `matchMedia` directly. Flipping the preference
 * tears Lenis down (or brings it back) without a reload.
 */
export function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
