"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";

const EYEBROW = "Net-Centric Computing Laboratory · Departemen Informatika ITS";

/** One line per array entry — the wipe uncovers them in order. */
const LINES = [
  "We work on everything",
  "that happens between machines",
  "— mobile, distributed, cloud —",
  "and on keeping it standing",
  "when someone comes for it.",
];

// Sized off the viewport width, not a breakpoint ladder: the longest line
// then lands just inside the screen at any width, which is the whole point of
// a statement page.
const TYPE =
  "font-display text-[clamp(30px,min(6.3vw,13.5vh),168px)] font-semibold leading-[1.02] tracking-[-0.02em] text-text-primary";

/**
 * Full-screen opening statement. Each line is uncovered by a solid accent
 * block sliding off it — the block-wipe reveal from the reference set, which
 * reads as deliberate where a fade reads as soft.
 *
 * The wipe runs on its own clock the first time the statement comes into
 * view (`once`), rather than being tied to scroll position: it plays through
 * at its own pace and stays played, however the visitor scrolls afterwards.
 */
export function LabStatement() {
  const reduce = useReducedMotion();

  const eyebrow = (
    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
      {EYEBROW}
    </p>
  );

  if (reduce) {
    return (
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8">
          {eyebrow}
          <p className={`mt-6 ${TYPE}`}>{LINES.join(" ")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center overflow-hidden border-t border-hairline px-4 text-center sm:px-6 lg:px-8">
      {eyebrow}
      <motion.div
        className={`mt-6 ${TYPE}`}
        initial="covered"
        whileInView="open"
        viewport={{ once: true, amount: 0.55 }}
        variants={{ open: { transition: { staggerChildren: 0.14 } } }}
      >
        {LINES.map((line) => (
          // The masked box hugs the line rather than the column, so the block
          // that slides off is exactly as wide as the words it was hiding.
          <motion.div key={line} variants={{ covered: {}, open: {} }}>
            <span className="relative inline-block overflow-hidden py-[0.02em] align-top">
              <span className="block">{line}</span>
              <motion.span
                aria-hidden
                variants={{ covered: { x: "0%" }, open: { x: "101%" } }}
                transition={{ duration: 0.62, ease: [0.65, 0, 0.35, 1] }}
                className="pointer-events-none absolute inset-0 block bg-accent-blue will-change-transform"
              />
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
