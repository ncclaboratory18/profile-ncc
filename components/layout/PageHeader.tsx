import { Reveal } from "@/components/motion/Reveal";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-[60ch] font-sans text-base leading-relaxed text-text-secondary">
          {description}
        </p>
      )}
    </Reveal>
  );
}
