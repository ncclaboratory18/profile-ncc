// Run: npm run check
// Guards two pieces of animation math that have each shipped broken once.
import assert from "node:assert/strict";
import { fadeRange } from "../lib/railFade.ts";
import {
  loopSlideCount,
  swiperLoopMinimum,
  CAROUSEL_BREAKPOINTS,
} from "../lib/carouselLoop.ts";
import {
  ASSEMBLE_REACH,
  EASINGS,
  LAB_CONFIG,
  assembleOffset,
  clusterPx,
  labPeople,
  layoutAreas,
  layoutFor,
  membersPath,
} from "../lib/labPeople.ts";
import { memberAt, scalePoints, toPx } from "../lib/labPath.ts";
import {
  ringFrontScale,
  ringRadius,
  ringSlots,
  ringStep,
  shortestSlotDelta,
  visibleSlots,
  RING_GAP,
  RING_MAX_RADIUS_RATIO,
  RING_PERSPECTIVE,
} from "../lib/ring.ts";

// 1. Photo rail: Motion hands a scroll-linked input range to WAAPI as keyframe
//    offsets, which must sit in [0,1] and strictly increase.
for (const count of [1, 2, 6, 20]) {
  for (let i = 0; i < count; i++) {
    const range = fadeRange(i, count);
    assert.ok(
      range.every((n) => n >= 0 && n <= 1),
      `count=${count} index=${i}: offsets outside [0,1] — ${range}`,
    );
    assert.ok(
      range[0] < range[1] && range[1] < range[2],
      `count=${count} index=${i}: offsets not increasing — ${range}`,
    );
  }
}

// 2. Generation carousel: the repeated roster must clear Swiper's loop
//    threshold at every realistic viewport width, or looping silently turns
//    itself off. slidesPerView tops out around 7 for 320px slides + 72px gaps
//    on an ultrawide screen.
for (let members = 1; members <= 8; members++) {
  const slides = loopSlideCount(members);
  for (let slidesPerView = 1; slidesPerView <= 7; slidesPerView++) {
    const minimum = swiperLoopMinimum(slidesPerView);
    assert.ok(
      slides >= minimum,
      `members=${members} (${slides} slides): below Swiper's loop minimum of ${minimum} at slidesPerView=${slidesPerView}`,
    );
  }
}

// 3. The shipped breakpoints specifically: Swiper reads a *numeric*
//    slidesPerView, so its loop guard is fully determined here — no layout
//    measurement involved, which is what made the "auto" version flaky.
for (const [label, bp] of Object.entries(CAROUSEL_BREAKPOINTS)) {
  const required = swiperLoopMinimum(bp.slidesPerView);
  for (let members = 1; members <= 8; members++) {
    const slides = loopSlideCount(members);
    assert.ok(
      slides >= required,
      `breakpoint ${label} (slidesPerView=${bp.slidesPerView}) needs >= ${required} slides, roster of ${members} yields ${slides}`,
    );
  }
}

