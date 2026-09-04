import type { Lecturer } from "@/lib/types";
import { LecturerCard } from "./LecturerCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function LecturerGrid({ lecturers }: { lecturers: Lecturer[] }) {
  return (
    <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {lecturers.map((lecturer) => (
        <RevealItem key={lecturer.id}>
          <LecturerCard lecturer={lecturer} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
