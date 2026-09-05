// Run: npm run check
// Guards the WAAPI keyframe-offset contract that once crashed the photo rail.
import assert from "node:assert/strict";
import { fadeRange } from "../lib/railFade.ts";

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

console.log("rail fade offsets ok");
