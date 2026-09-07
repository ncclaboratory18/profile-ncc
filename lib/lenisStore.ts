import type Lenis from "lenis";

/**
 * Module-level handle to the single Lenis instance `SmoothScroll` creates.
 * Lets other components (the loader gate, route-change scroll reset) drive
 * the same instance without threading it through React context.
 */
let instance: Lenis | null = null;

export function setLenisInstance(next: Lenis | null) {
  instance = next;
}

export function getLenisInstance(): Lenis | null {
  return instance;
}
