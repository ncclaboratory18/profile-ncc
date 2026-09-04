import type { ResearchPaper } from "@/lib/types";

export function PaperListItem({ paper }: { paper: ResearchPaper }) {
  const content = (
    <div className="flex flex-col gap-1.5 py-5">
      <p className="font-display text-base font-semibold text-text-primary sm:text-lg">
        {paper.title}
      </p>
      <p className="font-sans text-sm text-text-secondary">
        {paper.authors.join(", ")}
      </p>
      <p className="font-mono text-xs text-text-tertiary">
        {paper.year}
        {paper.venue ? ` · ${paper.venue}` : ""}
      </p>
    </div>
  );

  if (!paper.link) return content;

  return (
    <a
      href={paper.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-colors hover:text-accent-blue-text"
    >
      {content}
    </a>
  );
}
