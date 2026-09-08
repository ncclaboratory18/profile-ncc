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
  FULL_CHAPTERS,
  TITLE_END,
  TOTAL_SCREENS,
  arrivalAt,
  counterAt,
  labPeople,
  phases,
  railAt,
  slots,
} from "../lib/labPeople.ts";
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

// 4. Meet the Lab: the pinned people sequence. Two things have to hold or the
//    section stops working as written — people must never leave a hole on
//    screen between them, and no two neighbours may move the same way.
for (let i = 0; i < slots.length; i++) {
  const slot = slots[i];
  assert.ok(slot.end > slot.start, `person ${i}: empty slot`);
  if (i > 0) {
    const prev = slots[i - 1];
    assert.ok(
      slot.start > prev.start,
      `person ${i}: starts before the person before them`,
    );
    // Overlapping handoff: the outgoing person is still leaving as this one
    // starts to arrive, so there is never an empty screen between two people.
    assert.ok(
      slot.start < prev.end,
      `person ${i}: gap of ${slot.start - prev.end} screens before them`,
    );
  }
}

// The change of pace is the whole reason the section is in two movements: a
// rapid pass must advance about a third of what a full chapter does.
const chapterStep = slots[1].start - slots[0].start;
const passStep = slots[FULL_CHAPTERS + 1].start - slots[FULL_CHAPTERS].start;
const ratio = passStep / chapterStep;
assert.ok(
  ratio > 0.28 && ratio < 0.4,
  `rapid passes advance ${ratio} of a chapter, wanted about a third`,
);

// Directions: never twice in a row, and never out the way you came in.
labPeople.forEach((person, i) => {
  assert.notEqual(
    person.enter as string,
    person.exit as string,
    `${person.id}: leaves the way they arrived`,
  );
  if (i === 0) return;
  const before = labPeople[i - 1];
  assert.notEqual(person.enter, before.enter, `${person.id}: enters like the one before`);
  assert.notEqual(person.exit, before.exit, `${person.id}: exits like the one before`);
});

// Phases stay in range across the whole scroll, in both directions, and the
// last person never leaves.
for (let step = 0; step <= 400; step++) {
  const s = (step / 400) * TOTAL_SCREENS;
  for (let i = 0; i < labPeople.length; i++) {
    const { enter, exit } = phases(s, i);
    assert.ok(enter >= 0 && enter <= 1, `s=${s} person ${i}: enter ${enter}`);
    assert.ok(exit >= 0 && exit <= 1, `s=${s} person ${i}: exit ${exit}`);
  }
  assert.equal(phases(s, labPeople.length - 1).exit, 0, `s=${s}: the last person left`);

  // The counter only ever rolls forward, and only as far as there are people.
  const n = counterAt(s);
  assert.ok(n >= 0 && n <= labPeople.length, `s=${s}: counter at ${n}`);
}

// The headline finishes travelling exactly as the first person arrives, and
// the rail spans the people rather than the whole pin.
assert.equal(TITLE_END, arrivalAt(0));
assert.equal(railAt(0), 0);
assert.equal(railAt(labPeople.length - 1), 1);

console.log("rail fade offsets ok");
console.log("carousel loop thresholds ok");
console.log("shipped carousel breakpoints clear Swiper's loop guard");
console.log("research ring geometry ok");
console.log("people sequence: no gaps, no repeated directions, phases in range");
