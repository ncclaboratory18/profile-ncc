"use client";

import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { MemberCard } from "./MemberCard";
import type { TeamMember } from "@/lib/types";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function MemberCardCarousel({ members }: { members: TeamMember[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: "smooth" });
  }

  if (members.length === 0) {
    return (
      <p className="font-sans text-sm text-text-tertiary">
        No members recorded for this generation yet.
      </p>
    );
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <RevealGroup className="flex gap-4">
          {members.map((member) => (
            <RevealItem key={member.id} className="snap-start">
              <MemberCard member={member} variant="compact" />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {members.length > 3 && (
        <div className="mt-4 hidden justify-end gap-2 sm:flex">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-hairline text-text-secondary transition-colors hover:border-accent-blue-border-hover hover:text-accent-blue"
          >
            <CaretLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] border border-hairline text-text-secondary transition-colors hover:border-accent-blue-border-hover hover:text-accent-blue"
          >
            <CaretRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
