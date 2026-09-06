import type { CSSProperties, ElementType } from "react";

/**
 * Per-character flicker. Each character snaps between dim and lit on its own
 * offset schedule, then settles solid — the effect is entirely CSS
 * (`.glitch-char` in globals.css), so it degrades to plain text under reduced
 * motion.
 *
 * Timings are derived from the character index rather than `Math.random()`:
 * random values differ between the server render and the client's, which
 * React reports as a hydration mismatch.
 */
function flickerStyle(index: number, trigger: "hover" | "once"): CSSProperties {
  // Coprime multipliers spread neighbouring characters apart instead of
  // marching them in step.
  const delay = (index * 53) % 260;
  const duration = 620 + ((index * 97) % 420);
  return {
    // A short lead-in on the load animation leaves room for hydration.
    "--flicker-delay": `${trigger === "once" ? delay + 220 : delay}ms`,
    "--flicker-duration": `${duration}ms`,
  } as CSSProperties;
}

export function GlitchText({
  text,
  as: Tag = "span",
  trigger = "hover",
  className = "",
}: {
  text: string;
  as?: ElementType;
  trigger?: "hover" | "once";
  className?: string;
}) {
  // Split on words first so a long headline still wraps between words rather
  // than mid-word, then per character inside each word.
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <Tag className={`glitch glitch--${trigger} ${className}`.trim()} aria-label={text}>
      {words.map((word, w) => {
        const chars = [...word];
        const rendered = (
          <span key={`w${w}`} className="inline-block whitespace-nowrap">
            {chars.map((char, c) => {
              const style = flickerStyle(charIndex++, trigger);
              return (
                <span key={`c${c}`} className="glitch-char" style={style} aria-hidden="true">
                  {char}
                </span>
              );
            })}
          </span>
        );

        if (w === words.length - 1) return rendered;
        const spaceStyle = flickerStyle(charIndex++, trigger);
        return (
          <span key={`g${w}`}>
            {rendered}
            <span className="glitch-char" style={spaceStyle} aria-hidden="true">
              {" "}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
