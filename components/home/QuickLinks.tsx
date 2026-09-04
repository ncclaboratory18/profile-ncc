import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const LINKS = [
  { href: "/admins", label: "Admins", desc: "Lab operations, by generation" },
  { href: "/research-team", label: "Research Team", desc: "Active research tracks" },
  { href: "/lecturers", label: "Lecturers", desc: "Faculty supervising the lab" },
  { href: "/projects", label: "Projects", desc: "Builds and case studies" },
  { href: "/research", label: "Research", desc: "Published papers" },
  { href: "/booking", label: "Book the Lab", desc: "Reserve lab hours" },
];

export function QuickLinks() {
  return (
    <section className="border-y border-hairline bg-bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            Explore the lab
          </h2>
        </Reveal>

        <RevealGroup className="mt-8 grid grid-cols-1 divide-y divide-hairline border-t border-hairline sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
          {LINKS.map((link) => (
            <RevealItem key={link.href}>
              <Link
                href={link.href}
                className="group flex items-center justify-between gap-4 px-1 py-5 transition-colors sm:px-6"
              >
                <div>
                  <p className="font-sans text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-blue-text">
                    {link.label}
                  </p>
                  <p className="mt-1 font-sans text-xs text-text-secondary">
                    {link.desc}
                  </p>
                </div>
                <ArrowUpRight
                  size={18}
                  className="shrink-0 text-text-tertiary transition-colors group-hover:text-accent-blue"
                />
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
