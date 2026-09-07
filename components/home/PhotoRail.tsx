"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { railPhotos, type GalleryPhoto } from "@/lib/gallery";
import { HeroParticles } from "./HeroParticles";

type Metrics = {
  step: number;
  frameW: number;
  padLeft: number;
  /** Travel of one full set of frames, px. */
  loop: number;
  /** Track translate at progress 0 — puts the middle frame on screen centre. */
  t0: number;
};

/**
 * Infinite, centre-anchored carousel. At the start of the pinned section the
 * middle frame sits dead centre and lit; scrolling advances the rail left,
 * each frame lighting as it crosses centre, and frames that leave on the
 * left reappear on the right (a second identical copy is rendered, so one
 * full `loop` of travel returns the same picture to centre — seamless).
 *
 * The section is a plain fixed height and progress comes from
 * `useSectionProgress` (the section's live rect, sampled each frame), so it
 * never drifts against Lenis' eased scroll the way Motion's cached
 * `useScroll` did.
 */
export function PhotoRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const scrollYProgress = useSectionProgress(sectionRef);

  const loop = metrics?.loop ?? 0;
  const t0 = metrics?.t0 ?? 0;
  const x = useTransform(scrollYProgress, [0, 1], [t0, t0 - loop]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduce) return;

    function measure() {
      if (!track) return;
      const kids = track.children;
      if (kids.length < 2) return;
      const frameW = (kids[0] as HTMLElement).offsetWidth;
      // offsetLeft / offsetWidth are layout metrics — unaffected by the
      // track's own transform, so this is safe to read at any scroll pos.
      const step =
        (kids[1] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
      if (!step || !frameW) return;
      const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const count = railPhotos.length;
      const mid = Math.floor((count - 1) / 2);
      setMetrics({
        step,
        frameW,
        padLeft,
        loop: step * count,
        t0: window.innerWidth / 2 - padLeft - mid * step - frameW / 2,
      });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  const heading = (
    <div className="mb-8 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
        Lab moments
      </h2>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
        {railPhotos.length} frames
      </span>
    </div>
  );

  // Reduced motion (and touch users who prefer it): a plain native scroll rail.
  if (reduce) {
    return (
      <section ref={sectionRef} className="border-t border-hairline py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{heading}</div>
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {railPhotos.map((photo) => (
            <div key={photo.src} className="w-[76vw] shrink-0 snap-center sm:w-[34vw] lg:w-[26vw]">
              <RailFrame photo={photo} />
              <RailCaption photo={photo} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[360vh] border-t border-hairline"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{heading}</div>

        <motion.div
          ref={trackRef}
          style={{ x, opacity: metrics ? 1 : 0 }}
          className="flex gap-5 px-4 will-change-transform sm:px-6 lg:px-8"
        >
          {[0, 1].map((copy) =>
            railPhotos.map((photo, i) => (
              <div
                key={`${copy}-${photo.src}`}
                className="w-[76vw] shrink-0 sm:w-[34vw] lg:w-[26vw]"
              >
                <RailFrameLoop
                  photo={photo}
                  progress={scrollYProgress}
                  j={copy * railPhotos.length + i}
                  metrics={metrics}
                  priority={copy === 0 && i < 3}
                />
                <RailCaptionLoop
                  photo={photo}
                  progress={scrollYProgress}
                  j={copy * railPhotos.length + i}
                  metrics={metrics}
                />
              </div>
            )),
          )}
        </motion.div>
      </div>

      {/* Brief particle bridge into the split-nav section — not persistent. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]">
        <HeroParticles />
      </div>
    </section>
  );
}

const RAIL_SIZES = "(min-width: 1024px) 26vw, (min-width: 640px) 34vw, 76vw";

/** 0 when the frame is a full `step` (or more) off centre, 1 when dead centre. */
function centredness(j: number, p: number, m: Metrics | null): number {
  if (!m) return 0;
  const x = m.t0 - p * m.loop;
  const centre = m.padLeft + j * m.step + m.frameW / 2 + x;
  const d = Math.abs(centre - window.innerWidth / 2);
  return Math.max(0, Math.min(1, 1 - d / m.step));
}

function RailFrame({ photo }: { photo: GalleryPhoto }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface">
      <Image
        src={photo.src}
        alt={photo.caption}
        fill
        sizes={RAIL_SIZES}
        className="object-cover [filter:grayscale(0.25)_brightness(0.9)]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary/70 to-transparent" />
    </div>
  );
}

/**
 * Frame that lifts as it passes the centre of the viewport: it scales up a
 * touch, a dark veil over it fades away (so it reads brighter and in
 * colour), and a blue accent ring fades in. All three are opacity / scale —
 * compositor-only — so a rail of a dozen frames restyling every scroll
 * frame stays cheap. An earlier version animated a CSS `filter` per frame,
 * which repainted the whole rail on every tick and made scrolling stutter.
 */
function RailFrameLoop({
  photo,
  progress,
  j,
  metrics,
  priority,
}: {
  photo: GalleryPhoto;
  progress: MotionValue<number>;
  j: number;
  metrics: Metrics | null;
  priority?: boolean;
}) {
  const t = useTransform(progress, (p) => centredness(j, p, metrics));
  const scale = useTransform(t, [0, 1], [0.95, 1.03]);
  const veil = useTransform(t, [0, 1], [0.55, 0]);
  const ring = useTransform(t, [0, 1], [0, 0.55]);

  return (
    <motion.div
      style={{ scale }}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface will-change-transform"
    >
      <Image
        src={photo.src}
        alt={photo.caption}
        fill
        sizes={RAIL_SIZES}
        priority={priority}
        className="object-cover [filter:grayscale(0.3)]"
      />
      <motion.div
        style={{ opacity: veil }}
        className="pointer-events-none absolute inset-0 bg-bg-primary"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary/70 to-transparent" />
      <motion.div
        style={{ opacity: ring }}
        className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-2 ring-inset ring-accent-blue"
      />
    </motion.div>
  );
}

/** Static caption — reduced-motion rail. */
function RailCaption({ photo }: { photo: GalleryPhoto }) {
  return (
    <div className="mt-4">
      <CaptionText photo={photo} />
    </div>
  );
}

/** Caption brightens as its frame passes the centre of the viewport. */
function RailCaptionLoop({
  photo,
  progress,
  j,
  metrics,
}: {
  photo: GalleryPhoto;
  progress: MotionValue<number>;
  j: number;
  metrics: Metrics | null;
}) {
  const opacity = useTransform(progress, (p) => 0.3 + 0.7 * centredness(j, p, metrics));

  return (
    <motion.div className="mt-4" style={{ opacity }}>
      <CaptionText photo={photo} />
    </motion.div>
  );
}

function CaptionText({ photo }: { photo: GalleryPhoto }) {
  return (
    <>
      <p className="font-sans text-sm font-semibold text-text-primary">
        {photo.caption}
      </p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
        {photo.meta}
      </p>
    </>
  );
}
