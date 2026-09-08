"use client";

import { useRef, useState } from "react";
import {
  motion,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useSectionProgress } from "@/lib/useSectionProgress";

type Area = { n: string; title: string; body: string };

/**
 * The lab's research areas as a corridor the viewer flies down. Cards are
 * mounted on alternating side "walls" (odd on the right, even on the left) —
 * they never cross to the centre. The camera moves straight forward: each
 * card starts far ahead on its side (small, hazy, faint), grows as it nears,
 * is sharp and prominent as it draws level with the viewer, then slides on
 * past and out. Several cards are visible at once, receding toward the
 * vanishing point. Scrolling up flies backward. Reduced motion → plain list.
 *
 * Hovering the front card — or the one right behind it — lights it (scale +
 * accent ring) and slides a short domino of blank cards straight out behind
 * it toward its own side; leaving, or scrolling past, collapses it.
 */
const AREAS: Area[] = [
  {
    n: "01",
    title: "Network Security",
    body: "Intrusion detection, secure protocol design, and adversarial analysis of networked systems.",
  },
  {
    n: "02",
    title: "Botnet Detection",
    body: "Identifying coordinated hosts from their traffic behaviour, and the command-and-control patterns that give a botnet away.",
  },
  {
    n: "03",
    title: "Steganography",
    body: "Hiding and recovering data inside ordinary carriers — images, audio, network traffic — and the analysis that detects it.",
  },
  {
    n: "04",
    title: "Digital Forensics",
    body: "Log analysis, incident reconstruction, and evidence-grade tooling for post-breach investigation.",
  },
  {
    n: "05",
    title: "Distributed Systems",
    body: "Consensus, replication, and reliability for large-scale data processing infrastructure.",
  },
  {
    n: "06",
    title: "Mobile & Pervasive Computing",
    body: "Resource-aware mobile services and context-driven applications across everyday devices.",
  },
  {
    n: "07",
    title: "Cloud Computing",
    body: "Elastic infrastructure, scheduling, and the cost–reliability trade-offs of running at scale.",
  },
  {
    n: "08",
    title: "IoT & Sensor Networks",
    body: "Low-power sensing, edge aggregation, and multimedia transport over constrained links.",
  },
];

/** Scroll height per area. The section used to hard-code a total tuned for six
    areas; deriving it keeps the fly-by speed the same as the list grows. */
const VH_PER_AREA = 70;

/** Camera position, in card-units, as scroll progress runs 0 -> 1. Starts
   almost level with the first card so it is close and prominent the instant
   the section pins; the travel is tuned so the last card is just leaving at
   p = 1 — the fly-through ends exactly as the pin releases into the footer,
   no dead scroll on either side. */
const camera = (p: number) => -0.08 + p * (AREAS.length + 0.25);

const activeAt = (p: number) =>
  Math.min(AREAS.length - 1, Math.max(0, Math.round(camera(p))));

