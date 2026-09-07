"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import type { Project } from "@/lib/types";

/**
 * "Our works" — the same zigzag spotlight as the Home page's "Meet the lab",
 * reusing the `.spotlight-*` styles for the dim-at-rest / brighten-on-hover
 * (and brighten-when-scrolled-to-centre) behaviour. Each row links to the
 * project's own page.
 */
export function WorksSpotlight({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
          Our works
        </p>
        <h2 className="mt-3 max-w-[20ch] font-display text-3xl font-semibold leading-[1.1] text-text-primary sm:text-5xl">
          What&apos;s coming out of the lab
        </h2>
      </Reveal>

      <div className="spotlight-list mt-16 flex flex-col gap-14 sm:gap-20">
        {projects.map((project, i) => (
          <WorkRow key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}

function WorkRow({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const active = useInView(ref, { margin: "-35% 0px -35% 0px" });
  const done = project.status === "completed";
  const img = project.images[0];

  return (
    <Reveal>
      <Link
        ref={ref}
        href={`/projects/${project.id}`}
        className={`spotlight-row group grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12 ${
          active ? "is-active" : ""
        }`}
      >
        <div className={index % 2 === 0 ? "lg:order-1" : "lg:order-2"}>
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface">
            {img && (
              <Image
                src={img}
                alt={project.title}
                fill
                sizes="(min-width: 1024px) 45vw, 92vw"
                className="spotlight-photo object-cover"
              />
            )}
          </div>
        </div>

        <div className={index % 2 === 0 ? "lg:order-2" : "lg:order-1"}>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-blue-text">
            {done ? "Completed" : "Ongoing"}
            {project.year ? ` · ${project.year}` : ""}
          </p>

          <h3 className="mt-2 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
            {project.title}
          </h3>
          <span
            aria-hidden="true"
            className="spotlight-underline mt-2 block h-px w-16 bg-accent-blue"
          />

          <p className="mt-4 line-clamp-3 max-w-[46ch] font-sans text-base leading-relaxed text-text-secondary">
            {project.description}
          </p>

          <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary transition-colors group-hover:text-accent-blue-text">
            View project
            <ArrowUpRight size={14} weight="bold" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
