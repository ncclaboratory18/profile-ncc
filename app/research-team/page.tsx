import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { RESEARCH_MARK } from "@/lib/gallery";
import { PageHeader } from "@/components/layout/PageHeader";
import { RosterView } from "@/components/roster/RosterView";
import { researchTeam } from "@/lib/data";

export const metadata: Metadata = {
  title: "Research Team — NCC Lab",
};

export default function ResearchTeamPage() {
  return (
    <div className="pb-20">
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
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <RosterView members={researchTeam} />
        </Suspense>
      </div>
    </div>
  );
}
