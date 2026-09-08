/**
 * Swiper only actually loops when
 *
 *   slides.length >= slidesPerView + loopedSlides
 *
 * and for a centered slider with `slidesPerGroup: 1`
 *
 *   loopedSlides = max(1, ceil(slidesPerView / 2)) + loopAdditionalSlides
 *
 * (see the guard in `swiper/shared/swiper-core.mjs`). Otherwise it logs a
 * warning and silently disables looping.
 *
 * Coverflow shows several slides at once, so a 3-4 person roster is far under
 * that bar. Repeating the roster is the supported fix — "add more slides (or
 * make duplicates)", per Swiper's own warning text.
 */

/**
 * Extra slides kept live beyond what the loop strictly needs.
 *
 * `loopedSlides` is also the distance from either end at which Swiper moves
 * duplicated slides from one side of the track to the other. At its default
 * (`loopAdditionalSlides: 0`) that boundary sits ~2 slides from the edge —
 * but the carousel renders with `overflow: visible` so the coverflow
 * neighbours can be seen, which means the visitor watches those slides get
 * repositioned as they drag toward either end: cards appearing late, in view.
 * Pushing the boundary out past what is on screen is what fixes it, at the
 * cost of a few more mounted slides.
 */
export const LOOP_ADDITIONAL_SLIDES = 4;

/**
 * Slides to render per generation. Chosen to clear the loop threshold at every
 * plausible `slidesPerView`, including the extra buffer above.
 */
export const MIN_LOOP_SLIDES = 18;

/** How many times to repeat a roster of `memberCount` to clear the threshold. */
export function loopCopies(memberCount: number): number {
  if (memberCount <= 0) return 0;
  return Math.max(1, Math.ceil(MIN_LOOP_SLIDES / memberCount));
}

/** Total slides rendered for a roster of `memberCount`. */
export function loopSlideCount(memberCount: number): number {
  return loopCopies(memberCount) * memberCount;
}

/**
 * Swiper's own threshold, so the check script can assert against the real
 * condition rather than a restated approximation of it.
 *
 * Mirrors `swiper-core.mjs` for this carousel's configuration: centered,
 * `slidesPerGroup: 1`, no slide offsets. `slidesPerGroup` is 1, so the
 * `max(slidesPerGroup, …)` and the round-up-to-a-multiple step in the source
 * both collapse away for any `slidesPerView >= 1`.
 */
export function swiperLoopMinimum(
  slidesPerView: number,
  loopAdditionalSlides = LOOP_ADDITIONAL_SLIDES,
): number {
  const loopedSlides = Math.max(1, Math.ceil(slidesPerView / 2)) + loopAdditionalSlides;
  return slidesPerView + loopedSlides;
}

/**
 * The carousel's configured breakpoints, shared with the component so the
 * check script asserts against the values actually shipped rather than a
 * restatement of them.
 */
export const CAROUSEL_BREAKPOINTS = {
  base: { slidesPerView: 1.15, spaceBetween: 32 },
  640: { slidesPerView: 1.75, spaceBetween: 56 },
  1024: { slidesPerView: 2.5, spaceBetween: 72 },
} as const;
