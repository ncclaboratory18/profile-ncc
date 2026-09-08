import Image from "next/image";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { socialPhotos, INSTAGRAM_URL } from "@/lib/gallery";

/** Manual mirror of the recent Instagram grid. */
export function SocialGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="flex items-center gap-3 font-display text-3xl font-semibold text-text-primary sm:text-4xl">
            <InstagramLogo size={28} weight="light" className="text-accent-blue" />
            @ncclab_its
          </h2>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary transition-colors hover:text-accent-blue-text"
          >
            Follow
          </a>
        </div>
      </Reveal>

      <RevealGroup className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {socialPhotos.map((src, i) => (
          <RevealItem key={src}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-[var(--radius-control)] border border-hairline transition-colors hover:border-accent-blue-border-hover"
            >
              <Image
                src={src}
                alt={`Instagram post ${i + 1}`}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover [filter:grayscale(0.45)_brightness(0.7)] transition-[filter,transform] duration-300 ease-[var(--ease-premium)] group-hover:scale-[1.03] group-hover:[filter:grayscale(0)_brightness(1)]"
              />
            </a>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
