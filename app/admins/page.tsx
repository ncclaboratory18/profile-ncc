import type { Metadata } from "next";
import { HeroBackdrop } from "@/components/home/HeroBackdrop";
import { GenerationCarousel } from "@/components/admins/GenerationCarousel";
import { Reveal } from "@/components/motion/Reveal";
import { admins, generationsOf } from "@/lib/data";
import { heroPhoto } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Admins — NCC Lab",
};

export default function AdminsPage() {
  // Oldest generation first — reading top-to-bottom moves forward through time.
  const generations = generationsOf(admins).slice().reverse();

  return (
    <div className="pb-24">
      <div className="relative overflow-hidden pb-16 pt-20">
        <HeroBackdrop src={heroPhoto.src} alt={heroPhoto.alt} />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
            Our Admins
          </h1>
          <p className="mx-auto mt-3 max-w-[52ch] font-sans text-base leading-relaxed text-text-secondary">
            Lab operations, by generation. Click a card for a full profile.
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 pt-24 sm:px-6 lg:px-8">
        {generations.map((gen) => (
          <section key={gen}>
            <Reveal className="mb-4 text-center">
              <span className="font-mono text-sm font-medium uppercase tracking-[0.16em] text-text-tertiary">
                Generation {gen}
              </span>
            </Reveal>
            <Reveal delay={0.12}>
              <GenerationCarousel members={admins.filter((m) => m.generation === gen)} />
            </Reveal>
          </section>
        ))}
      </div>
    </div>
  );
}
