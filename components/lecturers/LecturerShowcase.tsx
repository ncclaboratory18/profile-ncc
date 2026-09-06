"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import type { Lecturer } from "@/lib/types";

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

function rowVariants(fromLeft: boolean): Variants {
  return {
    hidden: { opacity: 0, x: fromLeft ? -72 : 72 },
    show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: EASE_PREMIUM } },
  };
}

const rowVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

/**
 * Zigzag roster. Each lecturer is one box — photo plus copy — pinned hard to
 * the left margin, then the right, with the opposite side of the page left
 * empty. The box is capped well under half the page width so the swing
 * between sides actually reads; a wider box would creep back toward centre
 * and flatten the alternation.
 *
 * Hover highlighting lives in CSS (`.lecturer-*` in globals.css) behind
 * `@media (hover: hover)`, so touch devices get the lit state by default.
 */
export function LecturerShowcase({ lecturers }: { lecturers: Lecturer[] }) {
  return (
    <div className="lecturer-list flex flex-col gap-12 sm:gap-16 lg:gap-24">
      {lecturers.map((lecturer, i) => (
        <LecturerRow
          key={lecturer.id}
          lecturer={lecturer}
          onLeft={i % 2 === 0}
          priority={i === 0}
        />
      ))}
    </div>
  );
}

function LecturerRow({
  lecturer,
  onLeft,
  priority = false,
}: {
  lecturer: Lecturer;
  onLeft: boolean;
  /** The first row sits above the fold — load it eagerly for LCP. */
  priority?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={reduce ? rowVariantsReduced : rowVariants(onLeft)}
      className={`lecturer-row flex ${
        onLeft ? "justify-start" : "lecturer-row--right justify-end"
      }`}
    >
      {/* One surfaced box per lecturer — this is the element that lights up. */}
      <div
        className={`lecturer-box flex w-full max-w-xl flex-col gap-5 rounded-[var(--radius-card)] border border-hairline bg-bg-surface/70 p-5 sm:flex-row sm:items-stretch sm:gap-6 sm:p-6 lg:max-w-3xl lg:gap-8 lg:p-8 ${
          onLeft ? "" : "sm:flex-row-reverse"
        }`}
      >
        <div className="lecturer-photo-frame relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-hairline bg-bg-surface sm:aspect-[3/4] sm:w-40 lg:w-52 xl:w-56">
          {lecturer.photo ? (
            <Image
              src={lecturer.photo}
              alt={lecturer.name}
              fill
              sizes="(min-width: 1280px) 224px, (min-width: 1024px) 208px, (min-width: 640px) 160px, 100vw"
              priority={priority}
              className="lecturer-photo object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-surface-raised font-display text-2xl text-text-secondary">
              {lecturer.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
        </div>

        {/* Copy hugs the same edge the box does, so a right-hand row reads
            right-aligned rather than left-aligned inside a right-shifted box. */}
        <div className={`min-w-0 flex-1 ${onLeft ? "text-left" : "sm:text-right"}`}>
          {lecturer.role && (
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-blue-text sm:text-[11px]">
              {lecturer.role}
            </p>
          )}

          <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-text-primary sm:text-2xl lg:text-3xl">
            {lecturer.name}
          </h3>
          <span
            aria-hidden="true"
            className={`lecturer-underline mt-3 block h-px w-16 bg-accent-blue ${
              onLeft ? "" : "sm:ml-auto"
            }`}
          />

          <p className="mt-3 font-sans text-xs text-text-secondary sm:text-sm">
            {lecturer.title}
          </p>

          {lecturer.bio && (
            <p className="mt-4 font-sans text-sm leading-relaxed text-text-secondary sm:text-base">
              {lecturer.bio}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
