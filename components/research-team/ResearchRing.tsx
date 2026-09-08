"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import {
  ringRadius,
  ringSlots,
  ringStep,
  shortestSlotDelta,
  RING_PERSPECTIVE,
} from "@/lib/ring";
import { CaseFileCard, CaseFileGrid } from "./ResearchRoster";
import type { TeamMember } from "@/lib/types";

/** A pointer travel past this, horizontally, counts as a swipe. */
const SWIPE_PX = 48;
/** Accumulated horizontal wheel delta that advances the ring one slot. */
const WHEEL_PX = 60;
/** Idle advance, matching the Admins carousel's own autoplay delay. */
const AUTOPLAY_MS = 3200;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * The roster on a looping 3D ring — see `lib/ring.ts` for the geometry, the
 * repetition that fills the circle, and why no duplicate is ever on screen.
 *
 * Deliberately not scroll-linked. Every scroll-driven section in this codebase
 * (the photo rail, both fly-throughs) is a pinned block with its own progress
 * plumbing, and stacking another one here would add pinned height to a page
 * that already ends in a footer. This is driven by intent instead: arrows,
 * arrow keys, a swipe, or clicking a card that isn't at the front — that last
 * one is what makes the side cards feel like part of the control rather than
 * decoration. Left idle it advances on its own, the same way the Admins
 * carousel does.
 *
 * `active` counts slots travelled and is deliberately unbounded: the ring is
 * endless, so there is no index to clamp and no end to bounce off. Only its
 * value mod `slots` decides what faces the viewer.
 *
 * Under reduced motion it falls back to the flat numbered grid, which is a
 * real layout the page used to ship rather than a stripped version of this
 * one — nothing is lost but the rotation.
 */
