/**
 * Geometry for the Research Team's 3D card ring.
 *
 * The cards sit on the face of a cylinder: each one is rotated by its own
 * angle and then pushed out along its local +Z by the radius, so the row
 * curves away from the viewer on both sides and the centre card is physically
 * closer to the camera. Rotating the whole stage brings the next card round.
 *
 * This is deliberately *not* Swiper's `effect-coverflow` (the Admins page):
 * that is a flat row with the neighbours tilted, and everything stays at the
 * same depth. Here depth is the effect.
 *
 * A full circle, so the ring loops forever in both directions with no ends to
 * hit. A small roster cannot fill 360° on its own — five cards would sit 72°
 * apart, leaving the front face nearly empty — so the roster is repeated
 * around the ring, the same fix `carouselLoop.ts` applies to Swiper. The
 * constraint that makes it invisible is `visibleSlots(step) <= count`: at most
 * `count` slots ever face the viewer at once, so two copies of one person can
 * never be on screen together.
 */

/** `perspective` on the ring's container, px. */
export const RING_PERSPECTIVE = 1800;
/** Clearance between adjacent cards along the arc, px. */
export const RING_GAP = 32;
/** Below this the ring is dense enough; more copies only add hidden cards. */
export const RING_MIN_STEP = 24;
/** Sanity bound on the repetition, mirroring `carouselLoop.ts`'s own cap. */
export const RING_MAX_COPIES = 12;
/**
 * Ceiling on the radius as a fraction of the perspective distance. At
 * `radius === perspective` a card sits exactly at the camera; well before
 * that the front card is magnified past the height its container reserves.
 * `0.3` caps the magnification at `1/(1 - 0.3)` ≈ 1.43x.
 *
 * A large roster of wide cards asks for a radius past this and gets clamped,
 * which lets neighbours overlap slightly along the arc. That is the right
 * trade: overlapping cards on a curve still read as a stack receding into
 * depth, whereas a front card scaled 1.8x is simply clipped.
 */
export const RING_MAX_RADIUS_RATIO = 0.3;

/**
 * How many slots face the viewer at a given angular step.
 *
 * `backface-visibility: hidden` cuts every card rotated past ±90°, so a slot
 * is visible only while its angle is strictly inside that — a card at exactly
 * 90° is edge-on and shows nothing either way.
 */
export function visibleSlots(step: number): number {
  if (step <= 0) return 1;
  return 2 * (Math.ceil(90 / step) - 1) + 1;
}

/**
 * Total slots around the full circle for a roster of `count` — always a whole
 * number of copies of the roster, so slot `s` shows `members[s % count]` and
 * the ring closes seamlessly.
 *
 * Picks the densest repetition that still keeps every visible slot a distinct
 * person. Both loop conditions fail monotonically as copies rise (the step
 * only shrinks), so the first failure ends the search.
 */
export function ringSlots(count: number): number {
  if (count <= 1) return count;

  let slots = count;
  for (let copies = 1; copies <= RING_MAX_COPIES; copies++) {
    const candidate = copies * count;
    const step = 360 / candidate;
    if (step < RING_MIN_STEP) break;
    if (visibleSlots(step) > count) break;
    slots = candidate;
  }
  return slots;
}

/** Angle between adjacent slots, degrees. */
export function ringStep(count: number): number {
  const slots = ringSlots(count);
  return slots > 1 ? 360 / slots : 0;
}

/**
 * Radius that spaces the slots by `gap` around the ring.
 *
 * The straight-line distance between two adjacent card centres is the chord
 * `2·R·sin(step/2)`; setting that to `cardWidth + gap` and solving for R is
 * what keeps neighbours from overlapping at any roster size.
 */
export function ringRadius(cardWidth: number, count: number, gap = RING_GAP): number {
  const step = ringStep(count);
  // A single card has no ring to sit on — it just faces the viewer flat.
  if (step === 0) return 0;
  const halfStep = (step * Math.PI) / 360;
  const radius = (cardWidth + gap) / (2 * Math.sin(halfStep));
  return Math.min(radius, RING_PERSPECTIVE * RING_MAX_RADIUS_RATIO);
}

/**
 * How much the perspective projection magnifies the front card, which is
 * `radius` closer to the camera than the stage's plane.
 */
export function ringFrontScale(radius: number, perspective = RING_PERSPECTIVE): number {
  return perspective / (perspective - radius);
}

/**
 * Shortest signed number of slots from `from` to `to` around the ring — the
 * direction that travels less than half the circle, so clicking a card to the
 * left never spins the long way round to reach it.
 */
export function shortestSlotDelta(from: number, to: number, slots: number): number {
  if (slots <= 0) return 0;
  const forward = (((to - from) % slots) + slots) % slots;
  return forward > slots / 2 ? forward - slots : forward;
}
