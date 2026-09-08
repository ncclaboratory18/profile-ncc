"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { MemberCard } from "@/components/roster/MemberCard";
import { useReducedMotion } from "@/lib/reduced-motion";
import type { TeamMember } from "@/lib/types";

const COORDINATOR_ROLE = "lab coordinator";
/** Cards drawn behind the top one; the rest sit hidden at that same depth. */
const VISIBLE = 4;
/** How far a card is thrown, px, and how long the throw takes. */
const THROW_X = 380;
const FLIGHT_MS = 440;
/** Drag distance (or flick velocity) that commits to dealing the card. */
const DRAG_TRIGGER = 90;
const FLICK_VELOCITY = 480;
const AUTOPLAY_MS = 4200;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * One generation's roster as a deck of cards rather than a carousel: the top
 * card is thrown off to the right and the one under it comes up, the way a
 * card game deals. Dragging it back the other way pulls the last card in from
 * the left and drops it on top again. The deck is a cycle, so it never runs
 * out in either direction.
 *
 * How the throw is staged, since it is the whole trick:
 * `index` moves the instant the card is dealt, so the thrown card's depth is
 * already the *back* of the stack — and with it, its z-index. `flight` holds
 * it above the others just long enough to travel clear, and when that clears
 * the z-index drops while the card is off-screen and it slides back in
 * underneath the deck. That return is what reads as "goes under the stack";
 * without the temporary z-index the card would spend its first frames sliding
 * out from beneath the very cards it is supposed to be leaving.
 *
 * Reduced motion gets the plain grid instead — the deck is a motion device,
 * and a deck that cannot move is just one card hiding six others.
 */
export function GenerationDeck({ members }: { members: TeamMember[] }) {
  const reduce = useReducedMotion();
  const count = members.length;

  // Open on the generation's koor lab, the way the carousel used to centre on
  // them, so the card that matters is the one already face up.
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      members.findIndex((m) => m.role.toLowerCase() === COORDINATOR_ROLE),
    ),
  );
  const [flight, setFlight] = useState<{ id: string; dir: 1 | -1 } | null>(null);
  const [paused, setPaused] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const inView = useInView(deckRef, { amount: 0.4 });

  const top = mod(index, count);

  function deal(dir: 1 | -1) {
    if (count < 2) return;
    // Forward, the card leaving the top flies out; backward, the card arriving
    // from the bottom flies in. Either way it is the one that needs lifting
    // above the rest of the deck while it travels.
    const flying = members[mod(dir === 1 ? index : index - 1, count)];
    setFlight({ id: flying.id, dir });
    setIndex((i) => i + dir);
  }

  // One timer, not one per card: the flight is over when it is over.
  useEffect(() => {
    if (!flight) return;
    const timer = setTimeout(() => setFlight(null), FLIGHT_MS);
    return () => clearTimeout(timer);
  }, [flight]);

  // Idle dealing, on the same terms as the Research Team ring: a timeout keyed
  // on the index so a manual deal restarts the wait, and held while the
  // pointer is on the deck, while it is off screen, or while the tab is in the
  // background.
  useEffect(() => {
    if (reduce || paused || !inView || count < 2) return;
    // `deal(1)` inlined rather than called: the effect already tracks `index`,
    // and depending on the function instead would only re-run it on every
    // render for no gain.
    const timer = setTimeout(() => {
      setFlight({ id: members[mod(index, count)].id, dir: 1 });
      setIndex((i) => i + 1);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, members, reduce, paused, inView, count]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (count === 0) return null;

  if (reduce) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} variant="grid" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div
        ref={deckRef}
        role="group"
        aria-roledescription="card deck"
        aria-label="Generation roster"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            deal(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            deal(-1);
          }
        }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="relative flex h-[27rem] items-start justify-center sm:h-[30rem]"
      >
        {members.map((member, i) => {
          const depth = mod(i - index, count);
          const isFlying = flight?.id === member.id;
          const buried = depth >= VISIBLE;
          const settled = Math.min(depth, VISIBLE);
          const isCoordinator = member.role.toLowerCase() === COORDINATOR_ROLE;

          // Resting place in the stack. Cards deeper than VISIBLE park at that
          // same spot invisible, so nothing ever animates in from far away.
          const rest = {
            x: settled * -7,
            y: settled * 16,
            rotate: settled * -2,
            scale: 1 - settled * 0.045,
            opacity: buried ? 0 : 1,
          };

          const animate =
            isFlying && flight
              ? flight.dir === 1
                ? // Thrown off to the right and gone.
                  { x: THROW_X, y: -28, rotate: 20, scale: 1.03, opacity: 0 }
                : // Pulled back in from the left onto the top of the deck. The
                  // leading keyframe puts it off-screen on the first frame, so
                  // it flies in rather than growing out of the stack.
                  {
                    x: [-THROW_X, 0],
                    y: [-28, 0],
                    rotate: [-20, 0],
                    scale: [1.03, 1],
                    opacity: [0, 1],
                  }
              : rest;

          return (
            <motion.div
              key={member.id}
              className="absolute w-[16rem] sm:w-[18rem]"
              style={{
                // Lifted clear of the deck only while in flight; see the note
                // at the top of this file.
                zIndex: isFlying ? count + 5 : count - depth,
                cursor: depth === 0 ? "grab" : "default",
              }}
              animate={animate}
              transition={{
                duration: isFlying ? FLIGHT_MS / 1000 : 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              drag={depth === 0 ? "x" : false}
              dragSnapToOrigin
              dragElastic={0.5}
              dragConstraints={{ left: 0, right: 0 }}
              whileDrag={{ cursor: "grabbing" }}
              onDragEnd={(_, info) => {
                const committed =
                  Math.abs(info.offset.x) > DRAG_TRIGGER ||
                  Math.abs(info.velocity.x) > FLICK_VELOCITY;
                if (committed) deal(info.offset.x < 0 ? -1 : 1);
              }}
              // Only the face-up card is reachable; the rest are stacked behind
              // it and would otherwise be read out and tabbed through blind.
              inert={depth !== 0}
            >
              {isCoordinator && depth === 0 && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-chip)] bg-accent-blue px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_16px_rgba(14,116,188,0.6)]">
                  Koordinator
                </span>
              )}
              <MemberCard member={member} variant="compact" glow={isCoordinator} />
            </motion.div>
          );
        })}

        <button
          type="button"
          aria-label="Previous member"
          onClick={() => deal(-1)}
          className="carousel-arrow carousel-arrow--prev"
        />
        <button
          type="button"
          aria-label="Next member"
          onClick={() => deal(1)}
          className="carousel-arrow carousel-arrow--next"
        />
      </div>

      <p
        aria-live="polite"
        className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.16em] tabular-nums text-text-tertiary"
      >
        <span className="text-text-primary">{String(top + 1).padStart(2, "0")}</span>
        {" / "}
        {String(count).padStart(2, "0")}
      </p>
    </div>
  );
}