export function ResearchFlythrough() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const scrollYProgress = useSectionProgress(ref);

  // Exactly one card is "active" (nearest the viewer) and interactive.
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const a = activeAt(p);
    setActiveIndex((prev) => (prev === a ? prev : a));
  });

  if (reduce) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {AREAS.map((area) => (
            <AreaCard key={area.n} area={area} />
          ))}
        </div>
      </section>
    );
  }

  // `overflow-x: clip` on the section (x only — the y axis the sticky pin
  // uses stays `visible`, and `clip` is not a scroll container) trims the
  // cards flying off the sides without any risk to the pin or Lenis.
  return (
    <section
      ref={ref}
      className="relative [overflow-x:clip]"
      style={{ height: `${AREAS.length * VH_PER_AREA}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center [perspective:1100px] [perspective-origin:50%_50%]">
        {AREAS.map((area, i) => (
          <FlyCard
            key={area.n}
            area={area}
            index={i}
            progress={scrollYProgress}
            fromLeft={i % 2 === 0}
            isActive={i === activeIndex}
            isNext={i === activeIndex + 1}
          />
        ))}
      </div>
    </section>
  );
}

function FlyCard({
  area,
  index,
  progress,
  fromLeft,
  isActive,
  isNext,
}: {
  area: Area;
  index: number;
  progress: MotionValue<number>;
  fromLeft: boolean;
  isActive: boolean;
  isNext: boolean;
}) {
  // Distance of this card ahead of the camera, in card-units: large positive
  // = far ahead, ~0 = level with the viewer, negative = passed.
  const relZ = useTransform(progress, (p) => index - camera(p));

  const lane = fromLeft ? -1 : 1;
  // Perspective scales by depth; translateZ sets it. A wide px span per
  // card-unit spreads consecutive cards far apart front-to-back.
  const z = useTransform(relZ, [-2, 0, 6], [430, 0, -6200], { clamp: true });
  // Distant cards sit nearer the centre (converging to the vanishing point),
  // the level card sits toward its side but well in from the wall, a passing
  // card drifts back to centre.
  const x = useTransform(
    relZ,
    [-1.6, 0, 6],
    fromLeft
      ? ["-24vw", "-15vw", "-5vw"]
      : ["24vw", "15vw", "5vw"],
    { clamp: true },
  );
  // Fixed inward tilt — orientation, not motion — so cards read as wall-hung.
  const rotateY = lane * -9;
  const blur = useTransform(
    relZ,
    [-1.6, -0.1, 0.35, 6],
    [7, 0, 0, 9],
    { clamp: true },
  );
  const filter = useMotionTemplate`blur(${blur}px)`;
  const opacity = useTransform(
    relZ,
    [-1.3, -0.45, 0.15, 2.2, 6.1],
    [0, 0.4, 1, 0.55, 0.1],
    { clamp: true },
  );
  // The front card and the one right behind it are both interactive; the
  // front sits well clear on top, the next just above the rest.
  const interactive = isActive || isNext;
  const zIndex = useTransform(relZ, (v) =>
    Math.round((isActive ? 900 : isNext ? 700 : 400) - v * 40),
  );
  const visibility = useTransform(relZ, (v) =>
    v < -1.35 || v > 6.2 ? "hidden" : "visible",
  );

  // Hover fans a straight "domino" of blank cards out behind this one,
  // linearly to its own side. Losing interactivity (a scroll past it)
  // collapses it again.
  const [hovered, setHovered] = useState(false);
  if (!interactive && hovered) setHovered(false);

  const GHOSTS = [0, 1, 2, 3];

  return (
    <motion.article
      style={{ x, z, rotateY, filter, opacity, zIndex, visibility }}
      className={`absolute aspect-[3/4] w-[min(76vw,21rem)] will-change-transform [transform-style:preserve-3d] ${
        interactive ? "" : "pointer-events-none"
      }`}
    >
      <div
        className="relative h-full w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {GHOSTS.map((k) => (
          <motion.div
            key={k}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] border border-hairline bg-bg-surface/85 shadow-[0_30px_70px_-28px_var(--shadow-strong)]"
            style={{ zIndex: -1 - k }}
            initial={false}
            animate={
              hovered
                ? {
                    x: `${lane * (k + 1) * 22}%`,
                    scale: 1 - (k + 1) * 0.02,
                    opacity: 0.6 - k * 0.13,
                  }
                : { x: 0, scale: 1, opacity: 0 }
            }
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 30,
              delay: hovered ? k * 0.04 : (GHOSTS.length - 1 - k) * 0.03,
            }}
          />
        ))}

        <motion.div
          className="relative h-full w-full"
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <AreaCard area={area} />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-2 ring-inset ring-accent-blue"
            animate={{ opacity: hovered ? 0.6 : 0 }}
            transition={{ duration: 0.25 }}
          />
        </motion.div>
      </div>
    </motion.article>
  );
}

function AreaCard({ area }: { area: Area }) {
  return (
    <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-hairline bg-bg-surface/90 p-7 shadow-[0_40px_90px_-30px_var(--shadow-strong)] backdrop-blur-sm sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-blue-text">
        Research area
      </p>
      <span className="mt-1 font-display text-5xl font-semibold text-hairline-strong sm:text-6xl">
        {area.n}
      </span>

      <h3 className="mt-auto font-display text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
        {area.title}
      </h3>
      <span
        aria-hidden="true"
        className="mt-3 block h-px w-12 bg-accent-blue"
      />
      <p className="mt-3 font-sans text-sm leading-relaxed text-text-secondary sm:text-base">
        {area.body}
      </p>
    </div>
  );
}
