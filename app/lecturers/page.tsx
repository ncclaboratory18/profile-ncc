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
            Informatics Engineering, ITS. Select a card for a full profile.
          </p>
        </div>
      </div>

      {/* No max-width / padding wrapper here on purpose: each row's plate is
          viewport-anchored (`calc(50vw …)` in `LecturerShowcase`) so it can
          run flush to the page edge, and the horizontal overflow from that
          and from the slide animation is clipped on `.lecturer-list` itself
          — deep enough in the tree that it never becomes the scroll
          container for the window / Lenis or for any `position: sticky`
          section elsewhere on the site. */}
      <div className="w-full pt-20">
        {lecturers.length > 0 ? (
          <LecturerShowcase lecturers={lecturers} />
        ) : (
          <p className="mx-auto max-w-7xl px-6 text-center font-sans text-sm text-text-tertiary">
            No lecturers recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
