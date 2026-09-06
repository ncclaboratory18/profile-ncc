import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/layout/PageHeader";
import { LecturerCard } from "@/components/lecturers/LecturerCard";
import { MemberCard } from "@/components/roster/MemberCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { researchTeam, lecturers } from "@/lib/data";
import { RESEARCH_MARK } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Research Team — NCC Lab",
};

export default function ResearchTeamPage() {
  const head = lecturers.find((l) => l.id === "tohari-ahmad") ?? lecturers[0];

  return (
    <div className="pb-24">
      <PageHeader
        title="Research Team"
        description="Active research tracks under the NCC Lab, organized by generation."
      />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-4 sm:px-6 lg:px-8">
        <Image
          src={RESEARCH_MARK}
          alt="Research Team mark"
          width={44}
          height={44}
          className="h-11 w-11 rounded-[var(--radius-control)]"
        />
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-chip)] bg-bg-surface-raised px-2.5 py-1 font-mono text-[11px] font-medium text-text-secondary">
          <ShieldCheck size={12} weight="bold" className="text-accent-blue" />
          Under NCC Lab
        </span>
      </div>

      {head && (
        <div className="mx-auto mt-10 flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <LecturerCard lecturer={head} variant="lead" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        {researchTeam.length === 0 ? (
          <p className="text-center font-sans text-sm text-text-tertiary">
            No research team members recorded yet.
          </p>
        ) : (
          <RevealGroup className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {researchTeam.map((member) => (
              <RevealItem key={member.id}>
                <MemberCard member={member} variant="grid" />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
