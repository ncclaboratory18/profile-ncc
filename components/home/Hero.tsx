import Link from "next/link";
import { HeroParticles } from "./HeroParticles";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function Hero() {
  return (
    <section className="relative flex min-h-[78dvh] items-end overflow-hidden bg-bg-primary pt-24">
      <HeroParticles />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 30% 70%, black, transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />

      <RevealGroup className="relative mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <RevealItem className="flex max-w-2xl items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-accent-blue text-[10px] font-bold text-white">
            NC
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-text-secondary">
            NCC Lab · Informatics Engineering, ITS
          </span>
        </RevealItem>

        <RevealItem>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl">
            Net-Centric Computing Laboratory
          </h1>
        </RevealItem>

        <RevealItem>
          <p className="mt-4 max-w-[48ch] font-sans text-base leading-relaxed text-text-secondary sm:text-lg">
            Research and student projects in mobile, distributed, and secure
            networked systems.
          </p>
        </RevealItem>

        <RevealItem className="mt-8 flex flex-wrap gap-3">
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
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
