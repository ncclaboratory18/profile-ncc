"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { NccMark } from "@/components/brand/NccMark";

const SEEN_KEY = "ncc-loader-seen";

/**
 * Branded gate that holds the NC mark for ~1s, then fades to reveal the hero.
 * Repeat visits in the same session get a short flash instead of the full hold;
 * reduced-motion users get no gate at all.
 */
export function LoaderGate() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // First visit gets the full hold; later ones get a brief flash of the mark
    // so the gate never blocks a repeat visitor.
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = instant ? 0 : sessionStorage.getItem(SEEN_KEY) ? 250 : 1000;

    if (!instant) document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setOpen(false);
      document.body.style.overflow = "";
    }, hold);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary"
          exit={{
            opacity: 0,
            transition: { duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
          aria-hidden="true"
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <NccMark height={64} priority />
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-text-tertiary">
              Loading NCC Lab
            </span>
            <span className="mt-1 h-px w-32 overflow-hidden bg-hairline">
              <motion.span
                className="block h-full w-full bg-accent-blue"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0 : 0.9, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