export function ResearchRing({ members }: { members: TeamMember[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [radius, setRadius] = useState(0);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<number | null>(null);
  const wheelDelta = useRef(0);

  const count = members.length;
  const slots = ringSlots(count);
  const step = ringStep(count);
  const front = mod(active, slots);

  const inView = useInView(stageRef, { amount: 0.3 });

  // The card's width is a responsive CSS value, so the radius that spaces the
  // ring has to come from the laid-out element, not from a constant here.
  useEffect(() => {
    const slide = slideRef.current;
    if (!slide || reduce) return;

    const measure = () => setRadius(ringRadius(slide.offsetWidth, count));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(slide);
    return () => observer.disconnect();
  }, [count, reduce]);

  // Idle advance. A timeout keyed on `active` rather than a bare interval, so
  // a manual move restarts the wait instead of being followed straight away by
  // an automatic one — the same "resume, don't pounce" behaviour Swiper's
  // `disableOnInteraction: false` gives the Admins carousel. Held while the
  // pointer is over the ring, while it is off screen, and while the tab is in
  // the background, so an unattended page is not animating for nobody.
  useEffect(() => {
    if (reduce || paused || !inView || count <= 1) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    const timer = setTimeout(() => setActive((a) => a + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, reduce, paused, inView, count]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Plain functions, not `useCallback` — the React Compiler handles the
  // memoization, and hand-written deps here only trip its lint.
  const go = (delta: number) => setActive((a) => a + delta);

  /** Rotate so slot `s` comes to the front, the short way round. */
  const bringForward = (s: number) =>
    setActive((a) => a + shortestSlotDelta(mod(a, slots), s, slots));

  if (reduce || count === 0) {
    return <CaseFileGrid members={members} startIndex={0} />;
  }

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Research assistants"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onPointerDown={(e) => {
          pointerStart.current = e.clientX;
        }}
        onPointerUp={(e) => {
          const start = pointerStart.current;
          pointerStart.current = null;
          if (start === null) return;
          const dx = e.clientX - start;
          // Left drag advances, the direction the cards themselves travel.
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        }}
        // Horizontal wheel intent only — a trackpad's sideways swipe, or
        // shift+wheel. A plain vertical wheel is left alone so it keeps
        // scrolling the page: this ring is endless, so swallowing vertical
        // scroll would leave a viewport-tall region the page can never be
        // scrolled past. Same rule as Swiper's `mousewheel.forceToAxis`,
        // which the Admins carousel now uses.
        onWheel={(e) => {
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
          wheelDelta.current += e.deltaX;
          while (Math.abs(wheelDelta.current) >= WHEEL_PX) {
            const direction = Math.sign(wheelDelta.current);
            wheelDelta.current -= direction * WHEEL_PX;
            go(direction);
          }
        }}
        ref={stageRef}
        // The height has to clear the *magnified* front card: perspective
        // projects it outward from the container's centre by up to ~1.43x
        // (`ringFrontScale`, capped in `lib/ring.ts`), and nothing clips it.
        className="relative h-[30rem] touch-pan-y select-none sm:h-[34rem] lg:h-[37rem]"
        style={{ perspective: `${RING_PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}
      >
        <motion.div
          className="ring-stage absolute inset-0"
          // Hidden until the card has been measured — before that every slide
          // sits at radius 0, stacked on top of each other in the centre.
          // Same guard the photo rail uses for its own measured metrics.
          style={{ opacity: radius > 0 ? 1 : 0 }}
          animate={{ rotateY: -active * step }}
          transition={{ type: "spring", stiffness: 60, damping: 16, mass: 0.9 }}
        >
          {Array.from({ length: slots }, (_, s) => {
            const member = members[s % count];
            const isFront = s === front;
            // Slots turned away are cut by `backface-visibility`, so they are
            // taken out of the tab order and the accessibility tree too —
            // otherwise a repeated roster would read out the same person
            // several times. What stays is guaranteed duplicate-free by
            // `ringSlots`.
            const hidden = Math.abs(shortestSlotDelta(front, s, slots) * step) >= 90;

            return (
              <div
                key={`${member.id}-${s}`}
                ref={s === 0 ? slideRef : undefined}
                data-front={isFront}
                inert={hidden}
                className="ring-slide absolute left-1/2 top-1/2 w-[13.5rem] sm:w-[15.5rem] lg:w-[17rem]"
                style={{
                  // Centre first, then rotate about the card's own middle and
                  // push it out along its local +Z onto the ring.
                  transform: `translate(-50%, -50%) rotateY(${s * step}deg) translateZ(${radius}px)`,
                  // A card that isn't at the front is a control, not a link:
                  // the click below brings it round instead of navigating.
                  cursor: isFront ? undefined : "pointer",
                }}
                onClickCapture={(e) => {
                  if (isFront) return;
                  e.preventDefault();
                  e.stopPropagation();
                  bringForward(s);
                }}
                // Keyboard focus follows the same rule, so tabbing through the
                // roster rotates it rather than focusing something turned away.
                onFocusCapture={() => bringForward(s)}
              >
                <CaseFileCard member={member} index={(s % count) + 1} />
              </div>
            );
          })}
        </motion.div>

        {/* Flanking the ring, vertically centred on it — the same placement
            Swiper gives the Admins carousel, styled by the same rules. The
            chevron is drawn by `.carousel-arrow::before` rather than an icon
            component, so this button and Swiper's own markup render the
            identical mark; the element itself is just the hit target. */}
        <button
          type="button"
          aria-label="Previous research assistant"
          onClick={() => go(-1)}
          className="carousel-arrow carousel-arrow--prev"
        />
        <button
          type="button"
          aria-label="Next research assistant"
          onClick={() => go(1)}
          className="carousel-arrow carousel-arrow--next"
        />
      </div>

      {/* The one thing the Admins carousel does not need: an endless ring has
          no visible ends, so the counter is what says where you are in it. */}
      <p
        aria-live="polite"
        className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] tabular-nums text-text-tertiary"
      >
        <span className="text-text-primary">
          {String(mod(active, count) + 1).padStart(2, "0")}
        </span>
        {" / "}
        {String(count).padStart(2, "0")}
      </p>
    </div>
  );
}
