import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";

export function BookingRedirectCTA({ href }: { href?: string }) {
  if (!href) {
    return (
      <div className="inline-flex cursor-not-allowed items-center gap-2 rounded-[var(--radius-chip)] bg-bg-surface-raised px-6 py-3 font-sans text-sm font-semibold text-text-tertiary">
        Booking link coming soon
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] bg-accent-blue px-6 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover"
    >
      Open Booking System
      <ArrowSquareOut size={16} />
    </a>
  );
}
