"use client";

import Image from "next/image";
import { useSpotlight } from "@/lib/useSpotlight";
import type { Lecturer } from "@/lib/types";

export function LecturerCard({
  lecturer,
  variant = "default",
}: {
  lecturer: Lecturer;
  /** "lead" = Prof. Tohari's larger card with a persistent glow. */
  variant?: "default" | "lead";
}) {
  const { spotRef, onPointerMove } = useSpotlight<HTMLDivElement>();
  const lead = variant === "lead";

  return (
    <div
      onPointerMove={onPointerMove}
      className={`group relative flex flex-col items-center overflow-hidden rounded-[var(--radius-card)] border bg-bg-surface text-center transition-[border-color] duration-200 ${
        lead
          ? "glow-pulse w-full max-w-sm border-accent-blue-border-hover p-9"
          : "w-full max-w-xs border-hairline p-6 hover:border-accent-blue-border-hover"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-full border border-hairline-strong ${
          lead ? "h-40 w-40" : "h-28 w-28"
        }`}
      >
        {lecturer.photo ? (
          <Image
            src={lecturer.photo}
            alt={lecturer.name}
            fill
            sizes={lead ? "160px" : "112px"}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bg-surface-raised font-display text-lg text-text-secondary">
            {lecturer.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
        )}
      </div>

      {lecturer.role && (
        <span className="mt-4 rounded-[var(--radius-chip)] bg-bg-surface-raised px-2.5 py-1 font-mono text-[11px] font-medium text-text-secondary">
          {lecturer.role}
        </span>
      )}

      <h3
        className={`mt-3 font-display font-semibold text-text-primary ${lead ? "text-2xl" : "text-lg"}`}
      >
        {lecturer.name}
      </h3>
      <p className="mt-1 font-sans text-xs leading-relaxed text-text-secondary">
        {lecturer.title}
      </p>

      <div
        ref={spotRef}
        aria-hidden="true"
        className="card-spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </div>
  );
}
