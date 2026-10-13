"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useSectionProgress } from "@/lib/useSectionProgress";
import {
  HERO_DIRECTION,
  ASSEMBLE_REACH,
  LAB_CONFIG,
  assembleOffset,
  clamp01,
  depthOf,
  heroScreens,
  labPeople,
  layoutFor,
  membersPath,
  sequencePhotos,
  titlePhoto,
  type LabPerson,
  type MoverKind,
  type PartKind,
} from "@/lib/labPeople";
import { memberAt, type Point } from "@/lib/labPath";

/**
 * "Meet the amazing people at Net-Centric Computing Lab" — two pinned,
 * scroll-driven stretches of the home page. First a headline far wider than
 * the screen, slid sideways by the scroll. Then a large 2D canvas with every
 * member scattered along a winding path, which the viewport travels like a
 * camera — down-right, across, up-right, and on — so people arrive from the
 * bottom, the side, or the top depending on which way the path is turning.
 *
 * Each member is one rigid cluster — photographs, text, description, card —
 * laid out on a grid around its anchor and small enough to fit one screen,
 * with a clear stretch of empty canvas before the next. The camera moves at
 * constant speed along the path (scroll maps linearly to distance
 * travelled), smoothed toward the scroll position each frame. Nothing ever
 * fades: people enter and leave only by sliding past the edges of the
 * screen. Every tunable is in `LAB_CONFIG` (`lib/labPeople.ts`); the path
 * math is in `lib/labPath.ts`.
 *
 * Under reduced motion there is no pin and no animation at all: the headline
 * sits still and the same clusters stack in a plain vertical sequence. Every
 * name, role, and description is in the DOM in reading order in both paths.
 */
export function MeetTheLab() {
  const reduce = useReducedMotion();
  if (reduce) return <StaticSequence />;
  return <PinnedSequence />;
}

const HEADLINE = "Meet the amazing people at Net-Centric Computing Lab";

/* ── The pinned sequence ─────────────────────────────────────────────── */

function PinnedSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();

  // Every photograph is held until the section is close, then loaded
  // together, and the members' sequence does not start until they are in — a
  // first scroll through a half-loaded pin stutters. The long headline pin
  // in front gives them several screens to arrive.
  const [armed, setArmed] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const gate = useMotionValue(0);

  useEffect(() => {
    const el = rootRef.current;
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
  // the visitor pinned with nowhere to scroll.
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

  return (
    <div ref={rootRef}>
      <HeroScroller desktop={desktop} armed={armed} onPhoto={onPhoto} />
      <PinnedMembers desktop={desktop} gate={gate} armed={armed} onPhoto={onPhoto} />
      <Outro />
    </div>
  );
}

/* ── Part 1: the headline ────────────────────────────────────────────── */

/**
 * A tall section with a sticky screen inside it. The headline is set on one
 * line at a size several screens wide, and the section's scroll progress is
 * mapped straight onto its `translateX`: from its first words at the start
 * to its last words at the end, so it reads in order as it slides right to
 * left (flip with `HERO_DIRECTION`), and the whole sentence passes before
 * the section unpins.
 */
function HeroScroller({
  desktop,
  armed,
  onPhoto,
}: {
  desktop: boolean;
  armed: boolean;
  onPhoto: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progress = useSectionProgress(sectionRef);

  // How far the line has to travel: its width past the box it sits in.
  // Measured by a ResizeObserver, so it follows viewport changes and the web
  // font swapping in.
  const travel = useRef(0);
  useEffect(() => {
    const el = titleRef.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const measure = () => {
      const pad = getComputedStyle(box);
      const inner =
        box.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight);
      travel.current = Math.max(0, el.offsetWidth - inner);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const x = useTransform(progress, (p) => {
    // -1: "MEET" on screen at the start, "…LAB" at the end.
    const t = HERO_DIRECTION === 1 ? 1 - p : p;
    return -t * travel.current;
  });
  const plateX = useTransform(progress, (p) => `${(p - 0.5) * 6}%`);
  const plateScale = useTransform(progress, (p) => 1.1 + p * 0.1);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="lab-people-heading"
      className="relative bg-[#05070a] [overflow-x:clip]"
      style={{ height: `calc((1 + ${heroScreens(desktop)}) * 100svh)` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ x: plateX, scale: plateScale }} className="absolute inset-0">
          {armed && (
            <Image
              src={titlePhoto}
              alt=""
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

        <p className="absolute left-[5vw] top-[calc(64px+3vh)] font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
          Meet the lab — {labPeople.length} people
        </p>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden px-[3vw]">
          <motion.h2
            ref={titleRef}
            id="lab-people-heading"
            style={{ x }}
            className="lab-hero-title w-max font-display font-bold uppercase tracking-[-0.02em] text-white"
          >
            {HEADLINE}
          </motion.h2>
        </div>
      </div>
    </section>
  );
}

/* ── Part 2: the members ─────────────────────────────────────────────── */

/** Cluster size and gaps from LAB_CONFIG, for the CSS in globals.css. */
const CLUSTER_VARS = {
  "--cluster-w": LAB_CONFIG.cluster.w,
  "--cluster-h": LAB_CONFIG.cluster.h,
  "--cluster-w-m": LAB_CONFIG.mobileCluster.w,
  "--cluster-gap": `${LAB_CONFIG.gap}px`,
  "--cluster-gap-m": `${LAB_CONFIG.mobileGap}px`,
} as CSSProperties;

/** Present only on the pinned path; the static path renders without it. */
const LabCtx = createContext<{ armed: boolean; onPhoto: () => void } | null>(null);

function PinnedMembers({
  desktop,
  gate,
  armed,
  onPhoto,
}: {
  desktop: boolean;
  gate: MotionValue<number>;
  armed: boolean;
  onPhoto: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const n = labPeople.length;

  // The pinned screen's size. Read from the sticky element itself, which is
  // 100svh tall, so a phone's address bar showing and hiding does not
  // reshape the path under the visitor's finger.
  const [size, setSize] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { path, anchors } = useMemo(
    () => membersPath(desktop, size.w, size.h),
    [desktop, size],
  );
  const pinPx = path.length * LAB_CONFIG.scrollPerPathPx;

  // Each member's cluster, moved as one piece by the camera loop for the
  // whole-cluster parallax, and searched for the parts that assemble inside
  // it. Nothing re-renders while scrolling.
  const clusters = useRef<(HTMLElement | null)[]>([]);
  const index = useMotionValue(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const { w, h } = size;
    const L = path.length;
    const { smoothing, parallax } = LAB_CONFIG;

    let current = 0;
    let written = Number.NaN;
    let snap = true;
    let running = true;
    let frame = 0;
    let last = performance.now();

    // The parts that assemble around each member's title, with the unit
    // direction from the title's centre to theirs, read from layout. The
    // offset last written is taken off before measuring, so the reading never
    // depends on where the camera happened to be.
    type Mover = { el: HTMLElement; kind: MoverKind; dx: number; dy: number; tx: number; ty: number };
    let movers: Mover[][] = [];
    const settled: boolean[] = [];
    let needsMeasure = true;
    const measure = () => {
      const prev = new Map(movers.flat().map((m) => [m.el, m]));
      movers = clusters.current.map((cluster) => {
        const title = cluster?.querySelector<HTMLElement>("[data-lab-title]");
        if (!cluster || !title) return [];
        const t = title.getBoundingClientRect();
        const tx = t.left + t.width / 2;
        const ty = t.top + t.height / 2;
        return [...cluster.querySelectorAll<HTMLElement>("[data-lab-move]")].map((el) => {
          const old = prev.get(el);
          const r = el.getBoundingClientRect();
          const vx = r.left + r.width / 2 - (old?.tx ?? 0) - tx;
          const vy = r.top + r.height / 2 - (old?.ty ?? 0) - ty;
          const len = Math.hypot(vx, vy) || 1;
          return {
            el,
            kind: el.dataset.labMove as MoverKind,
            dx: vx / len,
            dy: vy / len,
            tx: old?.tx ?? 0,
            ty: old?.ty ?? 0,
          };
        });
      });
      settled.length = 0;
      needsMeasure = false;
      written = Number.NaN;
    };
    document.fonts?.ready.then(() => {
      needsMeasure = true;
    });

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!running) return;

      const rect = section.getBoundingClientRect();
      const span = rect.height - h;
      const p = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
      const target = gate.get() ? p * L : 0;

      // Frame-rate independent lerp: the same feel at 60Hz and 120Hz.
      const k = 1 - Math.pow(1 - smoothing, (now - last) / (1000 / 60));
      last = now;
      current = snap || smoothing >= 1 ? target : current + (target - current) * k;
      snap = false;

      if (needsMeasure) measure();
      if (Math.abs(current - written) < 0.05) return;
      written = current;

      const c = path.pointAt(current);
      canvas.style.transform = `translate3d(${(w / 2 - c.x).toFixed(1)}px, ${(h / 2 - c.y).toFixed(1)}px, 0)`;

      // Parallax relative to each cluster's own anchor: exactly in place when
      // the camera is on the member, a few percent off as it moves away.
      if (parallax) {
        for (let i = 0; i < n; i++) {
          const el = clusters.current[i];
          if (!el) continue;
          const d = depthOf(i) - 1;
          const a = anchors[i];
          el.style.transform = `translate3d(${((a.x - c.x) * d).toFixed(1)}px, ${((a.y - c.y) * d).toFixed(1)}px, 0)`;
        }
      }

      // Assemble / disassemble: each part sits out from the title by an
      // amount that eases to nothing as the camera reaches the member's
      // anchor. A member already fully spread, and still beyond reach, is
      // left alone — only the two or three nearest the camera are written.
      const seg = L / n;
      for (let i = 0; i < n; i++) {
        const d = current / seg - 0.5 - i;
        const far = Math.abs(d) >= ASSEMBLE_REACH;
        if (far && settled[i]) continue;
        settled[i] = far;
        for (const m of movers[i] ?? []) {
          const off = assembleOffset(d, m.kind, desktop);
          m.tx = m.dx * off;
          m.ty = m.dy * off;
          m.el.style.transform = `translate3d(${m.tx.toFixed(1)}px, ${m.ty.toFixed(1)}px, 0)`;
        }
      }

      index.set(memberAt(current, L, n));
    };
    frame = requestAnimationFrame(tick);

    // Nothing to do while the section is nowhere near the screen. Coming
    // back, the camera jumps to where it should be rather than gliding there
    // from wherever it was left.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) snap = true;
        running = entry.isIntersecting;
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(section);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [path, anchors, size, gate, index, n, desktop]);

  const vars = {
    "--lab-grid-angle": `${LAB_CONFIG.gridAngleDeg}deg`,
    ...CLUSTER_VARS,
  } as CSSProperties;

  return (
    <LabCtx.Provider value={{ armed, onPhoto }}>
      <section
        ref={sectionRef}
        aria-label="Lab members"
        className="lab-dark relative [overflow-x:clip]"
        style={{ height: `calc(${pinPx.toFixed(0)}px + 100svh)` }}
      >
        {/* The grid is on the pinned screen, so it stays put while the
            canvas travels over it. */}
        <div ref={screenRef} className="lab-blueprint sticky top-0 h-[100svh] overflow-hidden" style={vars}>
          <div ref={canvasRef} data-lab-canvas className="absolute left-0 top-0 will-change-transform">
            {labPeople.map((person, i) => (
              <MemberPanel
                key={person.id}
                person={person}
                index={i}
                anchor={anchors[i]}
                clusterRef={(el) => {
                  clusters.current[i] = el;
                }}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 z-20">
            <Counter index={index} />
            <Rail index={index} />
          </div>
        </div>
      </section>
    </LabCtx.Provider>
  );
}

/** One part of a member: a cell of their cluster's grid. Every part but the
 *  text slides as a whole when the cluster assembles. */
function Part({
  kind,
  moves = true,
  children,
}: {
  kind: PartKind;
  moves?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`lab-part lab-part--${kind}`} data-lab-move={moves ? kind : undefined}>
      {children}
    </div>
  );
}

/**
 * The one template every member is drawn from, as a single cluster: a big
 * photograph and a second one, the text block (rule, dot, research area,
 * name, headline), the profile photograph beside the longer description, and
 * the details card. The parts sit in the cells of one grid with fixed gaps,
 * arranged by `layoutFor(index)` on desktop so neighbours never look alike,
 * and stacked on phones. A field the member has no data for is simply not
 * rendered.
 */
function MemberPanel({
  person,
  index,
  anchor,
  clusterRef,
  flow = false,
}: {
  person: LabPerson;
  index: number;
  /** Where the member sits on the canvas, in px. Omitted in flow. */
  anchor?: Point;
  clusterRef?: (el: HTMLElement | null) => void;
  /** Normal flow instead of the canvas (reduced motion). */
  flow?: boolean;
}) {
  const [profile, wide, accent] = person.photos;
  const hasCard = !!(person.skills?.length || person.experience?.length);
  const L = layoutFor(index);
  const grid = { "--cols": L.columns, "--rows": L.rows, "--areas": L.areas } as CSSProperties;

  return (
    <article
      ref={clusterRef}
      aria-label={person.name}
      style={anchor ? { left: anchor.x, top: anchor.y } : undefined}
      className={`lab-member ${flow ? "lab-member--flow" : ""}`}
    >
      <div className="lab-cluster" style={grid}>
        <Part kind="text" moves={false}>
          <div className="lab-m-head">
            <div className="lab-m-label" data-lab-move="label">
              <div className="lab-m-rule" />
              <p className="lab-m-role">
                <span aria-hidden className="lab-m-dot" />
                <span className="font-mono text-text-tertiary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {person.role}
              </p>
            </div>
            {/* The still centre the other parts gather around. */}
            <div className="lab-m-title" data-lab-title>
              <h3 className="lab-m-name">{person.name}</h3>
              {person.lead && <p className="lab-m-lead">{person.lead}</p>}
            </div>
          </div>
        </Part>

        <Part kind="detail">
          <div className="lab-m-detail">
            {profile && (
              <div className="lab-m-profile">
                <Photo src={profile} alt={person.name} sizes="(min-width: 1024px) 8vw, 25vw" />
              </div>
            )}
            <div className="min-w-0">
              {person.body && <p className="lab-m-body">{person.body}</p>}
              <Link
                href="/research-team"
                className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary underline-offset-4 hover:text-accent-blue-text hover:underline"
              >
                Full profile
              </Link>
            </div>
          </div>
        </Part>

        {hasCard && (
          <Part kind="card">
            <DetailsCard person={person} />
          </Part>
        )}

        {wide && (
          <Part kind="photo">
            <Photo src={wide} alt="" sizes="(min-width: 1024px) 26vw, 55vw" />
          </Part>
        )}

        {accent && (
          <Part kind="accent">
            <Photo src={accent} alt="" sizes="(min-width: 1024px) 22vw, 35vw" />
          </Part>
        )}
      </div>
    </article>
  );
}

/** Skills, and the timeline one entry at a time with prev/next arrows. */
function DetailsCard({ person }: { person: LabPerson }) {
  const rows = person.experience ?? [];
  const [i, setI] = useState(0);
  const row = rows[i];
  const step = (d: number) => setI((n) => (n + d + rows.length) % rows.length);

  return (
    <div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-hairline bg-bg-surface-raised/80 p-4 backdrop-blur-sm">
      {person.skills?.length ? (
        <ul aria-label="Skills" className="flex flex-wrap gap-1.5">
          {person.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}

      {row && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-blue-text">
            {row.year}
          </p>
          <p className="mt-1 font-sans text-sm leading-snug text-text-primary">{row.what}</p>
          {rows.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous"
                className="flex h-8 w-10 -skew-x-6 items-center justify-center border border-hairline-strong text-text-primary hover:border-accent-blue-text"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next"
                className="flex h-8 w-10 -skew-x-6 items-center justify-center border border-hairline-strong text-text-primary hover:border-accent-blue-text"
              >
                →
              </button>
              <span className="ml-1 font-mono text-[10px] text-text-tertiary">
                {i + 1} / {rows.length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** A photograph with rounded corners, drifting slightly the whole time it is on screen. */
function Photo({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const lab = useContext(LabCtx);
  const armed = lab ? lab.armed : true;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-bg-surface-raised">
      {armed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          // Eager on the pinned path, on purpose. Most of the canvas is off
          // screen at rest, so next/image's lazy loader would never fetch it,
          // the load count would never complete, and the gate would only open
          // on its timer. `armed` is the throttle there, not the viewport.
          loading={lab ? "eager" : "lazy"}
          onLoad={lab?.onPhoto}
          onError={lab?.onPhoto}
          className="lab-drift object-cover"
        />
      )}
    </div>
  );
}

/* ── The counter and the progress rail ───────────────────────────────── */

const COUNTS = Array.from({ length: labPeople.length + 1 }, (_, k) => k);
const TENS = COUNTS.map((k) => String(Math.floor(k / 10) % 10));
const ONES = COUNTS.map((k) => String(k % 10));

/** `01 / 11` onward, following whichever member the camera is nearest. */
function Counter({ index }: { index: MotionValue<number> }) {
  const n = useTransform(index, (v) => v + 1);

  return (
    <div className="absolute right-[2vw] top-[calc(64px+2vh)] flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white">
      <Digits n={n} glyphs={TENS} />
      <Digits n={n} glyphs={ONES} />
      <span className="ml-1 text-white/60">/ {String(labPeople.length).padStart(2, "0")}</span>
    </div>
  );
}

function Digits({ n, glyphs }: { n: MotionValue<number>; glyphs: string[] }) {
  const y = useTransform(n, (v) => `-${Math.min(Math.max(v, 0), glyphs.length - 1)}em`);
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

/** One tick per member, evenly spaced; the nearest member's is extended.
 *  Width only — the ticks never dim. */
function Rail({ index }: { index: MotionValue<number> }) {
  return (
    <div
      aria-hidden
      className="absolute right-[2vw] top-1/2 h-[38vh] w-px -translate-y-1/2 bg-white/25"
    >
      {labPeople.map((person, i) => (
        <Tick key={person.id} index={index} member={i} />
      ))}
    </div>
  );
}

function Tick({ index, member }: { index: MotionValue<number>; member: number }) {
  const active = useTransform(index, (v) => clamp01(1 - Math.abs(v - member)));
  const width = useTransform(active, (a) => `${6 + a * 18}px`);
  const n = labPeople.length;

  return (
    <motion.span
      style={{ top: `${(n > 1 ? member / (n - 1) : 0) * 100}%`, width }}
      className="absolute right-0 block h-[2px] bg-white"
    />
  );
}

/* ── Leaving the section ─────────────────────────────────────────────── */

function Outro() {
  return (
    <div className="lab-dark">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="max-w-[46ch] font-sans text-lg leading-relaxed text-text-secondary">
          Eleven of us, and the work is the sum of what each one brought in.
        </p>
        <Link
          href="/research-team"
          className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-blue-text underline-offset-4 hover:underline"
        >
          The full roster
        </Link>
      </div>
    </div>
  );
}

/* ── Reduced motion ──────────────────────────────────────────────────── */

/**
 * No pin, no sideways headline, and no animation of any kind. The headline
 * wraps at a size that fits, and each member is the same cluster, stacked in
 * normal flow and simply there.
 */
function StaticSequence() {
  return (
    <>
      <section aria-labelledby="lab-people-heading" className="relative overflow-hidden bg-[#05070a]">
        <Image
          src={titlePhoto}
          alt=""
          fill
          sizes="100vw"
          className="object-cover [filter:grayscale(0.7)_brightness(0.5)]"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative px-[5vw] py-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
            Meet the lab — {labPeople.length} people
          </p>
          <h2
            id="lab-people-heading"
            className="mt-4 font-display text-[11vw] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-white lg:text-[7vw]"
          >
            {HEADLINE}
          </h2>
        </div>
      </section>

      <section aria-label="Lab members" className="lab-dark lab-blueprint" style={CLUSTER_VARS}>
        {labPeople.map((person, i) => (
          <MemberPanel key={person.id} person={person} index={i} flow />
        ))}
      </section>

      <Outro />
    </>
  );
}

/* ── Small hooks ─────────────────────────────────────────────────────── */

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
