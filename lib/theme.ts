"use client";

import { useCallback, useSyncExternalStore } from "react";
// Shared with the root layout's pre-paint script, which is why the key lives
// in a module free of React hooks — a server component cannot import this one.
import { THEME_STORAGE_KEY } from "./themeScript";

const CHANGE_EVENT = "ncc-theme-change";
const MEDIA_QUERY = "(prefers-color-scheme: light)";

export type Theme = "dark" | "light";
/** "system" is the default: no explicit choice stored yet. */
export type ThemePreference = Theme | "system";

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : "system";
  } catch {
    return "system";
  }
}

function resolve(): Theme {
  const preference = readPreference();
  if (preference !== "system") return preference;
  return window.matchMedia(MEDIA_QUERY).matches ? "light" : "dark";
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
 * Dark on the server and through hydration — the server cannot know the
 * visitor's OS setting, and rendering the real value during the first client
 * render is exactly the mismatch React reports. `useSyncExternalStore`
 * hydrates against this, then re-renders with the resolved theme. The paint
 * itself is already correct: the inline script in `layout.tsx` stamps
 * `<html data-theme>` before the first frame, and all colour comes from
 * CSS variables keyed on that attribute.
 */
function getServerSnapshot(): Theme {
  return "dark";
}

/** Mirrors the resolved theme onto `<html data-theme>`, which is what every
    colour token in `globals.css` is keyed on. */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, resolve, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — still applies for this page load.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { theme, setTheme };
}