// 4. Research Team ring: it loops forever, so the roster is repeated around a
//    full circle — and the whole illusion rests on never showing two copies of
//    one person at once. The radius is derived from a measured card width, so
//    it also has to stay sane at every roster size and breakpoint width the
//    page can hand it, including the degenerate one- and two-card rosters.
for (let count = 1; count <= 20; count++) {
  const slots = ringSlots(count);
  const step = ringStep(count);

  assert.ok(
    slots >= count && slots % count === 0,
    `count=${count}: ${slots} slots is not a whole number of copies of the roster`,
  );
  assert.ok(
    visibleSlots(step) <= count,
    `count=${count}: ${visibleSlots(step)} slots visible at ${step}° — a duplicate would be on screen`,
  );

  // Every rotation must be reachable the short way round, in both directions.
  for (let from = 0; from < slots; from++) {
    for (let to = 0; to < slots; to++) {
      const delta = shortestSlotDelta(from, to, slots);
      assert.ok(
        Math.abs(delta) <= slots / 2,
        `count=${count}: ${from} -> ${to} travels ${delta} of ${slots} slots`,
      );
      assert.equal(
        ((from + delta) % slots + slots) % slots,
        to,
        `count=${count}: ${from} + ${delta} does not land on ${to}`,
      );
    }
  }

  for (const width of [200, 240, 272, 320, 420]) {
    const radius = ringRadius(width, count, RING_GAP);
    assert.ok(
      Number.isFinite(radius) && radius >= 0,
      `count=${count} width=${width}: radius is ${radius}`,
    );
    assert.ok(
      radius <= RING_PERSPECTIVE * RING_MAX_RADIUS_RATIO,
      `count=${count} width=${width}: radius ${radius} is too close to the camera`,
    );

    const scale = ringFrontScale(radius);
    assert.ok(
      scale >= 1 && scale <= 1.45,
      `count=${count} width=${width}: front card magnified ${scale}x`,
    );

    // Neighbours must not overlap: the chord between adjacent card centres is
    // what the radius was solved for. Skipped where the radius hit its cap
    // (nothing in the shipped range does) and for a lone card, which has no
    // neighbour.
    if (count > 1 && radius < RING_PERSPECTIVE * RING_MAX_RADIUS_RATIO) {
      const chord = 2 * radius * Math.sin((step * Math.PI) / 360);
      assert.ok(
        chord + 1e-9 >= width + RING_GAP,
        `count=${count} width=${width}: cards ${chord}px apart, need ${width + RING_GAP}px`,
      );
    }
  }
}

