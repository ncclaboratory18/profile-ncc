"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useSectionProgress } from "@/lib/useSectionProgress";
import { milestones, milestoneKey, type Milestone } from "@/lib/gallery";

/** The site's sticky nav. The pin sits at `top: 0`, so without allowing for
    it the heading band and the top of every frame run underneath the nav —
    the section slides past before you can see what is sliding. */
const NAV = "64px";
/** Height of the heading band above the timeline. */
const HEADER = "56px";
/** Height of the timeline area itself — everything below is sized off it. */
const AREA = `(100vh - ${NAV} - ${HEADER})`;

/**
 * Frame per `size`: height as a fraction of the timeline area, width from
 * that height and the aspect ratio. Sized off the area rather than in px, and
 * capped in `frameBox` against the room its own vertical offset leaves, so a
 * frame can never grow out of the pinned screen.
 */
const SIZE_RATIOS = {
  sm: { h: 0.5, aspect: 1 },
  md: { h: 0.54, aspect: 3 / 4 },
  lg: { h: 0.58, aspect: 4 / 5 },
  tall: { h: 0.62, aspect: 0.7 },
  wide: { h: 0.52, aspect: 16 / 10 },
} as const;

/**
 * A note is prose, so it is measured for reading rather than sized like a
 * picture: wider than any frame slot, and capped where the line length stops
 * being comfortable.
 */
const NOTE_WIDTH = `min(34rem, calc(${AREA} * 1.15))`;

/** Depth in the scene: how big and how bright a frame reads. */
const DEPTHS = {
  far: { scale: 0.93, dim: 0.45 },
  mid: { scale: 0.97, dim: 0.25 },
  near: { scale: 1, dim: 0.1 },
} as const;

function frameBox(m: Milestone) {
  const { h, aspect } = SIZE_RATIOS[m.size];
  // Room left once the frame has been shifted off centre, less the 3% it
  // grows by when it lights up.
  const capped = Math.min(h, (0.94 - 2 * Math.abs(m.offset)) / 1.03);
  return {
    height: `calc(${AREA} * ${capped})`,
    width: `calc(${AREA} * ${capped * aspect})`,
  };
}

type Link = { d: string; head: string };

type Box = { left: number; right: number; mid: number };

type Metrics = {
  /** Layout centre of each item within the track, px. */
  centers: number[];
  /** Track translate that centres the first item / the last item. */
  from: number;
  to: number;
  vw: number;
  /** Track box, for the connector overlay's viewBox. */
  width: number;
  height: number;
  /** Connectors — only between neighbouring photo entries, see `measure`. */
  links: Link[];
  /** Centre of each connector in track coordinates, px. */
  linkCenters: number[];
};

/**
 * Milestone timeline: the section is pinned and vertical scroll drives the
 * track sideways. There is no rail — each milestone is a frame with its text
 * set beside it, dropped at its own height, and a drawn arrow hops from one
 * frame to the next. Arrows are measured off the real boxes after layout, so
 * they start and land *on* the frames instead of near them.
 *
 * Progress comes from `useSectionProgress` (the section's live rect, sampled
 * each frame) so it stays in step with Lenis' eased scroll — Motion's cached
 * `useScroll` drifts against it.
 */
