import Link from "next/link";
import Image from "next/image";
import { FileDashed } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const hasImage = project.images.length > 0;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface transition-[transform,border-color] duration-200 ease-[var(--ease-premium)] hover:scale-[1.02] hover:border-accent-blue-border-hover"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-surface-raised">
        {hasImage ? (
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-tertiary">
            <FileDashed size={28} />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
              Documentation pending
            </span>
          </div>
        )}
        {project.status && (
          <span className="absolute right-3 top-3 rounded-[var(--radius-chip)] bg-bg-primary/70 px-2.5 py-1 font-mono text-[11px] font-medium text-text-secondary backdrop-blur-sm">
            {project.status === "ongoing" ? "Ongoing" : "Completed"}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          {project.title}
        </h3>
        <p className="mt-1.5 font-sans text-sm leading-relaxed text-text-secondary">
          {project.description}
        </p>
      </div>
    </Link>
  );
}
