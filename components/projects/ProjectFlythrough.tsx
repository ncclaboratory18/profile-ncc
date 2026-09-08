"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import {
  motion,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useSectionProgress } from "@/lib/useSectionProgress";
import type { Project } from "@/lib/types";

const COLS = 7;
const ROWS = 5;

/** Size of the full image when the reveal is open — nearly the whole
    viewport, but strictly *under* it (96vw / 92vh) so it can never add
    scrollable height even if a 3D transform context defeats the sticky's
    `overflow: clip`. The card thumbnail shows the centre crop at this exact
    size, so opening the reveal grows the window, it doesn't zoom. */
const REVEAL_W = "96vw";
const REVEAL_H = "92vh";

/**
 * Projects flown past the viewer, one per scroll slot. A card sweeps in from
 * far off its own side (small, turned, blurred), arcs diagonally to dead
 * centre where it is large and sharp, then carries on toward the camera and
 * out as the next arrives from the opposite side. Scrolling up runs it
 * backward. Reduced motion → a plain stacked list.
 *
 * Hovering the centred card flips its thumbnail open a tile at a time — the
 * grid of tiles rotates in on a diagonal wave until the full image fills the
 * space behind the card. Scrolling snaps it shut fast.
 */
export function ProjectFlythrough({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const scrollYProgress = useSectionProgress(ref);
  const count = projects.length;

  // One shared pointer position — hit-testing against it opens a card's
  // reveal even when the card slid under a resting cursor (no mouse event).
  const pointerRef = useRef({ x: -1, y: -1 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (reduce || count === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {projects.map((project) => (
            <ProjectPanel key={project.id} project={project} />
          ))}
        </div>
      </section>
    );
  }

  // `overflow-x: clip` on the section (x only, not a scroll container, the
  // sticky's y axis stays `visible`) trims the fly-in cards and the tile
  // reveal without any risk to the pin or Lenis.
  return (
    <section
      ref={ref}
      className="relative [overflow-x:clip]"
      style={{ height: `${count * 100}vh` }}
    >
      {/* `pt-16` (the sticky nav height) so the deck and its tile-reveal
          centre in the space *below* the nav, not the raw viewport. */}
      <div className="sticky top-0 flex h-screen items-center justify-center pt-16 [perspective:1200px]">
        {projects.map((project, i) => (
          <FlyCard
            key={project.id}
            project={project}
            index={i}
            count={count}
            progress={scrollYProgress}
            fromLeft={i % 2 === 0}
            pointerRef={pointerRef}
          />
        ))}
      </div>
    </section>
  );
}

function FlyCard({
  project,
  index,
  count,
  progress,
  fromLeft,
  pointerRef,
}: {
  project: Project;
  index: number;
  count: number;
  progress: MotionValue<number>;
  fromLeft: boolean;
  pointerRef: RefObject<{ x: number; y: number }>;
}) {
  // Each card owns a slot of scroll progress; `local` runs -1 (arriving from
  // the side, far) -> 0 (dead centre) -> 1 (past the viewer). Slots are
  // `2·halfSlot` wide and butt up against each other, and the last card's
  // exit ramp lands exactly at progress 1 — so the fly-through ends as the
  // last card clears the viewer, right at the footer, with no dead scroll.
  // A short `hold` plateau in the middle gives a beat to read and hover.
  const seg = 1 / count;
  const centre = seg * (index + 0.45);
  const halfSlot = seg * 0.55;
  const hold = seg * 0.14;
  const local = useTransform(
    progress,
    [centre - halfSlot, centre - hold, centre + hold, centre + halfSlot],
    [-1, 0, 0, 1],
    { clamp: true },
  );

  const x = useTransform(
    local,
    [-1, 0, 1],
    fromLeft ? ["-48vw", "0vw", "14vw"] : ["48vw", "0vw", "-14vw"],
  );
  const z = useTransform(local, [-1, 0, 1], [-680, 0, 240]);
  const rotateY = useTransform(
    local,
    [-1, 0, 1],
    fromLeft ? [24, 0, -12] : [-24, 0, 12],
  );
  const scale = useTransform(local, [-1, 0, 1], [0.64, 1, 1.16]);
  const opacity = useTransform(
    local,
    [-1, -0.72, 0, 0.72, 1],
    [0, 0.5, 1, 0.35, 0],
  );
  const blur = useTransform(local, [-1, -0.28, 0, 0.28, 1], [8, 0.5, 0, 2, 7]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  // `near` (wide band) governs interactivity + whether the tile grid is
  // mounted; `centred` (tight band) governs whether the reveal may be open.
  const [near, setNear] = useState(false);
  useMotionValueEvent(local, "change", (v) => {
    const n = Math.abs(v) < 0.72;
    setNear((prev) => (prev === n ? prev : n));
  });

  const zIndex = useTransform(local, (v) =>
    Math.round((near ? 600 : 120) - Math.abs(v) * 90),
  );
  // Hide well before the very edge so a big, faded, flying-past card can't
  // add scrollable height to the section (which reads as the scroll jamming).
  const visibility = useTransform(local, (v) =>
    Math.abs(v) >= 0.9 ? "hidden" : "visible",
  );

  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Open the reveal only while the card is dead-centred (in its hold
  // plateau) — that's the only time the full-bleed tile grid actually
  // covers the whole page. Hit-tests the shared pointer position, so it
  // fires even when the card slid under a resting cursor (no mouse event).
  const maybeOpen = useCallback(() => {
    if (Math.abs(local.get()) >= 0.1) return;
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const { x, y } = pointerRef.current;
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      setHovered(true);
    }
  }, [local, pointerRef]);

  // Collapses the moment the card leaves its centred plateau — so the
  // reveal is gone by the time the card itself starts to fade / move on.
  // (Hysteresis: opens < 0.1, closes >= 0.2.)
  useMotionValueEvent(local, "change", (v) => {
    if (Math.abs(v) >= 0.2) setHovered(false);
  });
  // Re-check on every scroll frame so a resting cursor opens it as the card
  // arrives (and it can reopen if it swung out and back).
  useMotionValueEvent(progress, "change", maybeOpen);

  return (
    <motion.article
      style={{ x, z, rotateY, scale, opacity, filter, zIndex, visibility }}
      className={`absolute w-[min(86vw,26rem)] will-change-transform [transform-style:preserve-3d] ${
        near ? "" : "pointer-events-none"
      }`}
    >
      <div
        ref={cardRef}
        className="relative"
        style={
          { "--reveal-w": REVEAL_W, "--reveal-h": REVEAL_H } as CSSProperties
        }
        onMouseMove={maybeOpen}
        onMouseLeave={() => setHovered(false)}
      >
        {near && project.images[0] && (
          <TileReveal image={project.images[0]} show={hovered} />
        )}
        <ProjectPanel project={project} />
      </div>
    </motion.article>
  );
}

/** Grid of image tiles that rotate open on a diagonal wave behind the card,
    assembling the picture across the whole viewport (the card was a cropped
    window onto this same full-frame image). */
function TileReveal({ image, show }: { image: string; show: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 grid -translate-x-1/2 -translate-y-1/2 [perspective:1000px]"
      style={{
        width: "var(--reveal-w, 100vw)",
        height: "var(--reveal-h, 100vh)",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
    >
      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const delayIn = (col + row) * 0.04;
        const delayOut = (COLS + ROWS - 2 - col - row) * 0.012;
        return (
          <motion.div
            key={i}
            className="[backface-visibility:hidden]"
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
            }}
            initial={false}
            // Rest at scale 1.02 so neighbouring tiles overlap and no dark
            // seams show between them once open.
            animate={
              show
                ? { rotateY: 0, opacity: 1, scale: 1.02 }
                : { rotateY: -95, opacity: 0, scale: 1 }
            }
            transition={{
              duration: show ? 0.5 : 0.2,
              delay: show ? delayIn : delayOut,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        );
      })}
    </div>
  );
}

function ProjectPanel({ project }: { project: Project }) {
  const done = project.status === "completed";
  const img = project.images[0];

  return (
    <Link
      href={`/projects/${project.id}`}
      className="relative block overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface/95 shadow-[0_40px_80px_-32px_var(--shadow-strong)] backdrop-blur-sm transition-colors hover:border-accent-blue-border-hover"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-surface-raised">
        {img && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${img})`,
              // Centre crop of the image at the reveal's full size, so the
              // card is a window onto exactly what the reveal shows.
              backgroundSize: "var(--reveal-w, 100vw) var(--reveal-h, 100vh)",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
        {project.status && (
          <span className="absolute right-3 top-3 rounded-[var(--radius-chip)] bg-bg-primary/70 px-2.5 py-1 font-mono text-[11px] font-medium text-text-secondary backdrop-blur-sm">
            {done ? "Completed" : "Ongoing"}
          </span>
        )}
      </div>
      <div className="p-6 sm:p-7">
        <h3 className="font-display text-xl font-semibold leading-tight text-text-primary sm:text-2xl">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-3 font-sans text-sm leading-relaxed text-text-secondary sm:text-[15px]">
          {project.description}
        </p>
        {project.year && (
          <p className="mt-3 font-mono text-xs text-text-tertiary">{project.year}</p>
        )}
      </div>
    </Link>
  );
}
