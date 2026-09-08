"use client";

import { useEffect } from "react";
import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { applyTheme, useTheme } from "@/lib/theme";

/**
 * Flips between the dark and light palettes and remembers the choice. Until
 * it is pressed the site follows the visitor's OS setting; pressing it is an
 * explicit override in that direction, the same shape as the reduce-motion
 * control in the footer.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  // The pre-paint script stamps `<html data-theme>` once, on load. This keeps
  // it in step afterwards — most visibly when the visitor has never pressed
  // the toggle and flips their OS appearance while the page is open.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] border border-hairline text-text-secondary transition-colors duration-200 hover:border-accent-blue-border-hover hover:text-text-primary ${className}`}
    >
      {theme === "dark" ? (
        <Moon size={17} weight="fill" />
      ) : (
        <Sun size={17} weight="fill" />
      )}
    </button>
  );
}
