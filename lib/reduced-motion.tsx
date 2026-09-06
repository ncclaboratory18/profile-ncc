"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "ncc-motion";
const CHANGE_EVENT = "ncc-motion-change";
const MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Three states, not two. "system" follows the OS; the other two are explicit
 * overrides in either direction.
 *
 * The direction that matters most is `allow`: a visitor whose OS has Reduce
 * Motion switched on globally may still want this site's motion, and without
 * an opt-in they are stuck with every animation suppressed and no way back.
 */
export type MotionPreference = "system" | "reduce" | "allow";

function readPreference(): MotionPreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "reduce" || stored === "allow" ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MEDIA_QUERY);
  mq.addEventListener("change", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Always false on the server and during hydration. The server cannot know the
 * visitor's OS setting, so reading it during the first client render makes the
 * markup disagree with the server's and React reports a hydration mismatch.
 * `useSyncExternalStore` hydrates against this, then re-renders with the real
 * value immediately afterwards.
 */
function getServerSnapshot() {
  return false;
}

function resolve(): boolean {
  const preference = readPreference();
  if (preference === "reduce") return true;
  if (preference === "allow") return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}

/**
 * Whether motion should be suppressed right now. Drop-in replacement for
 * Framer Motion's `useReducedMotion`, but honours the site's own override.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, resolve, getServerSnapshot);
}

/** For the footer control: the resolved state plus a way to set it explicitly. */
export function useReducedMotionSetting() {
  const reduced = useSyncExternalStore(subscribe, resolve, getServerSnapshot);

  const setReduced = useCallback((value: boolean) => {
    const preference: MotionPreference = value ? "reduce" : "allow";
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Private browsing / storage disabled — still applies for this page load.
    }
    syncDocumentFlag(preference);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { reduced, setReduced };
}

/**
 * Mirrors the explicit preference onto `<html data-motion>` so plain-CSS
 * animations (no React in the loop) follow it too — including opting back
 * *in* to motion when the OS media query would otherwise suppress them.
 */
export function syncDocumentFlag(preference: MotionPreference = readPreference()) {
  const root = document.documentElement;
  if (preference === "system") delete root.dataset.motion;
  else root.dataset.motion = preference;
}
