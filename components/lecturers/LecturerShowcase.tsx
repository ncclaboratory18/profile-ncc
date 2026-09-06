"use client";

import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import type { Lecturer } from "@/lib/types";

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

function rowVariants(fromLeft: boolean): Variants {
  return {
    hidden: { opacity: 0, x: fromLeft ? -64 : 64 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_PREMIUM } },
  };
}

const rowVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
};

/**
 * Zigzag roster: each lecturer is one compact unit — photo beside text —
 * pinned to the left edge of the page, then the right, alternating down the
 * page. Hover highlighting lives in CSS (`.lecturer-*` in globals.css), so
 * touch devices get the full-brightness state by default.
 */
export function LecturerShowcase({ lecturers }: { lecturers: Lecturer[] }) {
  return (
    <div className="lecturer-list flex flex-col gap-10 sm:gap-14">
      {lecturers.map((lecturer, i) => (
        <LecturerRow key={lecturer.id} lecturer={lecturer} onLeft={i % 2 === 0} />
      ))}
    </div>
  );
}

function LecturerRow({ lecturer, onLeft }: { lecturer: Lecturer; onLeft: boolean }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      variants={reduce ? rowVariantsReduced : rowVariants(onLeft)}
      className={`flex ${onLeft ? "justify-start" : "justify-end"}`}
    >
      <article className="lecturer-row flex w-full max-w-xl flex-col gap-5 rounded-[var(--radius-card)] border border-hairline p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-6 lg:max-w-2xl">
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-hairline bg-bg-surface sm:w-44 lg:w-52">
          {lecturer.photo ? (
            <Image
              src={lecturer.photo}
              alt={lecturer.name}
              fill
              sizes="(min-width: 1024px) 208px, (min-width: 640px) 176px, 90vw"
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

        <div className="min-w-0">
          {lecturer.role && (
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-blue-text">
              {lecturer.role}
            </p>
          )}

          <h3 className="mt-1.5 font-display text-xl font-semibold text-text-primary sm:text-2xl">
            {lecturer.name}
          </h3>
          <span
            aria-hidden="true"
            className="lecturer-underline mt-2 block h-px w-14 bg-accent-blue"
          />

          <p className="mt-3 font-sans text-sm text-text-secondary">{lecturer.title}</p>

          {lecturer.bio && (
            <p className="mt-3 font-sans text-sm leading-relaxed text-text-secondary">
              {lecturer.bio}
            </p>
          )}
        </div>
      </article>
    </motion.div>
  );
}
