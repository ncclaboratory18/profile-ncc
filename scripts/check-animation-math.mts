// Run: npm run check
// Guards two pieces of animation math that have each shipped broken once.
import assert from "node:assert/strict";
import { fadeRange } from "../lib/railFade.ts";
import {
  loopSlideCount,
  swiperLoopMinimum,
  swiperLoopRequirement,
  CAROUSEL_BREAKPOINTS,
} from "../lib/carouselLoop.ts";

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
  const required = swiperLoopRequirement(bp.slidesPerView);
  for (let members = 1; members <= 8; members++) {
    const slides = loopSlideCount(members);
    assert.ok(
      slides >= required,
      `breakpoint ${label} (slidesPerView=${bp.slidesPerView}) needs >= ${required} slides, roster of ${members} yields ${slides}`,
    );
  }
}

console.log("rail fade offsets ok");
console.log("carousel loop thresholds ok");
console.log("shipped carousel breakpoints clear Swiper's loop guard");
