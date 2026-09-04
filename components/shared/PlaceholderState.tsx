import type { Icon } from "@phosphor-icons/react";

export function PlaceholderState({
  icon: IconComponent,
  title,
  description,
}: {
  icon: Icon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-hairline-strong bg-bg-surface/50 px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-control)] bg-bg-surface-raised text-accent-blue">
        <IconComponent size={22} />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mt-2 max-w-[45ch] font-sans text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
    </div>
  );
}
