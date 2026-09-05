import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { MemberCard } from "@/components/roster/MemberCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { admins, researchTeam } from "@/lib/data";

const FEATURED = [...admins.slice(0, 4), ...researchTeam.slice(0, 4)];

/**
 * Members grid where each tile rests desaturated and swaps to the full card
 * treatment on hover/focus. The base state is a filter over the same card —
 * no second image asset needed.
 */
export function HoverSwapGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
              The people
            </h2>
            <p className="mt-3 max-w-[52ch] font-sans text-base leading-relaxed text-text-secondary">
              Admins and researchers across the current generation. Hover a card
              to bring it forward.
            </p>
          </div>
          <Link
            href="/admins"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary transition-colors hover:text-accent-blue-text"
          >
            Full roster
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>
      </Reveal>

      <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {FEATURED.map((member) => (
          <RevealItem key={member.id} className="group/swap relative">
            <MemberCard member={member} variant="grid" />
            {/* Calm base state — lifts on hover/focus to reveal the full card. */}
            <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] bg-bg-primary/35 backdrop-grayscale backdrop-brightness-[0.55] transition-opacity duration-200 ease-[var(--ease-premium)] group-hover/swap:opacity-0 group-focus-within/swap:opacity-0" />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
