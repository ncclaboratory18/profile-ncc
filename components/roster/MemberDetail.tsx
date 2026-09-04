import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  EnvelopeSimple,
  InstagramLogo,
  IdentificationCard,
  GraduationCap,
} from "@phosphor-icons/react/dist/ssr";
import type { TeamMember } from "@/lib/types";

export function MemberDetail({ member }: { member: TeamMember }) {
  const backHref = member.team === "admin" ? "/admins" : "/research-team";
  const backLabel = member.team === "admin" ? "Admins" : "Research Team";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-accent-blue"
      >
        <ArrowLeft size={16} />
        Back to {backLabel}
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface">
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="font-display text-3xl font-semibold text-white">
              {member.nickname ?? member.name}
            </p>
            <p className="mt-1 font-sans text-sm font-medium text-text-secondary">
              {member.role}
            </p>
          </div>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary">
            Generation {member.generation}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary sm:text-4xl">
            {member.name}
          </h1>

          {member.bio && (
            <p className="mt-4 max-w-[65ch] font-sans text-base leading-relaxed text-text-secondary">
              {member.bio}
            </p>
          )}

          <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-hairline bg-bg-surface p-4">
              <dt className="flex items-center gap-2 font-sans text-xs font-medium text-text-tertiary">
                <GraduationCap size={16} className="text-accent-blue" />
                Major
              </dt>
              <dd className="mt-1 font-sans text-sm text-text-primary">{member.major}</dd>
            </div>
            {member.nrp && (
              <div className="rounded-[var(--radius-card)] border border-hairline bg-bg-surface p-4">
                <dt className="flex items-center gap-2 font-sans text-xs font-medium text-text-tertiary">
                  <IdentificationCard size={16} className="text-accent-blue" />
                  NRP
                </dt>
                <dd className="mt-1 font-mono text-sm text-text-primary">{member.nrp}</dd>
              </div>
            )}
            {member.email && (
              <div className="rounded-[var(--radius-card)] border border-hairline bg-bg-surface p-4">
                <dt className="flex items-center gap-2 font-sans text-xs font-medium text-text-tertiary">
                  <EnvelopeSimple size={16} className="text-accent-blue" />
                  Email
                </dt>
                <dd className="mt-1 break-all font-sans text-sm text-text-primary">
                  {member.email}
                </dd>
              </div>
            )}
            {member.instagram && (
              <div className="rounded-[var(--radius-card)] border border-hairline bg-bg-surface p-4">
                <dt className="flex items-center gap-2 font-sans text-xs font-medium text-text-tertiary">
                  <InstagramLogo size={16} className="text-accent-blue" />
                  Instagram
                </dt>
                <dd className="mt-1 font-sans text-sm text-text-primary">
                  {member.instagram}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
