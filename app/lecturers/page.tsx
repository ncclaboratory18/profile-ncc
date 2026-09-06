import type { Metadata } from "next";
import { HeroBackdrop } from "@/components/home/HeroBackdrop";
import { LecturerShowcase } from "@/components/lecturers/LecturerShowcase";
import { lecturers } from "@/lib/data";
import { heroPhoto } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Lecturers — NCC Lab",
};

export default function LecturersPage() {
  return (
    <div className="pb-24">
      <div className="relative overflow-hidden pb-16 pt-20">
        <HeroBackdrop src={heroPhoto.src} alt={heroPhoto.alt} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
            Lecturers
          </h1>
          <p className="mx-auto mt-3 max-w-[52ch] font-sans text-base leading-relaxed text-text-secondary">
            Faculty supervising the NCC Lab within the Department of
            Informatics Engineering, ITS.
          </p>
        </div>
      </div>

      {/* Full-bleed on purpose: a centered max-width container would pull both
          sides back toward the middle of a wide screen, which is what made the
          alternation read as "still centered". */}
      <div className="w-full px-4 pt-20 sm:px-8 lg:px-16">
        {lecturers.length > 0 ? (
          <LecturerShowcase lecturers={lecturers} />
        ) : (
          <p className="text-center font-sans text-sm text-text-tertiary">
            No lecturers recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
