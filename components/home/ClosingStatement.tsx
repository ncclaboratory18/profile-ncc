import Link from "next/link";
import { EnvelopeSimple, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, LAB_EMAIL } from "@/lib/gallery";

export function ClosingStatement() {
  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
        <Reveal>
          <p className="max-w-[18ch] font-display text-4xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
            Networks are built by
            <span className="text-accent-blue-text"> people</span>.
          </p>
          <p className="mt-8 max-w-[54ch] font-sans text-base leading-relaxed text-text-secondary sm:text-lg">
            NCC Lab is where Informatics students at ITS learn to design, break,
            and secure the systems everything else runs on.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <Link
              href="/booking"
              className="rounded-[var(--radius-chip)] bg-accent-blue px-6 py-3 font-sans text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-blue-hover"
            >
              Book the lab
            </Link>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-hairline-strong px-6 py-3 font-sans text-sm font-semibold text-text-primary transition-colors duration-200 hover:border-accent-blue-border-hover"
            >
              <InstagramLogo size={16} weight="bold" />
              {INSTAGRAM_HANDLE}
            </a>
            <a
              href={`mailto:${LAB_EMAIL}`}
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-text-tertiary transition-colors hover:text-accent-blue-text"
            >
              <EnvelopeSimple size={14} />
              {LAB_EMAIL}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
