import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { GlitchText } from "@/components/motion/GlitchText";
import { spotlightPeople } from "@/lib/spotlight";

/**
 * Zigzag people spotlight: one person per row, photo alternating left and
 * right down the page. Rows rest dimmed and brighten on hover/focus while
 * their siblings recede — all of it CSS (`.spotlight-*` in globals.css), so
 * there's no hover state in React and touch devices get full brightness by
 * default via `@media (hover: hover)`.
 */
export function MeetTheLab() {
  if (spotlightPeople.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
          Meet the lab
        </p>
        <h2 className="mt-3 max-w-[20ch] font-display text-3xl font-semibold leading-[1.1] text-text-primary sm:text-5xl">
          The people behind the work
        </h2>
      </Reveal>

      <div className="spotlight-list mt-16 flex flex-col gap-14 sm:gap-20">
        {spotlightPeople.map((person, i) => (
          <Reveal key={person.id}>
            <Link
              href={person.href}
              className="spotlight-row glitch-trigger group grid grid-cols-1 items-center gap-6 sm:grid-cols-2 sm:gap-12"
            >
              <div className={i % 2 === 0 ? "sm:order-1" : "sm:order-2"}>
                <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface">
                  <Image
                    src={person.photo}
                    alt={person.name}
                    fill
                    sizes="(min-width: 640px) 45vw, 90vw"
                    className="spotlight-photo object-cover"
                  />
                </div>
              </div>

              <div className={i % 2 === 0 ? "sm:order-2" : "sm:order-1"}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-blue-text">
                  {person.role}
                </p>

                <h3 className="mt-2 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
                  <GlitchText text={person.name} trigger="hover" />
                </h3>
                <span
                  aria-hidden="true"
                  className="spotlight-underline mt-2 block h-px w-16 bg-accent-blue"
                />

                <p className="mt-4 max-w-[46ch] font-sans text-base leading-relaxed text-text-secondary">
                  {person.blurb}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary transition-colors group-hover:text-accent-blue-text">
                  View profile
                  <ArrowUpRight size={14} weight="bold" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