// 5. Meet the Lab: a camera travelling a smooth curve through a 2D canvas,
//    past one compact cluster per member. The curve has to pass through its
//    (scaled) waypoints with no sharp corners, keep changing direction, give
//    every member the same length of path, and keep every two clusters at
//    least `clusterGap` of empty canvas apart — with the gap knob, not luck,
//    deciding the spacing.
assert.ok(LAB_CONFIG.cluster.w <= 90 && LAB_CONFIG.cluster.h <= 80, "a cluster no longer fits one screen");
assert.ok(LAB_CONFIG.mobileCluster.maxH <= 80, "phone clusters may not fit one screen");
for (const [label, waypoints, w, h, desktop] of [
  ["desktop 1440", LAB_CONFIG.waypoints, 1440, 900, true],
  ["desktop 1280", LAB_CONFIG.waypoints, 1280, 720, true],
  ["desktop 1920", LAB_CONFIG.waypoints, 1920, 1080, true],
  ["mobile", LAB_CONFIG.mobileWaypoints, 390, 844, false],
] as const) {
  const { path, anchors, scale } = membersPath(desktop, w, h);
  const pts = scalePoints(toPx(waypoints, w, h), scale);
  const n = labPeople.length;
  const L = path.length;
  const seg = L / n;
  const close = (a: { x: number; y: number }, b: { x: number; y: number }, tol: number) =>
    Math.hypot(a.x - b.x, a.y - b.y) <= tol;

  assert.ok(scale >= 1, `${label}: path shrunk below its waypoints`);

  // Starts and ends exactly on the first and last waypoint.
  assert.ok(close(path.pointAt(0), pts[0], 1e-6), `${label}: does not start on the first waypoint`);
  assert.ok(close(path.pointAt(L), pts[pts.length - 1], 1e-6), `${label}: does not end on the last`);

  // Passes through every waypoint (within a sampling step).
  for (const [i, p] of pts.entries()) {
    let best = Infinity;
    for (let l = 0; l <= L; l += 2) {
      const q = path.pointAt(l);
      best = Math.min(best, Math.hypot(q.x - p.x, q.y - p.y));
    }
    assert.ok(best < 4, `${label}: misses waypoint ${i} by ${best.toFixed(1)}px`);
  }

  // Smooth: no corner sharper than a few degrees between 4px steps, and the
  // camera never stops (the arc-length table is strictly increasing).
  let prevAng: number | null = null;
  let maxTurn = 0;
  let signChanges = 0;
  let lastSign = 0;
  for (let l = 4; l <= L; l += 4) {
    const p = path.pointAt(l - 4);
    const q = path.pointAt(l);
    const step = Math.hypot(q.x - p.x, q.y - p.y);
    assert.ok(step > 3.5, `${label}: camera stalls at ${l.toFixed(0)}px (moved ${step.toFixed(2)}px in 4)`);
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    if (prevAng !== null) {
      let d = Math.abs(ang - prevAng);
      if (d > Math.PI) d = 2 * Math.PI - d;
      maxTurn = Math.max(maxTurn, (d * 180) / Math.PI);
    }
    prevAng = ang;
    const dy = q.y - p.y;
    const sign = Math.abs(dy) < 0.05 ? 0 : Math.sign(dy);
    if (sign && sign !== lastSign) {
      if (lastSign) signChanges++;
      lastSign = sign;
    }
  }
  assert.ok(maxTurn < 8, `${label}: a corner turns ${maxTurn.toFixed(1)}° in 4px`);

  if (desktop) {
    // Never one direction for long: the vertical heading flips back and
    // forth, and no stretch one member long is flat (horizontal only).
    assert.ok(signChanges >= Math.floor(n / 2), `${label}: only ${signChanges} up/down changes`);
    for (let l = 0; l + seg <= L; l += seg / 8) {
      let lo = Infinity;
      let hi = -Infinity;
      for (let k = 0; k <= 32; k++) {
        const y = path.pointAt(l + (seg * k) / 32).y;
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
      assert.ok(
        hi - lo > 0.1 * h,
        `${label}: flat for a whole member from ${l.toFixed(0)}px (${(((hi - lo) / h) * 100).toFixed(1)}vh of rise)`,
      );
    }
  }

  // Equal treatment: anchors are a constant distance apart along the path.
  for (let i = 0; i < n; i++) {
    assert.ok(close(anchors[i], path.pointAt((i + 0.5) * seg), 1e-6), `${label}: anchor ${i} misplaced`);
  }

  // Clusters apart: for every two members, the empty canvas between their
  // clusters — after the worst parallax drift while both are on screen — is
  // at least `clusterGap` on one axis. And the closest pair sits right at
  // the gap, so the knob is what sets the spacing.
  const box = clusterPx(desktop, w, h);
  const keep = 1 - 2 * LAB_CONFIG.parallax;
  let tightest = Infinity;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const gx = ((Math.abs(anchors[j].x - anchors[i].x) * keep - box.w) / w) * 100;
      const gy = ((Math.abs(anchors[j].y - anchors[i].y) * keep - box.h) / h) * 100;
      const slack = Math.max(gx - LAB_CONFIG.clusterGap.x, gy - LAB_CONFIG.clusterGap.y);
      assert.ok(slack >= -0.01, `${label}: members ${i + 1} and ${j + 1} only ${gx.toFixed(1)}vw / ${gy.toFixed(1)}vh apart`);
      tightest = Math.min(tightest, slack);
    }
  }
  assert.ok(tightest < 1, `${label}: closest clusters ${tightest.toFixed(1)} past the gap; the knob is not in charge`);

  // The counter: 0..n-1, monotone along the path, and exactly i at anchor i.
  let prev = -1;
  for (let l = 0; l <= L; l += L / 400) {
    const c = memberAt(l, L, n);
    assert.ok(c >= 0 && c <= n - 1, `${label}: counter at ${c}`);
    assert.ok(c >= prev, `${label}: counter runs backwards`);
    prev = c;
  }
  for (let i = 0; i < n; i++) {
    assert.ok(Math.abs(memberAt((i + 0.5) * seg, L, n) - i) < 1e-9, `${label}: counter off at member ${i}`);
  }
}

