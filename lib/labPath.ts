/**
 * The camera path for the home page's people sequence
 * (`components/home/MeetTheLab.tsx`): a smooth curve through a list of
 * waypoints, measured by arc length so the camera can travel it at constant
 * speed. Pure functions only, so `npm run check` can assert the shape.
 */

export type Point = { x: number; y: number };

export interface Path {
  /** Total arc length, in px. */
  length: number;
  /** The point at arc length `len` (clamped to the path). */
  pointAt: (len: number) => Point;
}

/** Waypoints in viewport units (`[vw, vh]`) to px for a `w` x `h` viewport. */
export function toPx(waypoints: readonly (readonly [number, number])[], w: number, h: number): Point[] {
  return waypoints.map(([x, y]) => ({ x: (x / 100) * w, y: (y / 100) * h }));
}

const ALPHA = 0.5; // centripetal: no cusps, no self-intersections within a segment
const SAMPLES_PER_SEGMENT = 64;

/** Centripetal Catmull-Rom between p1 and p2, at u in [0, 1]. */
function catmullRom(p0: Point, p1: Point, p2: Point, p3: Point, u: number): Point {
  const knot = (a: Point, b: Point) => Math.max(Math.pow(Math.hypot(b.x - a.x, b.y - a.y), ALPHA), 1e-6);
  const t0 = 0;
  const t1 = t0 + knot(p0, p1);
  const t2 = t1 + knot(p1, p2);
  const t3 = t2 + knot(p2, p3);
  const t = t1 + (t2 - t1) * u;

  const mix = (a: Point, b: Point, ta: number, tb: number): Point => {
    const k = (t - ta) / (tb - ta);
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
  };
  const a1 = mix(p0, p1, t0, t1);
  const a2 = mix(p1, p2, t1, t2);
  const a3 = mix(p2, p3, t2, t3);
  const b1 = mix(a1, a2, t0, t2);
  const b2 = mix(a2, a3, t1, t3);
  return mix(b1, b2, t1, t2);
}

/**
 * A smooth curve through every point, sampled into an arc-length table.
 * The ends are extended by reflection so the curve starts and finishes
 * exactly on the first and last waypoint, heading the way they point.
 */
export function buildPath(points: Point[]): Path {
  if (points.length < 2) {
    const p = points[0] ?? { x: 0, y: 0 };
    return { length: 0, pointAt: () => p };
  }

  const first = points[0];
  const last = points[points.length - 1];
  const ext = [
    { x: 2 * first.x - points[1].x, y: 2 * first.y - points[1].y },
    ...points,
    {
      x: 2 * last.x - points[points.length - 2].x,
      y: 2 * last.y - points[points.length - 2].y,
    },
  ];

  const xs: number[] = [];
  const ys: number[] = [];
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < ext.length - 2; i++) {
    for (let k = 0; k < SAMPLES_PER_SEGMENT; k++) {
      const p = catmullRom(ext[i - 1], ext[i], ext[i + 1], ext[i + 2], k / SAMPLES_PER_SEGMENT);
      if (xs.length) total += Math.hypot(p.x - xs[xs.length - 1], p.y - ys[ys.length - 1]);
      xs.push(p.x);
      ys.push(p.y);
      lens.push(total);
    }
  }
  total += Math.hypot(last.x - xs[xs.length - 1], last.y - ys[ys.length - 1]);
  xs.push(last.x);
  ys.push(last.y);
  lens.push(total);

  const pointAt = (len: number): Point => {
    if (len <= 0) return { x: xs[0], y: ys[0] };
    if (len >= total) return { x: xs[xs.length - 1], y: ys[ys.length - 1] };
    let lo = 0;
    let hi = lens.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lens[mid] <= len) lo = mid;
      else hi = mid;
    }
    const span = lens[hi] - lens[lo] || 1;
    const k = (len - lens[lo]) / span;
    return { x: xs[lo] + (xs[hi] - xs[lo]) * k, y: ys[lo] + (ys[hi] - ys[lo]) * k };
  };

  return { length: total, pointAt };
}

/**
 * Where each of `n` members sits: equally spaced by arc length, at the
 * middle of their share of the path. Every member therefore gets exactly the
 * same length of path, and the same scroll, whatever shape the waypoints draw.
 */
export function anchorsFor(path: Path, n: number): Point[] {
  const step = path.length / n;
  return Array.from({ length: n }, (_, i) => path.pointAt((i + 0.5) * step));
}

/** Which member the camera is nearest along the path, as a continuous 0..n-1. */
export function memberAt(len: number, length: number, n: number): number {
  if (n <= 1 || length <= 0) return 0;
  const c = len / (length / n) - 0.5;
  return c < 0 ? 0 : c > n - 1 ? n - 1 : c;
}

/** Every point scaled by `s` about the origin. */
export function scalePoints(points: Point[], s: number): Point[] {
  return points.map((p) => ({ x: p.x * s, y: p.y * s }));
}

/**
 * How much to scale the waypoints so that `n` clusters of `cluster` px,
 * centred on their anchors, keep at least `gap` px of empty canvas between
 * any two of them — on one axis or the other, whichever the path separates
 * them along.
 *
 * A centripetal Catmull-Rom scaled about the origin is the same curve
 * scaled, so the anchors scale with it and one build at scale 1 is enough.
 * Whole-cluster parallax at depth `1 ± parallax` can close two clusters by up
 * to `2 · parallax` of their separation while both are on screen, so that is
 * taken off first.
 */
export function fitScale(
  points: Point[],
  n: number,
  cluster: { w: number; h: number },
  gap: { x: number; y: number },
  parallax: number,
): number {
  const anchors = anchorsFor(buildPath(points), n);
  const keep = 1 - 2 * Math.abs(parallax);
  let s = 1;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = Math.abs(anchors[j].x - anchors[i].x) * keep;
      const dy = Math.abs(anchors[j].y - anchors[i].y) * keep;
      const need = Math.min(
        dx > 0 ? (cluster.w + gap.x) / dx : Infinity,
        dy > 0 ? (cluster.h + gap.y) / dy : Infinity,
      );
      if (need > s) s = need;
    }
  }
  return s;
}
