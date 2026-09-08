"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useInView } from "motion/react";
import type { Lecturer } from "@/lib/types";

/**
 * Zigzag roster. At `lg+` each row is a wide, short horizontal bar bled off
 * its own side of the *viewport* (`w: 52vw` + `margin: calc(50% - 50vw)` on
 * the outer side) and run past the page centre on the inner side, with
 * small padding. The copy is a column pinned toward the bar's inner side
 * with a gap to the portrait; the portrait is `position: absolute` pinned
 * to the bar's inner-*top* corner (`top: -3.5rem`, `right`/`left: -3rem`,
 * i.e. nudged a little past the corner toward page centre)
 * — same offset on every card, so it lands on the identical spot each time.
 * The bar's `min-h` is at least the portrait's height so the photo never
 * pokes past a short card's bottom edge; longer bios grow the bar downward
 * below the photo, and the wide row gap absorbs it. Below `lg` (tablet,
 * mobile) it degrades to a plain stacked card: portrait above the text, no
 * absolute positioning.
 *
 * Rows slide + fade in on scroll — a plain CSS transition keyed off
 * `.is-visible` (see `.lecturer-row` in globals.css), toggled by
 * `useInView` (`once: false`) every time a row crosses the viewport band
 * (shrunk 15% top and bottom). Left cards come in from the left, right from
 * the right, and reverse out. The travel is a small 56px, clipped on each
 * <article> (not the list or page) so it can't widen the viewport or stick
 * the scroll.
 */
export function LecturerShowcase({ lecturers }: { lecturers: Lecturer[] }) {
  return (
    <div className="lecturer-list flex flex-col gap-14 sm:gap-20 lg:gap-32">
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
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0, margin: "-15% 0px -15% 0px", once: false });

  const portrait = (
    <div
      className={`lecturer-photo-frame relative z-20 mx-auto mb-6 aspect-[3/4] w-48 overflow-hidden rounded-[var(--radius-control)] border border-hairline-strong bg-bg-surface-raised sm:w-52 lg:absolute lg:top-[-3.5rem] lg:mx-0 lg:mb-0 lg:w-72 ${
        onLeft
          ? "lg:right-[-3rem]"
          : "lg:left-[-3rem]"
      }`}
    >
      {lecturer.photo ? (
        <Image
          src={lecturer.photo}
          alt={lecturer.name}
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 1024px) 288px, (min-width: 640px) 240px, 192px"
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
  );

  const plate = (
    <Link
      href={`/lecturers/${lecturer.id}`}
      className={`lecturer-box relative z-10 flex w-full flex-col justify-center rounded-[var(--radius-control)] border border-hairline p-6 text-center sm:w-[46vw] sm:shrink-0 sm:p-7 lg:min-h-[22rem] lg:w-[52vw] lg:py-6 ${
        onLeft
          ? "sm:ml-[calc(50%-50vw)] lg:pl-8 lg:pr-[19rem] lg:text-left"
          : "sm:mr-[calc(50%-50vw)] lg:pl-[19rem] lg:pr-8 lg:text-right"
      }`}
    >
      {portrait}

      {/* lg: a long thin bar bled to the outer edge and run well past page
          centre. The copy is a wide column pinned toward the bar's inner
          side, a comfortable gap from the page-centred portrait that `pr` /
          `pl` reserves room for. No clamp / height cap — the full bio shows
          and the bar grows down. sm and below: a plain stacked card,
          portrait above the text. */}
      <div
        className={`lecturer-copy mx-auto w-full sm:max-w-[16rem] lg:max-w-[23rem] ${
          onLeft ? "lg:mx-0 lg:ml-auto" : "lg:mx-0 lg:mr-auto"
        }`}
      >
        {lecturer.role && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-blue-text sm:text-xs">
            {lecturer.role}
          </p>
        )}

        <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-text-primary sm:text-3xl">
          {lecturer.name}
        </h3>
        <span
          aria-hidden="true"
          className={`lecturer-underline mt-3 block h-px w-16 bg-accent-blue ${
            onLeft ? "mx-auto lg:mx-0" : "mx-auto lg:ml-auto"
          }`}
        />

        <p className="mt-3 font-sans text-sm text-text-secondary sm:text-base">
          {lecturer.title}
        </p>

        {lecturer.bio && (
          <p className="mt-3 font-sans text-sm leading-relaxed text-text-secondary sm:text-justify sm:text-base [hyphens:auto]">
            {lecturer.bio}
          </p>
        )}
      </div>
    </Link>
  );

  return (
    <article
      ref={ref}
      className={`lecturer-row ${
        onLeft ? "" : "lecturer-row--right"
      } ${inView ? "is-visible" : ""}`}
    >
      <div
        className={`lecturer-row-inner flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-0 ${
          onLeft ? "sm:justify-start" : "sm:justify-end"
        }`}
      >
        {plate}
      </div>
    </article>
  );
}
