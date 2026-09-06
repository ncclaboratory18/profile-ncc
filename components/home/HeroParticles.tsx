"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/reduced-motion";

const ACCENT = "14, 116, 188";
const MAX_LINK_DIST = 140;
const PARTICLE_DENSITY = 16000; // px^2 per particle
const MAX_DPR = 1.5;
const MIN_FPS = 30;
const DEGRADE_WINDOW_MS = 2000;

type Particle = { x: number; y: number; vx: number; vy: number };

function prefersSaveData() {
  const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced || prefersSaveData()) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frameId = 0;
    let inView = true;
    let paused = false;
    let degraded = false;
    let stopped = false;
    let lastFrameTime = performance.now();
    let slowFrameStart: number | null = null;

    function seed(count?: number) {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = count ?? Math.round((width * height) / PARTICLE_DENSITY);
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }));
    }

    function tick(now: number) {
      if (stopped) return;
      frameId = requestAnimationFrame(tick);

      const frameDuration = now - lastFrameTime;
      lastFrameTime = now;

      if (paused) {
        slowFrameStart = null;
        return;
      }

      // Adaptive degrade: a sustained sub-30fps stretch halves the particle
      // count once, then gives up on the canvas entirely if still slow.
      if (frameDuration > 1000 / MIN_FPS) {
        slowFrameStart ??= now;
        if (now - slowFrameStart > DEGRADE_WINDOW_MS) {
          slowFrameStart = null;
          if (!degraded) {
            degraded = true;
            seed(Math.ceil(particles.length / 2));
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

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < MAX_LINK_DIST) {
            const alpha = (1 - dist / MAX_LINK_DIST) * 0.12;
            ctx!.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx!.fillStyle = `rgba(${ACCENT}, 0.5)`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    seed();
    frameId = requestAnimationFrame(tick);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => seed(degraded ? particles.length : undefined), 150);
    }
    window.addEventListener("resize", onResize);

    function syncPaused() {
      paused = !inView || document.visibilityState === "hidden";
    }

    document.addEventListener("visibilitychange", syncPaused);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncPaused();
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", syncPaused);
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-80"
      aria-hidden="true"
    />
  );
}
