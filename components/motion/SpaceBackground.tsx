"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useTheme } from "@/lib/theme";

const ACCENT = "14, 116, 188";
const MAX_DPR = 1.5;
const MIN_FPS = 30;
const DEGRADE_WINDOW_MS = 2000;

/**
 * Three depth bands, back to front. Parallax scales with apparent nearness —
 * the near band travels much further per pixel scrolled than the far one —
 * which is what reads as "moving through a room" rather than a flat scroll.
 */
const LAYERS = [
  { density: 26000, size: 1.2, drift: 0.06, parallax: 0.0006, alpha: 0.42 },
  { density: 19000, size: 1.7, drift: 0.09, parallax: 0.0013, alpha: 0.62 },
  { density: 13000, size: 2.4, drift: 0.14, parallax: 0.0022, alpha: 0.88 },
] as const;

/** Widest "spawn" spread (fraction of a particle's full-screen offset from
    centre) and how much scroll pushes it out from there before it wraps. */
const SPREAD_MIN = 0.72;
const SPREAD_RANGE = 1.95;

type Particle = {
  /** Fixed full-screen home position — its offset from centre is scaled
      out as the field flies forward, so the field always fills the frame
      and never collapses to a point. */
  bx: number;
  by: number;
  /** Position in the 0..1 fly-forward cycle. */
  depth: number;
  drift: number;
  phase: number;
};

function prefersSaveData() {
  const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

/**
 * Fixed, full-viewport particle field behind every page — the site's base
 * layer rather than a flat colour. Negative z-index puts it behind normal
 * in-flow content in the same stacking context (see `layout.tsx`), so any
 * section with its own background simply covers it; it only shows through
 * the bare stretches between panels. Scrolling streams the particles
 * outward from the centre — each depth band at its own rate — so it reads
 * as flying forward through the field, not panning across a wallpaper.
 */
export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  // Only used to re-read `--particle-alpha` when the palette flips — the
  // field is drawn to a canvas, so it can't inherit the token the way the
  // rest of the site does.
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced || prefersSaveData()) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const alphaScale =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--particle-alpha"),
      ) || 1;

    let width = 0;
    let height = 0;
    let bands: Particle[][] = [];
    let frameId = 0;
    let paused = document.visibilityState === "hidden";
    let degraded = false;
    let stopped = false;
    let lastFrameTime = performance.now();
    let slowFrameStart: number | null = null;
    let scrollY = window.scrollY;

    function seed(scale = 1) {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      bands = LAYERS.map((layer) => {
        const count = Math.round(((width * height) / layer.density) * scale);
        return Array.from({ length: count }, () => ({
          bx: Math.random() * width,
          by: Math.random() * height,
          depth: Math.random(),
          drift: (Math.random() - 0.5) * layer.drift * 0.001,
          phase: Math.random() * Math.PI * 2,
        }));
      });
    }

    function onScroll() {
      scrollY = window.scrollY;
    }

    function tick(now: number) {
      if (stopped) return;
      frameId = requestAnimationFrame(tick);
      if (paused) {
        lastFrameTime = now;
        slowFrameStart = null;
        return;
      }

      const frameDuration = now - lastFrameTime;
      lastFrameTime = now;

      // Adaptive degrade: a sustained sub-30fps stretch halves particle
      // counts once, then drops the layer entirely if still slow — this runs
      // on every page, so it has to give up gracefully on weak hardware.
      if (frameDuration > 1000 / MIN_FPS) {
        slowFrameStart ??= now;
        if (now - slowFrameStart > DEGRADE_WINDOW_MS) {
          slowFrameStart = null;
          if (!degraded) {
            degraded = true;
            seed(0.5);
          } else {
            stopped = true;
            ctx!.clearRect(0, 0, width, height);
            return;
          }
        }
      } else {
        slowFrameStart = null;
      }

      ctx!.clearRect(0, 0, width, height);

      // Scroll advances every particle through a 0..1 cycle; its offset from
      // the screen centre is scaled from SPREAD_MIN (a full-frame spread —
      // never a point) outward past the edge, growing as it goes. Reads as
      // flying forward into the field; the wrap happens off-screen.
      const cx = width / 2;
      const cy = height / 2;

      LAYERS.forEach((layer, i) => {
        const push = scrollY * layer.parallax;
        for (const p of bands[i]) {
          p.depth += p.drift;
          const d = (((p.depth + push) % 1) + 1) % 1;

          // Fade fully in and out across the travel so the off-screen wrap
          // is never seen — no particle blinking into existence mid-field.
          const life = 1 - Math.abs(d - 0.45) / 0.45;
          if (life <= 0) continue;

          const factor = SPREAD_MIN + d * SPREAD_RANGE;
          const drawX = cx + (p.bx - cx) * factor;
          const drawY = cy + (p.by - cy) * factor;
          const twinkle = 0.7 + 0.3 * Math.sin(now / 600 + p.phase);

          ctx!.fillStyle = `rgba(${ACCENT}, ${layer.alpha * twinkle * life * alphaScale})`;
          ctx!.beginPath();
          ctx!.arc(drawX, drawY, layer.size * (0.6 + d * 1.6), 0, Math.PI * 2);
          ctx!.fill();
        }
      });
    }

    seed();
    frameId = requestAnimationFrame(tick);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => seed(degraded ? 0.5 : 1), 150);
    }

    function onVisibility() {
      paused = document.visibilityState === "hidden";
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, theme]);

  if (reduced) return null;

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Cheap depth cue: corners recede a touch darker, like a lit room
          rather than a flat print. */}
      <div className="absolute inset-0 [background:radial-gradient(120%_90%_at_50%_20%,transparent,var(--vignette))]" />
    </div>
  );
}
