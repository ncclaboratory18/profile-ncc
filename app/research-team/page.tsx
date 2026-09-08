import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { HeroBackdrop } from "@/components/home/HeroBackdrop";
import { GlitchText } from "@/components/motion/GlitchText";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { ResearchLead } from "@/components/research-team/ResearchRoster";
import { ResearchRing } from "@/components/research-team/ResearchRing";
import { ResearchFocus } from "@/components/research-team/ResearchFocus";
import { generationsOf, lecturers, researchTeam } from "@/lib/data";
import { heroPhoto, RESEARCH_MARK } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Research Team — NCC Lab",
};

export default function ResearchTeamPage() {
  const head = lecturers.find((l) => l.id === "tohari-ahmad") ?? lecturers[0];
  // Oldest generation first — reading top-to-bottom moves forward through
  // time, the same order the Admins page uses.
  const generations = generationsOf(researchTeam).slice().reverse();

  const pad = (n: number) => String(n).padStart(2, "0");

  // The ring carries the whole roster in one loop, so the generation breakdown
  // that used to be section headings becomes a legend above it (and a line on
  // each card).
  const legend = generations.map(
    (generation) =>
      `${generation} · ${pad(researchTeam.filter((m) => m.generation === generation).length)}`,
  );
  const telemetry = [
    `${pad(researchTeam.length)} research assistants`,
    `${pad(generations.length)} generations`,
    "under NCC Lab",
  ];

  return (
    <div className="pb-16 [overflow-x:clip]">
      {/* Same full-bleed photo + particle + scrim treatment as Home and the
          other roster pages, so this page reads as the same site (v4 §4). */}
      <section className="relative flex min-h-[56dvh] items-end overflow-hidden pb-12 pt-20">
        <HeroBackdrop src={heroPhoto.src} alt={heroPhoto.alt} />

        <RevealGroup className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealItem className="flex items-center gap-3">
            <Image
              src={RESEARCH_MARK}
              alt="Research Team mark"
              width={56}
              height={56}
              priority
              className="h-14 w-14 rounded-[var(--radius-control)]"
            />
            <span className="inline-flex items-center gap-1.5 border-2 border-hairline-strong bg-bg-primary/50 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-text-secondary backdrop-blur-sm">
              <ShieldCheck size={13} weight="bold" className="text-accent-blue" />
              Sub-team of NCC Lab
            </span>
          </RevealItem>

          <RevealItem>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-tight text-text-primary sm:text-7xl">
              <GlitchText text="Research" trigger="once" as="span" />
              <br />
              <GlitchText text="Team" trigger="once" as="span" />
            </h1>
          </RevealItem>

          <RevealItem>
            <p className="mt-5 max-w-[52ch] font-sans text-base leading-relaxed text-text-secondary sm:text-lg">
              The lab&apos;s research arm: assistants running their own tracks
              in steganography, botnet detection, network security, and digital
              forensics, supervised by the Head of Laboratory.
            </p>
          </RevealItem>

          {/* Telemetry strip — the mono status line from the lixyon reference,
              carrying real counts rather than decorative numbers. */}
          <RevealItem className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
            {telemetry.map((entry, i) => (
              <span key={entry} className="flex items-center gap-4">
                {i > 0 && <span aria-hidden="true" className="h-3 w-px bg-hairline-strong" />}
                {entry}
              </span>
            ))}
          </RevealItem>
        </RevealGroup>
      </section>

      {head && (
        <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <Reveal>
            <ResearchLead
              lecturer={head}
              stats={[
                { label: "Research assistants", value: pad(researchTeam.length) },
                { label: "Generations", value: pad(generations.length) },
                { label: "Latest intake", value: generations.at(-1) ?? "—" },
              ]}
            />
          </Reveal>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        {researchTeam.length === 0 ? (
          <p className="text-center font-sans text-sm text-text-tertiary">
            No research team members recorded yet.
          </p>
        ) : (
          <>
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-hairline-strong pb-3">
                <h2 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
                  Research assistants
                </h2>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
                  {legend.join("  ·  ")}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="mt-8">
              <ResearchRing members={researchTeam} />
            </Reveal>
          </>
        )}
      </section>

      <ResearchFocus />

      {/* Closing beat: the oversized wordmark with a ghosted duplicate behind
          it, straight from `references/DESIGN.md`. */}
      <section className="mt-16 border-t-2 border-hairline-strong">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Reveal>
            <p className="relative select-none font-display text-[16vw] font-semibold leading-[0.82] tracking-tight text-text-primary sm:text-[13vw]">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 translate-x-[0.06em] translate-y-[0.06em] text-text-primary/10"
              >
                Research
              </span>
              <span className="relative">Research</span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/research"
                className="inline-flex items-center bg-accent-blue px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 hover:bg-accent-blue-hover"
              >
                Published work
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center border-2 border-hairline-strong px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.1em] text-text-primary transition-colors duration-200 hover:border-accent-blue"
              >
                Lab projects
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
