"use client";

import { useEffect } from "react";
import { useReducedMotionSetting, syncDocumentFlag } from "@/lib/reduced-motion";

/**
 * Lets a visitor override the OS setting in either direction — off for
 * motion sensitivity, on for anyone whose system-wide Reduce Motion would
 * otherwise strip this site's animations with no way to get them back.
 * Lives in the footer, so it also mirrors the stored preference onto
 * `<html>` on every page load.
 */
export function ReduceMotionToggle() {
  const { reduced, setReduced } = useReducedMotionSetting();

  useEffect(() => {
    syncDocumentFlag();
  }, [reduced]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      onClick={() => setReduced(!reduced)}
      className="group flex items-center gap-2.5 rounded-[var(--radius-chip)] font-sans text-sm text-text-secondary transition-colors hover:text-text-primary"
    >
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 shrink-0 rounded-[var(--radius-chip)] border transition-colors ${
          reduced
            ? "border-accent-blue bg-accent-blue"
            : "border-hairline-strong bg-bg-surface-raised group-hover:border-accent-blue-border-hover"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-[left] duration-200 ease-[var(--ease-premium)] ${
            reduced ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
      Reduce motion
    </button>
  );
}