export function Milestones() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const progress = useSectionProgress(sectionRef);
  const x = useTransform(progress, (p) => trackX(p, metrics));

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduce) return;

    // The track is `w-max`, so its own border box is the full content width
    // and the observer fires whenever that content grows or shrinks.
    function measure() {
      if (!track) return;
      const items = Array.from(
        track.querySelectorAll<HTMLElement>("[data-milestone]"),
      );
      if (!items.length) return;

      // Rects relative to the track: its own scroll transform cancels out, and
      // each item's vertical offset (also a transform) is included — which
      // offsetTop would miss.
      const base = track.getBoundingClientRect();
      const boxes: Box[] = items.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          left: r.left - base.left,
          right: r.right - base.left,
          mid: r.top - base.top + r.height / 2,
        };
      });
      // Top of each item's text column: the arrow runs through the space that
      // column sits in, so it has to stay clear of it.
      const textTops = items.map((el) => {
        const t = el.lastElementChild;
        return t ? t.getBoundingClientRect().top - base.top : Infinity;
      });

      // Arrows run frame-to-frame, not item-to-item: an item box includes its
      // text column, so centring on that puts the arrow off to one side of
      // the picture it is supposed to sit between.
      const frames: Box[] = items.map((el) => {
        const f = (el.querySelector<HTMLElement>("[data-frame]") ?? el);
        const r = f.getBoundingClientRect();
        // The frame carries an animated `scale`, and a rect includes
        // transforms — so measuring it raw pins every arrow to whatever size
        // the frames happened to be at on this particular pass, which is why
        // some arrows landed off their frames. Divide the scale back out
        // (`origin-bottom`, so the bottom edge and the horizontal centre are
        // the fixed points) and work from the frame's stable layout box.
        const t = getComputedStyle(f).transform;
        const scale = t && t !== "none" ? new DOMMatrixReadOnly(t).a || 1 : 1;
        const w = r.width / scale;
        const h = r.height / scale;
        const cx = r.left + r.width / 2 - base.left;
        const bottom = r.bottom - base.top;
        return {
          left: cx - w / 2,
          right: cx + w / 2,
          // Upper third: the text column is bottom-aligned, so a line drawn
          // through here clears it.
          mid: bottom - h * 0.7,
        };
      });

      const vw = document.documentElement.clientWidth;
      const centres = boxes.map((b) => (b.left + b.right) / 2);
      const pairs = milestones
        .slice(0, -1)
        .map((m, i) => [i, m] as const)
        .filter(([i, m]) => m.src && milestones[i + 1].src);
      setMetrics({
        centers: centres,
        vw,
        from: vw / 2 - centres[0],
        to: vw / 2 - centres[centres.length - 1],
        width: base.width,
        height: base.height,
        // A note panel is already a block of words; an arrow into or out of
        // one just adds noise, so the chain only draws between photographs.
        links: pairs.map(([i]) => connector(frames[i], frames[i + 1], textTops[i] - 14)),
        linkCenters: pairs.map(([i]) => (frames[i].right + frames[i + 1].left) / 2),
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
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className="bg-accent-blue px-3 py-1 font-mono text-xl font-bold uppercase tracking-[0.12em] text-white sm:text-2xl">
        Milestones
      </h2>
      <span className="border-2 border-hairline-strong px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
        {milestones[0].year}/{milestones[milestones.length - 1].year}
      </span>
    </div>
  );

  if (reduce) {
    return (
      <section ref={sectionRef} className="border-t-2 border-hairline-strong py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{heading}</div>
        <div className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {milestones.map((m) => (
            <div key={milestoneKey(m)} className="flex shrink-0 snap-center items-end gap-4">
              {/* Same split as the pinned track: `Frame` renders a photograph
                  and nothing else, so a note has to take the other branch or
                  it reaches `PhotoFill` with no `src`. */}
              {m.src ? (
                <>
                  <div style={{ width: `min(60vw, ${frameBox(m).width})` }}>
                    <Frame milestone={m} />
                  </div>
                  <Marker milestone={m} />
                </>
              ) : (
                <div style={{ width: `min(80vw, ${NOTE_WIDTH})` }}>
                  <Note milestone={m} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[700vh] border-t-2 border-hairline-strong">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden pt-16">
        <div
          className="mx-auto flex w-full max-w-7xl shrink-0 items-end px-4 pb-2 sm:px-6 lg:px-8"
          style={{ height: HEADER }}
        >
          {heading}
        </div>

        <div className="relative flex-1">
          <motion.div
            ref={trackRef}
            style={{ x, opacity: metrics ? 1 : 0 }}
            className="relative flex h-full w-max items-center gap-[2.2vw] px-[4vw] will-change-transform"
          >
            {metrics && (
              <svg
                aria-hidden
                viewBox={`0 0 ${metrics.width} ${metrics.height}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 z-0 h-full w-full text-accent-blue"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="butt"
              >
                {metrics.links.map((link, i) => (
                  <Connector
                    key={i}
                    link={link}
                    index={i}
                    progress={progress}
                    metrics={metrics}
                  />
                ))}
              </svg>
            )}

            {milestones.map((m, i) => (
              <MilestoneItem
                key={milestoneKey(m)}
                milestone={m}
                index={i}
                progress={progress}
                metrics={metrics}
                priority={i < 2}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Track translate at progress `p` — first item centred at 0, last at 1. */
function trackX(p: number, m: Metrics | null): number {
  return m ? m.from + p * (m.to - m.from) : 0;
}

/**
 * How far a milestone has "arrived", 0..1 — 0 while it is more than a lead-in
 * away from centre, 1 from the moment it reaches centre and *stays* there.
 * One-way on purpose: an arrow that un-draws itself once you have gone past
 * it reads as a glitch.
 */
function arrival(centre: number, p: number, m: Metrics | null, leadScreens = 0.7): number {
  if (!m) return 0;
  const span = m.to - m.from;
  if (!span) return 0;
  const hit = (m.vw / 2 - m.from - centre) / span;
  const lead = Math.abs((m.vw * leadScreens) / span);
  return Math.max(0, Math.min(1, (p - hit + lead) / lead));
}

/** 0 when the item is a third of a screen off centre, 1 when dead centre. */
function centredness(i: number, p: number, m: Metrics | null): number {
  if (!m) return 0;
  const d = Math.abs(m.centers[i] + trackX(p, m) - m.vw / 2);
  return Math.max(0, Math.min(1, 1 - d / (m.vw * 0.34)));
}

type Pt = { x: number; y: number };

/** Every arrow is drawn to the same length and the same bow. */
const ARROW_LEN = 120;
const ARROW_BOW = 0.18;
const HEAD_LEN = 13;

/**
 * Arrow between two milestones: one fixed-length, fixed-curvature mark,
 * centred in the run between the two pictures and rotated to lie along it —
 * so the head points at the next frame while every arrow on the rail reads
 * as the same stroke.
 *
 * An earlier version cut a slice out of each frame-to-frame curve, which
 * made every arrow a different length and a different bend.
 */
function connector(a: Box, b: Box, ceiling: number): Link {
  const A = { x: a.right, y: a.mid };
  const B = { x: b.left, y: b.mid };
  const run = Math.hypot(B.x - A.x, B.y - A.y) || 1;
  const ux = (B.x - A.x) / run;
  const uy = (B.y - A.y) / run;

  // Upward normal, so every arrow arcs over its run instead of sagging.
  const nx = uy > 0 ? uy : -uy;
  const ny = uy > 0 ? -ux : ux;

  const len = Math.min(ARROW_LEN, run * 0.6);
  const bow = len * ARROW_BOW;
  const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };

  const from = { x: mid.x - (ux * len) / 2, y: mid.y - (uy * len) / 2 };
  const to = { x: mid.x + (ux * len) / 2, y: mid.y + (uy * len) / 2 };
  const c1 = { x: from.x + ux * len * 0.35 + nx * bow, y: from.y + uy * len * 0.35 + ny * bow };
  const c2 = {
    x: to.x - ux * len * 0.28 + nx * bow * 0.45,
    y: to.y - uy * len * 0.28 + ny * bow * 0.45,
  };

  // `ceiling` is the top of the text column the arrow flies over. Lifting the
  // whole mark clear of it keeps its length and bend identical to the rest.
  const lift = Math.max(0, Math.max(...sample([from, c1, c2, to]).map((p) => p.y)) - ceiling);
  const up = (p: Pt) => ({ x: p.x, y: p.y - lift });
  const [q0, q1, q2, q3] = [from, c1, c2, to].map(up);

  const angle = Math.atan2(q3.y - q2.y, q3.x - q2.x);
  const wing = (spread: number) => {
    const t = angle + spread;
    return `M ${q3.x} ${q3.y} L ${q3.x - Math.cos(t) * HEAD_LEN} ${q3.y - Math.sin(t) * HEAD_LEN}`;
  };

  return {
    d: `M ${q0.x} ${q0.y} C ${q1.x} ${q1.y} ${q2.x} ${q2.y} ${q3.x} ${q3.y}`,
    head: `${wing(0.42)} ${wing(-0.42)}`,
  };
}

/** Points along a cubic, for the clearance check. */
function sample([p0, p1, p2, p3]: Pt[]): Pt[] {
  const at = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
  };
  return Array.from({ length: 13 }, (_, i) => at(i / 12));
}

/** One arrow, drawn as the milestone it points at comes in. */
function Connector({
  link,
  index,
  progress,
  metrics,
}: {
  link: Link;
  index: number;
  progress: MotionValue<number>;
  metrics: Metrics;
}) {
  // Keyed to the arrow's own place on screen, not the frame it points at:
  // keying it to the frame meant half the draw happened off the left edge,
  // and you only ever saw the tail end of it.
  const a = useTransform(progress, (p) =>
    arrival(metrics.linkCenters[index], p, metrics, 0.8),
  );
  const stem = useTransform(a, [0.08, 0.74], [0, 1], { clamp: true });
  const tip = useTransform(a, [0.7, 0.98], [0, 1], { clamp: true });
  const fade = useTransform(a, [0, 0.06], [0, 0.85], { clamp: true });

  return (
    <motion.g style={{ opacity: fade }}>
      <motion.path d={link.d} style={{ pathLength: stem }} />
      <motion.path d={link.head} style={{ pathLength: tip }} />
    </motion.g>
  );
}

function MilestoneItem({
  milestone,
  index,
  progress,
  metrics,
  priority,
}: {
  milestone: Milestone;
  index: number;
  progress: MotionValue<number>;
  metrics: Metrics | null;
  priority?: boolean;
}) {
  const box = frameBox(milestone);
  const depth = DEPTHS[milestone.depth];
  // Half the frame's widest overhang past its layout box; see the caption
  // below. A frame that never scales past 1 has none.
  const overhang = Math.max(0, (depth.scale * 1.03 - 1) / 2);
  const bleed = overhang ? `calc(${box.width} * ${overhang})` : undefined;

  const t = useTransform(progress, (p) => centredness(index, p, metrics));
  const scale = useTransform(t, [0, 1], [depth.scale * 0.97, depth.scale * 1.03]);
  const veil = useTransform(t, [0, 1], [Math.min(1, depth.dim + 0.55), 0]);
  const ring = useTransform(t, [0, 1], [0, 1]);
  const textFade = useTransform(t, [0, 1], [0.3, 1]);
  const textShift = useTransform(t, [0, 1], [16, 0]);

  // A note carries no picture, so it gets none of the frame's apparatus: no
  // border, no veil, no accent slab behind it. Just the words, set on the
  // canvas, brightening as they come to centre like everything else does.
  if (!milestone.src) {
    return (
      <div
        data-milestone
        className="relative z-10 flex shrink-0 items-end"
        style={{ transform: `translateY(calc(${AREA} * ${milestone.offset}))` }}
      >
        <motion.div
          data-frame
          style={{ opacity: textFade, y: textShift, width: NOTE_WIDTH }}
        >
          <Note milestone={milestone} />
        </motion.div>
      </div>
    );
  }

  return (
    <div
      data-milestone
      className="relative z-10 flex shrink-0 items-end gap-6 sm:gap-8"
      style={{ transform: `translateY(calc(${AREA} * ${milestone.offset}))` }}
    >
      <motion.div
        data-frame
        style={{ scale, width: box.width }}
        className="relative origin-bottom"
      >
        <Frame milestone={milestone} priority={priority} veil={veil} ring={ring} />
      </motion.div>

      {milestone.src && (
        // `scale` is a transform, so a frame that grows past 1 grows *over*
        // the gap the flex row reserves — and each depth scales by a
        // different amount, which is why some captions sat closer to their
        // photo than others. Pushing the caption out by the frame's own
        // widest overhang makes the gap read the same on every entry.
        <motion.div
          style={{ opacity: textFade, y: textShift, marginLeft: bleed }}
        >
          <Marker milestone={milestone} />
        </motion.div>
      )}
    </div>
  );
}

/**
 * What happened, beside the frame — read as a sentence rather than three
 * stacked labels, and with nothing drawn around it. The year leads the line
 * instead of sitting in its own solid block: it is the first word of the
 * sentence, not a badge attached to one.
 */
function Marker({ milestone }: { milestone: Milestone }) {
  return (
    <div className="w-[clamp(160px,12vw,230px)] pb-2">
      <p className="font-sans text-base leading-snug text-text-primary sm:text-lg">
        <span className="font-mono font-bold text-accent-blue-text">
          {milestone.year}
        </span>{" "}
        {milestone.caption}.
      </p>
      <p className="mt-2 font-sans text-sm leading-relaxed text-text-tertiary">
        {milestone.meta}
      </p>
    </div>
  );
}

/**
 * A frame lights as it crosses centre: a dark veil over it fades away and an
 * accent ring fades in. Both are opacity — compositor-only — so a rail of a
 * dozen frames restyling every scroll frame stays cheap. Animating a CSS
 * `filter` here instead repaints the whole rail on every tick.
 */
function Frame({
  milestone,
  priority,
  veil,
  ring,
}: {
  milestone: Milestone;
  priority?: boolean;
  veil?: MotionValue<number>;
  ring?: MotionValue<number>;
}) {
  return (
    // A mat, not a box: rule, then a margin of bare ground, then the picture.
    // The rounding is the one softened corner left on the site and it is
    // deliberate — it belongs to the *mount*, which is an object, while the
    // photograph inside stays perfectly square. Rounding both would read as a
    // rounded card; rounding neither loses the sense that the picture is
    // sitting in something.
    //
    // The margin is the page's own background, not a surface tone, so the
    // mount reads as an opening cut in the page rather than a panel laid on
    // top of it.
    <div
      className="relative w-full rounded-[10px] border-2 border-hairline-strong bg-bg-primary p-2 sm:p-2.5"
      style={{ height: frameBox(milestone).height }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <PhotoFill milestone={milestone} priority={priority} />

        {/* Approaching, a photograph is an accent-inked plate; arriving, the
            ink lifts and it resolves to plain black and white. One multiply
            layer does the tint and the dimming together, so the whole
            treatment stays a single compositor-only opacity. Inside the mat,
            so it inks the picture and not its mount. */}
        {veil && (
          <motion.div
            style={{ opacity: veil }}
            className="pointer-events-none absolute inset-0 bg-accent-blue mix-blend-multiply"
          />
        )}

        {/* The one drawn mark: a rule the photograph lands on, ruled in from
            the left as it reaches centre. Static where there is no scroll to
            key it to (the reduced-motion rail). */}
        {ring ? (
          <motion.div
            style={{ scaleX: ring }}
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left bg-accent-blue"
          />
        ) : (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-accent-blue" />
        )}
      </div>
    </div>
  );
}

/** Photo entry. */
function PhotoFill({ milestone, priority }: { milestone: Milestone; priority?: boolean }) {
  return (
    <Image
      src={milestone.src!}
      alt={milestone.caption}
      fill
      sizes="(min-width: 1024px) 40vw, 80vw"
      priority={priority}
      className="object-cover [filter:grayscale(1)_contrast(1.18)]"
    />
  );
}

/**
 * Note entry: the parts of the story a photograph cannot carry, set as prose
 * standing where a picture would be. No frame, no fill, no rule — the break in
 * rhythm between a wall of framed photographs and a bare paragraph is what
 * marks it, so anything drawn around it would only soften that.
 */
function Note({ milestone }: { milestone: Milestone }) {
  return (
    <div className="pb-2">
      <p className="inline-block bg-accent-blue px-2 py-0.5 font-mono text-xl font-bold leading-none text-white sm:text-2xl">
        {milestone.year}
      </p>
      <p className="mt-5 font-display text-2xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-3xl">
        {milestone.caption}
      </p>
      <p className="mt-4 max-w-[54ch] font-sans text-base leading-relaxed text-text-secondary">
        {milestone.body}
      </p>
      <p className="mt-5 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
        [ {milestone.meta} ]
      </p>
    </div>
  );
}
