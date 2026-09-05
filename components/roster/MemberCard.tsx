import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { RESEARCH_MARK } from "@/lib/gallery";
import type { TeamMember } from "@/lib/types";

export function MemberCard({
  member,
  variant = "compact",
}: {
  member: TeamMember;
  variant?: "compact" | "expanded" | "grid";
}) {
  const href =
    member.team === "admin" ? `/admins/${member.id}` : `/research-team/${member.id}`;
  const TeamIcon = member.team === "admin" ? UsersThree : ShieldCheck;

  return (
    <Link
      href={href}
      className={`group relative block shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface transition-[transform,border-color] duration-200 ease-[var(--ease-premium)] hover:scale-[1.02] hover:border-accent-blue-border-hover ${
        variant === "compact"
          ? "w-56 sm:w-64"
          : variant === "grid"
            ? "w-full"
            : "w-full max-w-sm"
      }`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-surface-raised">
        <Image
          src={member.card ?? member.photo}
          alt={member.name}
          fill
          sizes="(min-width: 640px) 256px, 224px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* The card artwork already carries name, role, generation and contact —
            only plain portraits need the chrome below. */}
        {member.card ? (
          member.team === "research" && (
            <Image
              src={RESEARCH_MARK}
              alt=""
              width={32}
              height={32}
              className="absolute right-3 top-3 h-8 w-8 rounded-[var(--radius-control)]"
            />
          )
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/10 to-transparent" />

            {/* hover scan-line: brief white sweep, reads as interface feedback, not a color swap */}
            <div className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[280%] group-hover:opacity-100" />

            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-[var(--radius-chip)] bg-bg-primary/70 px-2.5 py-1 backdrop-blur-sm">
              <TeamIcon size={12} weight="bold" className="text-accent-blue" />
              <span className="font-mono text-[11px] font-medium tracking-wide text-text-secondary">
                {member.generation}
              </span>
            </div>

            {member.team === "research" && (
              <Image
                src={RESEARCH_MARK}
                alt=""
                width={32}
                height={32}
                className="absolute right-3 top-3 h-8 w-8 rounded-[var(--radius-control)]"
              />
            )}

            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-display text-xl font-semibold leading-tight text-white sm:text-2xl">
                {member.nickname ?? member.name}
              </p>
              <p className="mt-0.5 font-sans text-xs font-medium text-text-secondary">
                {member.role}
              </p>
            </div>
          </>
        )}
      </div>

      {variant === "expanded" && (
        <div className="p-4">
          <p className="font-sans text-sm text-text-secondary">{member.name}</p>
          <p className="mt-1 font-mono text-xs text-text-tertiary">{member.nrp}</p>
        </div>
      )}
    </Link>
  );
}
