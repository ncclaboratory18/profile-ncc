import Link from "next/link";
import { GlitchText } from "@/components/motion/GlitchText";
import { NAV_LINKS } from "@/lib/nav";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
        Error 404
      </p>
      <h1 className="mt-4 font-display text-6xl font-semibold text-text-primary sm:text-8xl">
        <GlitchText text="404" trigger="once" />
      </h1>
      <p className="mt-4 max-w-[46ch] font-sans text-base leading-relaxed text-text-secondary">
        This page doesn&apos;t exist, or it moved. Try one of the lab&apos;s
        main sections below.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-[var(--radius-chip)] bg-accent-blue px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
      >
        Back to home
      </Link>

      <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {NAV_LINKS.filter((link) => link.href !== "/").map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1 font-sans text-sm text-text-secondary transition-colors hover:text-accent-blue-text"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
