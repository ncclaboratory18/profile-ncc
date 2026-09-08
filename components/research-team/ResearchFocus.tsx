"use client";

import Image from "next/image";
import { useRef } from "react";
import { useInView } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";

/**
 * "Our research" — the tracks the Research Team actually runs, below the
 * roster ring.
 *
 * Same zigzag-and-slide rhythm as the Lecturers page, scaled up: each track is
 * one wide bar pinned hard to alternating sides of the *viewport*, with the
 * photo on the bar's outer half — running out to the page edge — and the copy
 * on the inner half, nearest the centre where the eye already is. The empty
 * strip left on the opposite side is the point; a balanced two-column split
 * would read as a centred composition even with both halves at the edges.
 *
 * Rows slide in from their own side and reverse out, replaying each time they
 * cross the viewport (see `.track-row` in globals.css). That mechanism is a
 * deliberate twin of `.lecturer-row`'s rather than a shared class: these rows
 * travel further, and the lecturer rules also carry portrait and plate
 * geometry specific to that page.
 *
 * SWAPPING IN REAL PHOTOS: replace the `image` values with local paths
 * (`/research/steganography.jpg`, ...) and drop the files into
 * `public/research/`. Nothing else changes.
 *
 * The copy mirrors the matching entries in `ResearchFlythrough` on the
 * Research page on purpose — the same track should not be described two
 * different ways in two places.
 */
const TRACKS = [
  {
    title: "Steganography",
    body: "Hiding and recovering data inside ordinary carriers — images, audio, network traffic — and building the analysis that detects when someone else has done it.",
    tag: "Active track",
    image: "https://picsum.photos/seed/ncc-track-steg/1400/1100",
  },
  {
    title: "Botnet Detection",
    body: "Identifying coordinated hosts from the shape of their traffic, and the command-and-control patterns that give a botnet away before it is used.",
    tag: "Active track",
    image: "https://picsum.photos/seed/ncc-track-botnet/1400/1100",
  },
  {
    title: "Network Security",
    body: "Intrusion detection, secure protocol design, and adversarial analysis of the networked systems the rest of campus runs on.",
    tag: "Active track",
    image: "https://picsum.photos/seed/ncc-track-netsec/1400/1100",
  },
  {
    title: "Digital Forensics",
    body: "Log analysis, incident reconstruction, and evidence-grade tooling — the work of establishing what actually happened, in a form that holds up under review.",
    tag: "Active track",
    image: "https://picsum.photos/seed/ncc-track-forensics/1400/1100",
  },
];

export function ResearchFocus() {
  return (
    <section className="pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
            Our research
          </p>
          <h2 className="mt-3 max-w-[22ch] font-display text-3xl font-semibold leading-[1.1] text-text-primary sm:text-5xl">
            What the team is working on
          </h2>
          <p className="mt-5 max-w-[62ch] font-sans text-base leading-relaxed text-text-secondary sm:text-lg">
            Four tracks run inside the lab at any time. Each one is owned by
            research assistants and supervised by the Head of Laboratory, and
            feeds the papers and projects published elsewhere on this site.
          </p>
        </Reveal>
      </div>

      {/* No max-width wrapper: each bar is viewport-anchored so it can run
          flush to the page edge, and the overflow from the slide is clipped on
          `.track-list` itself — deep enough in the tree that it never becomes
          the scroll container for the window, for Lenis, or for any sticky
          section elsewhere on the site. */}
      <div className="track-list mt-16 flex flex-col gap-14 px-4 sm:px-6 lg:mt-20 lg:gap-24 lg:px-0">
        {TRACKS.map((track, i) => (
          <TrackRow key={track.title} track={track} onLeft={i % 2 === 0} />
        ))}
      </div>
    </section>
  );
}

function TrackRow({
  track,
  onLeft,
}: {
  track: (typeof TRACKS)[number];
  onLeft: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0, margin: "-15% 0px -15% 0px", once: false });

  return (
    <article
      ref={ref}
      className={`track-row ${onLeft ? "" : "track-row--right"} ${inView ? "is-visible" : ""}`}
    >
      <div className={`track-row-inner ${onLeft ? "" : "lg:flex lg:justify-end"}`}>
        <div
          className={`track-box relative flex w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface lg:w-[78vw] lg:flex-row lg:items-stretch lg:rounded-none ${
            onLeft
              ? "lg:rounded-r-[var(--radius-card)]"
              : "lg:rounded-l-[var(--radius-card)]"
          }`}
        >
          {/* Photo takes the bar's outer half — the side running off the page
              edge. Copy takes the inner half, nearest the page centre. */}
          <div
            className={`relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-bg-surface-raised lg:aspect-auto lg:min-h-[32rem] lg:w-[40vw] ${
              onLeft ? "lg:order-1" : "lg:order-2"
            }`}
          >
            <Image
              src={track.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="track-photo object-cover"
            />
          </div>

          <div
            className={`flex flex-1 flex-col justify-center p-8 sm:p-10 lg:p-14 ${
              onLeft ? "lg:order-2" : "lg:order-1"
            }`}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-blue-text">
              {track.tag}
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl lg:text-5xl">
              {track.title}
            </h3>
            <span
              aria-hidden="true"
              className="track-underline mt-5 block h-px w-20 bg-accent-blue"
            />
            <p className="mt-6 max-w-[46ch] font-sans text-base leading-relaxed text-text-secondary lg:text-lg">
              {track.body}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
