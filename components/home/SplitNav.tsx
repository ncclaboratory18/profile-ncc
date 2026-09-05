import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { RESEARCH_MARK, splitPhotos } from "@/lib/gallery";

const PANELS = [
  {
    href: "/admins",
    label: "Admins",
    desc: "Lab operations, onboarding, and the people running the room — grouped by generation.",
    photo: splitPhotos.admins,
    icon: UsersThree,
    mark: null,
  },
  {
    href: "/research-team",
    label: "Research Team",
    desc: "Active research tracks in security, forensics, and distributed systems.",
    photo: splitPhotos.research,
    icon: ShieldCheck,
    mark: RESEARCH_MARK,
  },
];

/** The primary navigation moment: two full-height tiles, photo revealed on hover. */
export function SplitNav() {
  return (
    <section className="grid grid-cols-1 border-y border-hairline md:grid-cols-2">
      {PANELS.map(({ href, label, desc, photo, icon: Icon, mark }, i) => (
        <Link
          key={href}
          href={href}
          className={`group relative flex min-h-[52vh] flex-col justify-end overflow-hidden bg-bg-primary p-8 sm:p-12 ${
            i === 0 ? "border-b border-hairline md:border-b-0 md:border-r" : ""
          }`}
        >
          <Image
            src={photo}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover opacity-0 [filter:grayscale(0.4)_brightness(0.45)] transition-opacity duration-300 ease-[var(--ease-premium)] group-hover:opacity-100 group-focus-visible:opacity-100"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative">
            {mark ? (
              <Image
                src={mark}
                alt=""
                width={52}
                height={52}
                className="h-13 w-13 rounded-[var(--radius-control)]"
              />
            ) : (
              <Icon size={26} weight="light" className="text-accent-blue" />
            )}
            <h2 className="mt-5 font-display text-4xl font-semibold leading-none tracking-tight text-text-primary sm:text-6xl">
              {label}
            </h2>
            <p className="mt-4 max-w-[42ch] font-sans text-sm leading-relaxed text-text-secondary">
              {desc}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary transition-colors group-hover:text-accent-blue-text">
              View roster
              <ArrowUpRight size={14} weight="bold" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
