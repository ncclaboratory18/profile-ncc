"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { Reveal } from "@/components/motion/Reveal";
import {
  ENTER_VECTORS,
  EXIT_VECTORS,
  FLIP_FROM,
  FLIP_TO,
  FULL_CHAPTERS,
  OUTRO_FROM,
  TITLE_END,
  TOTAL_SCREENS,
  clamp01,
  counterAt,
  labPeople,
  phases,
  railAt,
  sequencePhotos,
  titlePhoto,
  track,
  type LabPerson,
} from "@/lib/labPeople";

/**
 * "People at Net-Centric Computing Lab" — a pinned, scroll-driven chapter of
 * the home page. The visitor scrolls and the section plays through: a
 * full-screen title panel whose headline is read by scrolling it sideways,
 * a wipe from the site's near-black to a light editorial canvas, four people
 * in full chapters, then seven in rapid passes.
 *
 * Everything on screen is a pure function of one scroll position (`s`, in
 * screens), which is what makes scrolling back up run the sequence cleanly in
 * reverse — the usual place effects like this break. The timing and the
 * direction table live in `lib/labPeople.ts`; this file only draws them.
 *
 * Below `lg`, and under reduced motion, there is no pin at all: the same
 * eleven people render as a plain vertical sequence. Every name, role, and
 * description is in the DOM in reading order in both paths, so all eleven are
 * findable by a text search whether or not the sequence has played.
 */
export function MeetTheLab() {
  const reduce = useReducedMotion();
  const desktop = useIsDesktop();

  if (reduce || !desktop) return <StaticSequence animate={!reduce} />;
  return <PinnedSequence />;
}

/* ── The pinned sequence ─────────────────────────────────────────────── */

function PinnedSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const view = useViewport();

  // Nineteen photographs plus the title plate. They are held until the
  // section is close, then loaded together, and the sequence does not start
  // until they are in — a first scroll through a half-loaded pin stutters.
  const [armed, setArmed] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const gate = useMotionValue(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Never a trap: the gate also opens on a timer once the section is armed.
  // A photograph that 404s, or a browser that drops a decode, must not leave
  // the visitor pinned on the title panel with nowhere to scroll.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  const ready = armed && (loaded >= sequencePhotos.length || timedOut);
  useEffect(() => {
    gate.set(ready ? 1 : 0);
  }, [ready, gate]);

  const onPhoto = () => setLoaded((n) => n + 1);

  // Scroll position in screens. Held at 0 until the photographs are in, so
  // the pin never begins mid-load.
  const s = useTransform([progress, gate], ([p, g]: number[]) =>
    g ? (p as number) * TOTAL_SCREENS : 0,
  );

  const flip = useTransform(s, (v) => track(v, FLIP_FROM, FLIP_TO));
  const clip = useTransform(flip, (w) => `inset(0 0 0 ${(1 - w) * 100}%)`);
  const outro = useTransform(s, (v) => 1 - track(v, OUTRO_FROM, TOTAL_SCREENS));

  return (
    <>
      <section
        ref={sectionRef}
        aria-labelledby="lab-people-heading"
        className="relative bg-bg-primary"
        style={{ height: `calc(${1 + TOTAL_SCREENS} * 100vh)` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <TitlePanel s={s} view={view} armed={armed} onPhoto={onPhoto} />

          {/* The tonal flip. Everything below the title lives inside this
              panel, so the wipe that reveals the light canvas reveals the
              people with it. `.lab-light` re-declares the theme tokens, so
              the type inside is light-theme ink whichever theme the rest of
              the site is in. */}
          <motion.div
            style={{ clipPath: clip, opacity: outro }}
            className="lab-light lab-blueprint absolute inset-0 bg-bg-primary"
          >
            {labPeople.map((person, i) =>
              i < FULL_CHAPTERS ? (
                <Chapter
                  key={person.id}
                  person={person}
                  index={i}
                  s={s}
                  view={view}
                  armed={armed}
                  onPhoto={onPhoto}
                />
              ) : (
                <Pass
                  key={person.id}
                  person={person}
                  index={i}
                  s={s}
                  view={view}
                  armed={armed}
                  onPhoto={onPhoto}
                />
              ),
            )}
          </motion.div>

          {/* The HUD reads over both the dark plate and the light canvas, so
              it is drawn as a difference against whatever is under it rather
              than switching colour at the flip. */}
          <div className="pointer-events-none absolute inset-0 z-20 mix-blend-difference">
            <p className="absolute left-[2vw] top-[calc(64px+2vh)] font-mono text-[11px] uppercase tracking-[0.2em] text-white">
              Meet the lab
            </p>
            <Counter s={s} />
            <Rail s={s} />
          </div>
        </div>
      </section>

      <Outro />
    </>
  );
}

/* ── Part 1: the title panel ─────────────────────────────────────────── */

const TITLE_LINE = "People at Net-Centric Computing Lab";

function TitlePanel({
  s,
  view,
  armed,
  onPhoto,
}: {
  s: MotionValue<number>;
  view: Viewport;
  armed: boolean;
  onPhoto: () => void;
}) {
  // The headline drifts left while the plate behind it drifts right and
  // enlarges, so the two layers separate. Nowhere near far enough to crop a
  // letter — the whole line stays readable for the length of the panel.
  const x = useTransform(s, (v) => -track(v, 0, TITLE_END) * view.current.w * 0.05);
  const plateX = useTransform(s, (v) => track(v, 0, TITLE_END) * view.current.w * 0.08);
  const plateScale = useTransform(s, (v) => 1.06 + track(v, 0, TITLE_END) * 0.14);
  // Once the wipe has taken over there is nothing to see here; dropping it
  // keeps a full-screen image out of the compositor for the rest of the
  // section.
  const opacity = useTransform(s, (v) => 1 - track(v, FLIP_FROM, FLIP_TO));

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 overflow-hidden bg-[#05070a]">
      <motion.div style={{ x: plateX, scale: plateScale }} className="absolute inset-0">
        {armed && (
          <Image
            src={titlePhoto}
            alt="The NCC Lab at work"
            fill
            priority
            sizes="100vw"
            onLoad={onPhoto}
            onError={onPhoto}
            className="object-cover [filter:grayscale(0.7)_brightness(0.55)]"
          />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/85" />

      <div className="absolute inset-0 flex items-center px-[3vw]">
        <motion.h2 id="lab-people-heading" style={{ x }} className="w-full">
          <span className="sr-only">{TITLE_LINE}</span>
          {/* One line, edge to edge, at any width. `textLength` on the whole
              line makes the browser fit the type to the box exactly — no
              measuring pass, no font-size guess that wraps or overflows on
              some viewport nobody tested. */}
          <svg
            aria-hidden
            viewBox="0 0 1000 108"
            preserveAspectRatio="xMidYMid meet"
            className="block w-full overflow-visible"
          >
            <text
              x="0"
              y="86"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fill="currentColor"
              className="fill-white font-display text-[100px] font-bold uppercase"
            >
              {TITLE_LINE}
            </text>
          </svg>
        </motion.h2>
      </div>
    </motion.div>
  );
}

/* ── Movement one: the four full chapters ────────────────────────────── */

type Box = [colStart: number, colSpan: number, rowStart: number, rowSpan: number];

/**
 * Where each part of a chapter sits on the 12x12 stage. No two chapters use
 * the same arrangement — the name moves across the frame, the large
 * photograph moves with it, and the amount of empty space changes, so the
 * visitor cannot predict where the next name will appear.
 */
const LAYOUTS: Record<
  "num" | "role" | "name" | "lead" | "body" | "exp" | "link" | "a" | "b" | "c",
  Box
>[] = [
  // 01 — text-heavy left, photographs stacked right.
  {
    num: [1, 1, 1, 1],
    role: [2, 5, 2, 1],
    name: [2, 6, 3, 3],
    lead: [2, 5, 6, 2],
    body: [2, 4, 8, 2],
    exp: [2, 3, 10, 2],
    link: [2, 3, 12, 1],
    a: [9, 4, 1, 7],
    b: [7, 3, 8, 4],
    c: [11, 2, 9, 3],
  },
  // 02 — the reverse: one tall photograph filling the left, name on the right.
  {
    num: [12, 1, 1, 1],
    role: [8, 4, 3, 1],
    name: [8, 5, 4, 3],
    lead: [8, 4, 7, 2],
    body: [8, 4, 9, 2],
    exp: [8, 3, 11, 2],
    link: [11, 2, 12, 1],
    a: [1, 6, 1, 12],
    b: [6, 2, 9, 4],
    c: [9, 2, 1, 2],
  },
  // 03 — the name overlapping the top of the large photograph, text right.
  {
    num: [1, 1, 1, 1],
    role: [10, 3, 2, 1],
    name: [1, 8, 3, 3],
    lead: [10, 3, 4, 3],
    body: [10, 3, 7, 2],
    exp: [10, 3, 9, 3],
    link: [10, 3, 12, 1],
    a: [1, 7, 5, 8],
    b: [8, 2, 5, 4],
    c: [8, 2, 10, 3],
  },
  // 04 — text left with a lot of air, the large photograph right and high.
  {
    num: [1, 1, 1, 1],
    role: [1, 5, 3, 1],
    name: [1, 6, 4, 3],
    lead: [1, 5, 7, 2],
    body: [1, 4, 9, 2],
    exp: [1, 3, 11, 2],
    link: [4, 3, 12, 1],
    a: [8, 5, 1, 8],
    b: [5, 3, 9, 3],
    c: [9, 3, 10, 3],
  },
];

function Chapter({
  person,
  index,
  s,
  view,
  armed,
  onPhoto,
}: {
  person: LabPerson;
  index: number;
  s: MotionValue<number>;
  view: Viewport;
  armed: boolean;
  onPhoto: () => void;
}) {
  const L = LAYOUTS[index];
  const common = { person, index, s, view };

  return (
    <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-x-[1.4vw] gap-y-[0.6vh] px-[5vw] pb-[5vh] pt-[calc(64px+4vh)]">
      {/* The large photograph is the slowest thing in the frame and the small
          type the fastest, so a chapter assembles in depth instead of sliding
          in as one slab. */}
      <Layer {...common} rate={0.5} box={L.a}>
        <Photo src={person.photos[0]} alt={person.name} armed={armed} onPhoto={onPhoto} sizes="42vw" />
      </Layer>
      <Layer {...common} rate={0.68} box={L.b}>
        <Photo src={person.photos[1]} alt="" armed={armed} onPhoto={onPhoto} sizes="26vw" />
      </Layer>
      <Layer {...common} rate={0.82} box={L.c}>
        <Photo src={person.photos[2]} alt="" armed={armed} onPhoto={onPhoto} sizes="18vw" />
      </Layer>

      <Layer {...common} rate={1.3} box={L.num} className="items-start">
        <span className="font-mono text-[clamp(2rem,4vw,3.4rem)] font-bold leading-none text-text-tertiary">
          {String(index + 1).padStart(2, "0")}
        </span>
      </Layer>

      <Layer {...common} rate={1.3} box={L.role} className="items-end">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-blue-text">
          {person.role}
        </p>
      </Layer>

      <Layer {...common} rate={1} box={L.name} className="items-center">
        <h3 className="font-display text-[clamp(2.4rem,5.4vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.02em] text-text-primary">
          {person.name}
        </h3>
      </Layer>

      <Layer {...common} rate={1.15} box={L.lead} className="items-start">
        <p className="max-w-[34ch] font-sans text-[clamp(1rem,1.5vw,1.5rem)] leading-[1.3] text-text-primary">
          {person.lead}
        </p>
      </Layer>

      <Layer {...common} rate={1.35} box={L.body} className="items-start">
        <p className="max-w-[42ch] font-sans text-sm leading-relaxed text-text-secondary">
          {person.body}
        </p>
      </Layer>

      <Layer {...common} rate={1.45} box={L.exp} className="items-start">
        <dl className="w-full">
          {person.experience?.map((row) => (
            <div
              key={row.year}
              className="flex gap-4 border-t border-hairline py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
            >
              <dt className="text-accent-blue-text">{row.year}</dt>
              <dd className="text-text-tertiary">{row.what}</dd>
            </div>
          ))}
        </dl>
      </Layer>

      <Layer {...common} rate={1.45} box={L.link} className="items-end">
        <Link
          href="/research-team"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary underline-offset-4 hover:text-accent-blue-text hover:underline"
        >
          Full profile
        </Link>
      </Layer>
    </div>
  );
}

/* ── Movement two: the seven rapid passes ────────────────────────────── */

const SIDE: Record<string, string> = {
  left: "justify-start pl-[6vw] pr-[38vw]",
  center: "justify-center px-[18vw]",
  right: "justify-end pl-[38vw] pr-[6vw]",
};

function Pass({
  person,
  index,
  s,
  view,
  armed,
  onPhoto,
}: {
  person: LabPerson;
  index: number;
  s: MotionValue<number>;
  view: Viewport;
  armed: boolean;
  onPhoto: () => void;
}) {
  const common = { person, index, s, view };

  return (
    <div
      className={`absolute inset-0 flex items-center pt-16 ${SIDE[person.side ?? "center"]}`}
    >
      <Layer {...common} rate={0.72} className="w-[16vw] max-w-[220px] shrink-0">
        <div className="aspect-[4/5] w-full">
          <Photo src={person.photos[0]} alt={person.name} armed={armed} onPhoto={onPhoto} sizes="16vw" />
        </div>
      </Layer>

      <Layer {...common} rate={1.18} className="ml-[2vw] min-w-0 flex-1">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
            {String(index + 1).padStart(2, "0")} — {person.role}
          </p>
          <h3 className="mt-2 font-display text-[clamp(2rem,4.4vw,4rem)] font-semibold leading-[0.95] tracking-[-0.02em] text-text-primary">
            {person.name}
          </h3>
          <p className="mt-3 max-w-[40ch] font-sans text-base leading-snug text-text-secondary">
            {person.line}
          </p>
        </div>
      </Layer>
    </div>
  );
}

/* ── One moving part ─────────────────────────────────────────────────── */

/**
 * A single part of a chapter or a pass. `rate` scales how far it travels: the
 * large photograph is slow, the small type fast. Every value here is derived
 * from `s` alone, so reversing the scroll reverses the movement — each person
 * re-enters from the direction they left.
 */
function Layer({
  person,
  index,
  s,
  view,
  rate,
  box,
  className = "",
  children,
}: {
  person: LabPerson;
  index: number;
  s: MotionValue<number>;
  view: Viewport;
  rate: number;
  box?: Box;
  className?: string;
  children: ReactNode;
}) {
  const inV = ENTER_VECTORS[person.enter];
  const outV = EXIT_VECTORS[person.exit];
  const depth = person.enter === "behind" || person.exit === "back";

  const transform = useTransform(s, (v) => {
    const { enter, exit } = phases(v, index);
    const { w, h } = view.current;
    const x = (inV.x * (1 - enter) + outV.x * exit) * w * rate;
    const y = (inV.y * (1 - enter) + outV.y * exit) * h * rate;
    const scale =
      1 + (inV.scale - 1) * (1 - enter) + (outV.scale - 1) * exit;
    return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
  });

  const opacity = useTransform(s, (v) => {
    const { enter, exit } = phases(v, index);
    return clamp01(enter * 1.25) * (1 - exit);
  });

  const filter = useTransform(s, (v) => {
    const { enter, exit } = phases(v, index);
    const blur = inV.blur * (1 - enter) + outV.blur * exit;
    return blur < 0.15 ? "none" : `blur(${blur.toFixed(2)}px)`;
  });

  // A chapter that has not arrived still covers the screen, so its links
  // would sit invisibly over the one that has. Off until it is actually up.
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  const style: MotionStyle = { transform, opacity, pointerEvents };
  if (depth) style.filter = filter;
  if (box) {
    style.gridColumn = `${box[0]} / span ${box[1]}`;
    style.gridRow = `${box[2]} / span ${box[3]}`;
  }

  return (
    <motion.div
      style={style}
      className={`flex min-w-0 flex-col justify-center ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** A photograph in its frame, drifting slightly the whole time it is on screen. */
function Photo({
  src,
  alt,
  armed,
  onPhoto,
  sizes,
}: {
  src: string;
  alt: string;
  armed: boolean;
  onPhoto: () => void;
  sizes: string;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-bg-surface-raised">
      {armed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          // Eager on purpose. Every photograph but the first is translated
          // off-screen at rest, so next/image's lazy loader would never fetch
          // it, the load count would never complete, and the pin would never
          // release. `armed` is the throttle here, not the viewport.
          loading="eager"
          onLoad={onPhoto}
          onError={onPhoto}
          className="lab-drift object-cover"
        />
      )}
    </div>
  );
}

/* ── The counter and the progress rail ───────────────────────────────── */

/**
 * `00 / 11` through `11 / 11`, digits sliding rather than switching. Each
 * column is a strip of the glyphs that column actually shows, indexed by one
 * continuous position — so the roll speeds up through the second movement on
 * its own, which quietly tells the visitor the section is nearly over.
 */
const TENS = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1", "1"];
const ONES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "1"];

function Counter({ s }: { s: MotionValue<number> }) {
  const n = useTransform(s, counterAt);

  return (
    <div className="absolute right-[2vw] top-[calc(64px+2vh)] flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white">
      <Digits n={n} glyphs={TENS} />
      <Digits n={n} glyphs={ONES} />
      <span className="ml-1">/ 11</span>
    </div>
  );
}

function Digits({ n, glyphs }: { n: MotionValue<number>; glyphs: string[] }) {
  const y = useTransform(n, (v) => `-${clamp01(v / (glyphs.length - 1)) * (glyphs.length - 1)}em`);
  return (
    <span className="block h-[1em] overflow-hidden leading-[1em]">
      <motion.span style={{ y }} className="block will-change-transform">
        {glyphs.map((g, i) => (
          <span key={i} className="block h-[1em] leading-[1em]">
            {g}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * Eleven ticks: four widely spaced, then seven close together, so the shape
 * of the rail itself shows the change of pace and the visitor can always see
 * how much is left.
 */
function Rail({ s }: { s: MotionValue<number> }) {
  return (
    <div
      aria-hidden
      className="absolute right-[2vw] top-1/2 h-[38vh] w-px -translate-y-1/2 bg-white/25"
    >
      {labPeople.map((person, i) => (
        <Tick key={person.id} s={s} index={i} />
      ))}
    </div>
  );
}

function Tick({ s, index }: { s: MotionValue<number>; index: number }) {
  const active = useTransform(s, (v) => {
    const { enter, exit } = phases(v, index);
    return enter * (1 - exit * 0.85);
  });
  const width = useTransform(active, (a) => `${8 + a * 16}px`);
  const opacity = useTransform(active, (a) => 0.3 + a * 0.7);

  return (
    <motion.span
      style={{ top: `${railAt(index) * 100}%`, width, opacity }}
      className="absolute right-0 block h-[2px] bg-white"
    />
  );
}

/* ── Leaving the section ─────────────────────────────────────────────── */

function Outro() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <p className="max-w-[46ch] font-sans text-lg leading-relaxed text-text-secondary">
          Eleven of us, and the work is the sum of what each one brought in.
        </p>
        <Link
          href="/research-team"
          className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-blue-text underline-offset-4 hover:underline"
        >
          The full roster
        </Link>
      </Reveal>
    </div>
  );
}

/* ── Phones, and reduced motion ──────────────────────────────────────── */

/**
 * No pin. Mobile viewports resize as the address bar hides, which a pinned
 * sequence cannot survive, and a headline travelling sideways is unreadable
 * on a narrow screen. The size mismatch between a chapter's photographs and
 * the light canvas are both kept; with `animate` off nothing moves at all and
 * everything renders in its final position.
 */
function StaticSequence({ animate }: { animate: boolean }) {
  const Rise = animate ? Reveal : Passthrough;

  return (
    <section aria-labelledby="lab-people-heading" className="lab-light lab-blueprint bg-bg-primary">
      <div className="relative overflow-hidden">
        <Image
          src={titlePhoto}
          alt="The NCC Lab at work"
          fill
          sizes="100vw"
          className="object-cover [filter:grayscale(0.7)_brightness(0.5)]"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative px-4 py-24 sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
            Meet the lab
          </p>
          <Rise>
            <h2
              id="lab-people-heading"
              className="mt-4 font-display text-[13vw] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-6xl"
            >
              {["People at", "Net-Centric", "Computing Lab"].map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </Rise>
        </div>
      </div>

      <div className="px-4 py-16 sm:px-6">
        {labPeople.slice(0, FULL_CHAPTERS).map((person, i) => (
          <Rise key={person.id}>
            <article className="border-t border-hairline py-12 first:border-t-0 first:pt-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-blue-text">
                {String(i + 1).padStart(2, "0")} — {person.role}
              </p>
              <h3 className="mt-3 font-display text-4xl font-semibold leading-[0.95] tracking-[-0.02em] text-text-primary">
                {person.name}
              </h3>
              <p className="mt-5 font-sans text-xl leading-snug text-text-primary">
                {person.lead}
              </p>

              {/* The mismatch between the three sizes is the composition, so
                  it survives the collapse to one column. */}
              <div className="mt-6 grid grid-cols-6 gap-3">
                <div className="relative col-span-6 aspect-[4/5]">
                  <StackPhoto src={person.photos[0]} alt={person.name} sizes="92vw" />
                </div>
                <div className="relative col-span-4 aspect-[4/3]">
                  <StackPhoto src={person.photos[1]} alt="" sizes="60vw" />
                </div>
                <div className="relative col-span-2 aspect-square">
                  <StackPhoto src={person.photos[2]} alt="" sizes="30vw" />
                </div>
              </div>

              <p className="mt-6 max-w-[46ch] font-sans text-sm leading-relaxed text-text-secondary">
                {person.body}
              </p>
              <dl className="mt-6 max-w-xs">
                {person.experience?.map((row) => (
                  <div
                    key={row.year}
                    className="flex gap-4 border-t border-hairline py-1.5 font-mono text-[11px] uppercase tracking-[0.12em]"
                  >
                    <dt className="text-accent-blue-text">{row.year}</dt>
                    <dd className="text-text-tertiary">{row.what}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/research-team"
                className="mt-5 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary underline-offset-4 hover:text-accent-blue-text hover:underline"
              >
                Full profile
              </Link>
            </article>
          </Rise>
        ))}

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 border-t border-hairline pt-10">
          {labPeople.slice(FULL_CHAPTERS).map((person, i) => (
            <Rise key={person.id}>
              <article>
                <div className="relative aspect-[4/5] w-full">
                  <StackPhoto src={person.photos[0]} alt={person.name} sizes="46vw" />
                </div>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                  {String(FULL_CHAPTERS + i + 1).padStart(2, "0")} — {person.role}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-text-primary">
                  {person.name}
                </h3>
                <p className="mt-2 font-sans text-sm leading-snug text-text-secondary">
                  {person.line}
                </p>
              </article>
            </Rise>
          ))}
        </div>

        <p className="mt-14 max-w-[46ch] font-sans text-lg leading-relaxed text-text-secondary">
          Eleven of us, and the work is the sum of what each one brought in.
        </p>
        <Link
          href="/research-team"
          className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-accent-blue-text underline-offset-4 hover:underline"
        >
          The full roster
        </Link>
      </div>
    </section>
  );
}

function StackPhoto({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="bg-bg-surface-raised object-cover"
    />
  );
}

function Passthrough({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/* ── Small hooks ─────────────────────────────────────────────────────── */

type Viewport = { current: { w: number; h: number } };

/**
 * Viewport size in a ref rather than state: the transforms read it on every
 * animation frame, and reading `window.innerWidth` there instead would force
 * a layout for each of the forty-odd moving parts.
 */
function useViewport(): Viewport {
  const view = useRef({ w: 1440, h: 900 });
  useEffect(() => {
    const measure = () => {
      view.current = { w: window.innerWidth, h: window.innerHeight };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return view;
}

/** False on the server and through hydration, so the markup always agrees. */
function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}
