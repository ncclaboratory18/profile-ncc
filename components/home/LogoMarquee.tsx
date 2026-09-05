import { NccMark } from "@/components/brand/NccMark";
import { lecturers } from "@/lib/data";

// No partner logo files exist yet — wordmarks stand in and swap 1:1 for <Image> later.
const MARKS = [
  "Institut Teknologi Sepuluh Nopember",
  "Departemen Teknik Informatika",
  "Fakultas Teknologi Elektro dan Informatika Cerdas",
  ...lecturers.map((l) => l.name),
];

/** Slow logo/affiliation marquee. Pauses on hover; frozen under reduced-motion. */
export function LogoMarquee() {
  return (
    <section
      className="group overflow-hidden border-y border-hairline bg-bg-surface py-10"
      aria-label="Affiliations"
    >
      <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
          Supervised &amp; supported by
        </p>
      </div>

      <div className="marquee-track flex w-max gap-12 group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center gap-12"
            aria-hidden={copy === 1 || undefined}
          >
            <li>
              <NccMark height={30} className="opacity-80" />
            </li>
            {MARKS.map((mark) => (
              <li
                key={mark}
                className="whitespace-nowrap font-sans text-sm font-medium text-text-secondary"
              >
                {mark}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