// Cluster layouts: every arrangement places all five parts exactly once, each
// as a rectangle of whole cells in a grid of the declared size; mirrored
// rounds are true mirror images; and neighbours never share an arrangement.
const PARTS = ["photo", "accent", "text", "detail", "card"] as const;
for (let i = 0; i < labPeople.length; i++) {
  const { columns, rows, areas } = layoutAreas(i);
  assert.equal(areas.length, rows.length, `member ${i + 1}: rows and areas disagree`);
  for (const row of areas) assert.equal(row.length, columns.length, `member ${i + 1}: a ragged row`);
  for (const part of PARTS) {
    const cells = areas.flatMap((row, r) => row.flatMap((p, c) => (p === part ? [[r, c]] : [])));
    assert.ok(cells.length, `member ${i + 1}: no ${part}`);
    const r0 = Math.min(...cells.map(([r]) => r));
    const r1 = Math.max(...cells.map(([r]) => r));
    const c0 = Math.min(...cells.map(([, c]) => c));
    const c1 = Math.max(...cells.map(([, c]) => c));
    assert.equal(cells.length, (r1 - r0 + 1) * (c1 - c0 + 1), `member ${i + 1}: ${part} is not a rectangle`);
  }
  if (i > 0) assert.notDeepEqual(layoutAreas(i).areas, layoutAreas(i - 1).areas, `members ${i} and ${i + 1} look alike`);
}
const n0 = LAB_CONFIG.layouts.length;
assert.deepEqual(layoutAreas(n0).areas, LAB_CONFIG.layouts[0].areas.map((row) => [...row].reverse()));
assert.deepEqual(layoutAreas(n0).columns, [...LAB_CONFIG.layouts[0].columns].reverse());
assert.match(layoutFor(0).areas, /^"[a-z ]+"( "[a-z ]+")*$/);

// Assemble / disassemble: the parts come together exactly on the anchor,
// spread the same either side of it, never jump back while moving away, and
// are fully apart by the halfway point to the next member — by a small,
// bounded amount, in a fixed stagger.
for (const [name, ease] of Object.entries(EASINGS)) {
  assert.ok(Math.abs(ease(0)) < 1e-12 && Math.abs(ease(1) - 1) < 1e-12, `easing ${name}: not 0→0, 1→1`);
  for (let t = 0.01; t <= 1; t += 0.01) assert.ok(ease(t) >= ease(t - 0.01) - 1e-12, `easing ${name}: runs backwards`);
}
const A = LAB_CONFIG.assemble;
assert.ok(A.easing in EASINGS, `assemble: unknown easing ${A.easing}`);
assert.ok(A.maxOffset >= 60 && A.maxOffset <= 100, "assemble: desktop spread outside 60–100px");
assert.ok(A.mobileMaxOffset >= 30 && A.mobileMaxOffset <= 40, "assemble: phone spread outside 30–40px");
assert.ok(ASSEMBLE_REACH <= 0.5, "assemble: a member is still coming together past the halfway point");
assert.deepEqual(Object.keys(A.stagger).sort(), ["accent", "card", "detail", "label", "photo"]);
for (const [kind, { amount, timing }] of Object.entries(A.stagger) as [keyof typeof A.stagger, { amount: number; timing: number }][]) {
  assert.ok(amount >= 0.8 && amount <= 1.2, `assemble: ${kind} amount ${amount} outside 0.8–1.2`);
  assert.ok(timing > 0, `assemble: ${kind} timing must be positive`);
  for (const desktop of [true, false]) {
    const max = (desktop ? A.maxOffset : A.mobileMaxOffset) * amount;
    assert.equal(assembleOffset(0, kind, desktop), 0, `assemble: ${kind} not together on the anchor`);
    assert.ok(Math.abs(assembleOffset(0.5, kind, desktop) - max) < 1e-9, `assemble: ${kind} not fully apart by halfway`);
    let prev = 0;
    for (let d = 0; d <= 1; d += 0.01) {
      const o = assembleOffset(d, kind, desktop);
      assert.ok(Math.abs(o - assembleOffset(-d, kind, desktop)) < 1e-9, `assemble: ${kind} lopsided`);
      assert.ok(o >= prev - 1e-9 && o <= max + 1e-9, `assemble: ${kind} jumps at d=${d.toFixed(2)}`);
      prev = o;
    }
  }
}

console.log("rail fade offsets ok");
console.log("carousel loop thresholds ok");
console.log("shipped carousel breakpoints clear Swiper's loop guard");
console.log("research ring geometry ok");
console.log("people path: smooth, through every waypoint, changing direction, members equal, clusters a full gap apart");
console.log("people clusters: every part placed once, as a rectangle, mirrored, neighbours unalike");
console.log("people assemble: together on the anchor, apart by halfway, bounded and staggered");
