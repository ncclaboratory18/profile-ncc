"use client";

import Image from "next/image";
import Link from "next/link";
import { GlitchText } from "@/components/motion/GlitchText";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
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
 * Prof. Tohari, at the head of the page.
 *
 * No panel, no fill, no glow: the copy sits directly on the canvas and a thick
 * accent rule above it does the marking the pulsing halo used to do. That rule
 * is the only piece of full-strength accent on the page, which is what makes
 * it read as "this person anchors everything below" rather than as decoration.
 */
export function ResearchLead({
  lecturer,
  stats,
}: {
  lecturer: Lecturer;
  stats: { label: string; value: string }[];
}) {
  return (
    <article className="border-t-8 border-accent-blue pt-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-10">
        <div className="relative aspect-[3/4] w-44 shrink-0 overflow-hidden bg-bg-surface-raised sm:w-52 lg:w-full">
          {lecturer.photo ? (
            <Image
              src={lecturer.photo}
              alt={lecturer.name}
              fill
              sizes="(min-width: 1024px) 256px, 208px"
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
          <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-text-primary sm:text-5xl">
            {lecturer.name}
          </h2>
          <p className="mt-4 font-sans text-base text-text-secondary">{lecturer.title}</p>
          {lecturer.bio && (
            <p className="mt-5 max-w-[62ch] font-sans text-base leading-relaxed text-text-secondary">
              {lecturer.bio}
            </p>
          )}
          <Link
            href={`/lecturers/${lecturer.id}`}
            className="mt-6 inline-block border-b-4 border-accent-blue pb-1 font-mono text-sm font-bold uppercase tracking-[0.1em] text-text-primary transition-colors hover:text-accent-blue-text"
          >
            Full profile
          </Link>

          {/* Rules instead of boxes: the numbers are divided by lines drawn
              between them, not by three little cards each with its own edge. */}
          <dl className="mt-8 grid grid-cols-1 border-t-2 border-hairline-strong sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-b border-hairline py-3 sm:border-b-0 sm:border-r-2 sm:border-hairline-strong sm:pr-5 sm:last:border-r-0 sm:[&:not(:first-child)]:pl-5"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-display text-3xl font-semibold tabular-nums text-text-primary">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
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
    <RevealGroup className="casefile-list grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

  return (
    <Link
      href={`/research-team/${member.id}`}
      className="casefile glitch-trigger group relative flex h-full flex-col overflow-hidden border-2 border-hairline-strong hover:border-accent-blue"
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
