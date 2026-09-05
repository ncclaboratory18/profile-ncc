/** Half-width of a caption's fade window, in scroll progress. */
export const FADE_WINDOW = 0.15;

/**
 * Scroll-progress range over which frame `index` of `count` holds its caption
 * at full opacity.
 *
 * Motion hands a scroll-linked `useTransform` input range to WAAPI as keyframe
 * offsets, and those must stay inside [0, 1] and keep rising — so the centres
 * ride an inset band instead of the raw 0 -> 1 extremes.
 */
export function fadeRange(index: number, count: number): [number, number, number] {
  const t = count > 1 ? index / (count - 1) : 0.5;
  const centre = FADE_WINDOW + t * (1 - 2 * FADE_WINDOW);
  return [centre - FADE_WINDOW, centre, centre + FADE_WINDOW];
}
