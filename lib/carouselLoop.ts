/**
 * Swiper only actually loops when
 *
 *   slides.length >= slidesPerView + loopedSlides
 *
 * and for a centered slider `loopedSlides ≈ ceil(slidesPerView / 2)` plus
 * whatever `loopAdditionalSlides` is set to (see the guard in
 * `swiper/shared/swiper-core.mjs`). Otherwise it logs a warning and silently
 * disables looping.
 *
 * Coverflow shows several slides at once, so a 3-4 person roster is far under
 * that bar. Repeating the roster is the supported fix — "add more slides (or
 * make duplicates)", per Swiper's own warning text.
 */
export const MIN_LOOP_SLIDES = 15;

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
 */
export function swiperLoopMinimum(slidesPerView: number, loopAdditionalSlides = 0): number {
  return slidesPerView + Math.ceil(slidesPerView / 2) + loopAdditionalSlides;
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

/**
 * Reimplements Swiper's own loop guard from `shared/swiper-core.mjs` for a
 * centered slider with no offsets and `slidesPerGroup: 1`, so the check
 * script tests the real condition:
 *
 *   slides.length < slidesPerView + loopedSlides  ->  loop disabled + warning
 */
export function swiperLoopRequirement(configuredSlidesPerView: number): number {
  let slidesPerView = Math.ceil(configuredSlidesPerView);
  // `bothDirections` is true for a normal horizontal loop.
  if (slidesPerView % 2 === 0) slidesPerView += 1;
  const loopedSlides = Math.max(1, Math.ceil(slidesPerView / 2));
  return slidesPerView + loopedSlides;
}
