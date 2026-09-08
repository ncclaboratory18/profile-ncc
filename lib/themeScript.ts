/**
 * The theme's storage key and the pre-paint script that reads it, kept in a
 * module of their own so both sides can import them.
 *
 * `lib/theme.ts` has to be a `"use client"` module (it runs React hooks), and
 * a server component may not import one at all — Next fails the build on it.
 * The root layout is a server component and needs the real key to build the
 * script, so the two plain constants live here instead of being written out a
 * second time and left to drift.
 */
export const THEME_STORAGE_KEY = "ncc-theme";

/**
 * Resolves the theme and stamps `<html data-theme>` before the first paint,
 * so the page never flashes the dark palette at a light-theme visitor (or the
 * reverse). It has to be a blocking inline script: anything React renders runs
 * after hydration, which is already a frame too late.
 */
export const THEME_SCRIPT = `try{var p=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.dataset.theme=(p==="dark"||p==="light")?p:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark")}catch(e){document.documentElement.dataset.theme="dark"}`;
