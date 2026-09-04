import Image from "next/image";
import type { Lecturer } from "@/lib/types";

export function LecturerCard({ lecturer }: { lecturer: Lecturer }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-hairline bg-bg-surface p-6 text-center">
      <div className="relative h-28 w-28 overflow-hidden rounded-full border border-hairline-strong">
        {lecturer.photo ? (
          <Image
            src={lecturer.photo}
            alt={lecturer.name}
            fill
            sizes="112px"
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

      <h3 className="mt-3 font-display text-lg font-semibold text-text-primary">
        {lecturer.name}
      </h3>
      <p className="mt-1 font-sans text-xs leading-relaxed text-text-secondary">
        {lecturer.title}
      </p>
    </div>
  );
}
