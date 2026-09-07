import Link from "next/link";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { HeroBackdrop } from "./HeroBackdrop";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { NccMark } from "@/components/brand/NccMark";
import { GlitchText } from "@/components/motion/GlitchText";
import { heroPhoto } from "@/lib/gallery";

export function Hero() {
  return (
    <section className="relative flex min-h-[92dvh] items-end overflow-hidden bg-bg-primary">
      <HeroBackdrop src={heroPhoto.src} alt={heroPhoto.alt} />

      <RevealGroup className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <RevealItem>
          <NccMark height={72} priority />
        </RevealItem>

        <RevealItem>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-tight text-text-primary sm:text-7xl lg:text-[5.5rem]">
            <GlitchText text="Net-Centric" trigger="once" as="span" />
            <br />
            <GlitchText text="Computing Lab" trigger="once" as="span" />
          </h1>
        </RevealItem>

        <RevealItem>
          <p className="mt-6 max-w-[46ch] font-sans text-base leading-relaxed text-text-secondary sm:text-lg">
            Research and student projects in mobile, distributed, and secure
            networked systems — Departemen Teknik Informatika, ITS.
          </p>
        </RevealItem>

        <RevealItem className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/admins"
            className="rounded-[var(--radius-chip)] bg-accent-blue px-6 py-3 font-sans text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-blue-hover"
          >
            Meet the Team
          </Link>
          <Link
            href="/research"
            className="rounded-[var(--radius-chip)] border border-hairline-strong bg-bg-primary/40 px-6 py-3 font-sans text-sm font-semibold text-text-primary backdrop-blur-sm transition-colors duration-200 hover:border-accent-blue-border-hover"
          >
            View Research
          </Link>
          <span className="ml-1 hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary sm:flex">
            <ArrowDown size={13} weight="bold" />
            Scroll
          </span>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
