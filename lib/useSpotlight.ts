"use client";

import { useRef, type PointerEvent } from "react";

/**
 * Cursor-following spotlight on a card. Mutates CSS custom properties
 * directly via ref instead of React state, so a mousemove never triggers a
 * re-render — spread this onto the element carrying `.card-spotlight`'s
 * enclosing box (needs `position: relative`).
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    ref.current?.style.setProperty("--spot-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    ref.current?.style.setProperty("--spot-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }

  return { spotRef: ref, onPointerMove };
}
