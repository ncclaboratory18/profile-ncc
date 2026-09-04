import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, FileDashed } from "@phosphor-icons/react/dist/ssr";
import { projects } from "@/lib/data";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  return { title: project ? `${project.title} — NCC Lab` : "Project — NCC Lab" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-accent-blue"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <div className="mt-8 flex items-center gap-3">
        <h1 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
          {project.title}
        </h1>
        {project.status && (
          <span className="rounded-[var(--radius-chip)] bg-bg-surface-raised px-2.5 py-1 font-mono text-[11px] font-medium text-text-secondary">
            {project.status === "ongoing" ? "Ongoing" : "Completed"}
          </span>
        )}
      </div>

      {project.images.length > 0 ? (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface">
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-hairline-strong bg-bg-surface/50 py-16 text-text-tertiary">
          <FileDashed size={28} />
          <span className="font-mono text-xs uppercase tracking-[0.14em]">
            Documentation pending
          </span>
        </div>
      )}

      <p className="mt-8 max-w-[65ch] font-sans text-base leading-relaxed text-text-secondary">
        {project.description}
      </p>
    </div>
  );
}
