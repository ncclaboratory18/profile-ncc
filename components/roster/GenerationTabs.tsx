"use client";

export function GenerationTabs({
  generations,
  active,
  onChange,
}: {
  generations: string[];
  active: string;
  onChange: (gen: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {generations.map((gen) => {
        const isActive = gen === active;
        return (
          <button
            key={gen}
            type="button"
            onClick={() => onChange(gen)}
            className={`rounded-[var(--radius-chip)] px-4 py-2 font-sans text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent-blue text-white"
                : "bg-bg-surface text-text-secondary hover:text-text-primary"
            }`}
          >
            {gen}
          </button>
        );
      })}
    </div>
  );
}
