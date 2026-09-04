"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { GenerationTabs } from "./GenerationTabs";
import { MemberCardCarousel } from "./MemberCardCarousel";
import type { TeamMember } from "@/lib/types";
import { generationsOf } from "@/lib/data";

export function RosterView({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const generations = useMemo(() => generationsOf(members), [members]);
  const active = searchParams.get("gen") ?? generations[0];

  function setActive(gen: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("gen", gen);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const filtered = members.filter((m) => m.generation === active);

  return (
    <div>
      <GenerationTabs generations={generations} active={active} onChange={setActive} />
      <div className="mt-8">
        <MemberCardCarousel key={active} members={filtered} />
      </div>
    </div>
  );
}
