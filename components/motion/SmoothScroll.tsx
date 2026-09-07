"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/lib/reduced-motion";
import { getLenisInstance, setLenisInstance } from "@/lib/lenisStore";

/**
 * Initializes Lenis smooth scroll on the window. Skipped under reduced
 * motion — including the manual footer toggle, which is why this reads the
 * shared hook rather than `matchMedia` directly. Flipping the preference
 * tears Lenis down (or brings it back) without a reload.
 */
export function SmoothScroll() {
  const reduce = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    setLenisInstance(lenis);

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      setLenisInstance(null);
      lenis.destroy();
    };
  }, [reduce]);

  // This is an SPA route change, not a full navigation — the browser never
  // resets scroll on its own, and Lenis holds its own virtual position on
  // top of that, so a plain `window.scrollTo` gets fought back to the old
  // spot on the next tick. `lenis.scrollTo` resets Lenis's own target too.
  useEffect(() => {
    const lenis = getLenisInstance();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
