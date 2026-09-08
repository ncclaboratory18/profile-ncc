"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { GlitchText } from "@/components/motion/GlitchText";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { useSpotlight } from "@/lib/useSpotlight";
import type { Lecturer, TeamMember } from "@/lib/types";

/**
 * Research Team roster, built on the "numbered case-file card" pattern from
 * `references/DESIGN.md` (lixyon): a moody black-and-white portrait, a large
 * index numeral, and one small solid-accent tag carrying the role. It is the
 * one page-level card style on the site that is neither the generation
 * carousel nor the Home hover-swap grid, which is the point — the Research
 * Team reads as its own case file rather than a re-run of the Admins page.
 *
 * The desaturate-until-hovered behaviour and the sibling dimming live in
 * `globals.css` under `.casefile*`, gated behind `@media (hover: hover)` for
 * the same reason the Home spotlight is: on touch there is no hover gesture
 * to bring a dimmed card back, so touch gets every card at full strength.
 */

/**
 * Prof. Tohari's panel. Portrait, bio, and a stats card set *beside* the copy
 * rather than a stat row stacked under it — the editorial treatment from the
 * Leclerc reference (`references/DESIGN (2).md`). The persistent glow marks
 * him as fixed/anchoring rather than one more card to discover, matching the
 * Lecturers page treatment in direction v4.
 */
export function ResearchLead({
  lecturer,
  stats,
}: {
  lecturer: Lecturer;
  stats: { label: string; value: string }[];
}) {
  const { spotRef, onPointerMove } = useSpotlight<HTMLDivElement>();

  return (
    <article
      onPointerMove={onPointerMove}
      className="glow-pulse group relative overflow-hidden rounded-[var(--radius-card)] border border-accent-blue-border-hover bg-bg-surface"
    >
      <div className="relative z-10 grid grid-cols-1 gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,17rem)_1fr_minmax(0,13rem)] lg:gap-10">
        <div className="relative mx-auto aspect-[3/4] w-52 overflow-hidden rounded-[var(--radius-control)] border border-hairline-strong bg-bg-surface-raised lg:mx-0 lg:w-full">
          {lecturer.photo ? (
            <Image
              src={lecturer.photo}
              alt={lecturer.name}
              fill
              sizes="(min-width: 1024px) 272px, 208px"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl text-text-secondary">
              {initials(lecturer.name)}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-blue-text">
            {lecturer.role ?? "Head of Laboratory"}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-text-primary sm:text-4xl">
            {lecturer.name}
          </h2>
          <span aria-hidden="true" className="mt-4 block h-px w-20 bg-accent-blue" />
          <p className="mt-4 font-sans text-sm text-text-secondary sm:text-base">
            {lecturer.title}
          </p>
          {lecturer.bio && (
            <p className="mt-4 max-w-[62ch] font-sans text-sm leading-relaxed text-text-secondary sm:text-base">
              {lecturer.bio}
            </p>
          )}
          <Link
            href={`/lecturers/${lecturer.id}`}
            className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary transition-colors hover:text-accent-blue-text"
          >
            Full profile
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>

        {/* `gap-px` over a hairline background draws the dividers between
            rows without a border on each one. */}
        <dl className="flex flex-col gap-px overflow-hidden rounded-[var(--radius-control)] border border-hairline bg-hairline lg:self-start">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-bg-surface px-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                {stat.label}
              </dt>
              <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-text-primary">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        ref={spotRef}
        aria-hidden="true"
        className="card-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </article>
  );
}

/**
 * One generation's members as numbered case-file cards. `startIndex` keeps the
 * numbering running continuously across generations rather than restarting at
 * 01 under every heading.
 */
export function CaseFileGrid({
  members,
  startIndex,
}: {
  members: TeamMember[];
  startIndex: number;
}) {
  return (
    <RevealGroup className="casefile-list grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member, i) => (
        <RevealItem key={member.id} className="h-full">
          <CaseFileCard member={member} index={startIndex + i + 1} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

/** Shared with `ResearchRing`, which mounts the same card on the 3D arc. */
export function CaseFileCard({ member, index }: { member: TeamMember; index: number }) {
  const { spotRef, onPointerMove } = useSpotlight<HTMLDivElement>();

  return (
    <Link
      href={`/research-team/${member.id}`}
      onPointerMove={onPointerMove}
      className="casefile glitch-trigger group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface hover:border-accent-blue-border-hover"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-surface-raised">
        <Image
          src={member.card ?? member.photo}
          alt={member.name}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
          className="casefile-photo object-cover"
        />

        {/* The numeral is stamped on the photo itself rather than tucked into
            the copy block, so a scan down the grid reads as a numbered file.
            It gets its own scrim: a portrait with a bright top-left corner
            would otherwise swallow it, and this card style is used on both
            palettes, so it can't rely on the page behind it being dark. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#05070a]/65 to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute left-4 top-2 font-mono text-5xl font-bold leading-none tracking-tight text-white/80 sm:text-6xl"
        >
          {String(index).padStart(2, "0")}
        </span>

        {/* Card artwork already carries the name and role; only a plain
            portrait needs the chrome below (same rule as `MemberCard`). */}
        {!member.card && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="inline-block bg-accent-blue px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                <GlitchText text={member.role} trigger="hover" />
              </span>
              <p className="mt-2 font-display text-2xl font-semibold leading-tight text-white">
                {member.nickname ?? member.name}
              </p>
            </div>
          </>
        )}

        <div
          ref={spotRef}
          aria-hidden="true"
          className="card-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>

      <div className="flex flex-1 items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate font-sans text-sm text-text-primary">{member.name}</p>
          {/* The generation rides on the card now that the roster is one ring
              rather than a section per year. */}
          <p className="mt-1 font-mono text-[11px] text-text-tertiary">
            Gen {member.generation}
            {member.nrp ? ` · ${member.nrp}` : ""}
          </p>
        </div>
        <ArrowUpRight
          size={16}
          weight="bold"
          className="mt-0.5 shrink-0 text-text-tertiary transition-colors group-hover:text-accent-blue-text"
        />
      </div>
    </Link>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}
