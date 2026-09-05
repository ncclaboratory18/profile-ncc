"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { railPhotos, type GalleryPhoto } from "@/lib/gallery";
import { fadeRange } from "@/lib/railFade";
import { HeroParticles } from "./HeroParticles";

export function PhotoRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function measure() {
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 48));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const heading = (
    <div className="mb-8 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-3xl font-semibold text-text-primary sm:text-4xl">
        Lab moments
      </h2>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
        {railPhotos.length} frames
      </span>
    </div>
  );

  // Reduced motion (and touch users who prefer it): a plain native scroll rail.
  if (reduce) {
    return (
      <section className="border-t border-hairline py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{heading}</div>
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {railPhotos.map((photo) => (
            <div key={photo.src} className="w-[76vw] shrink-0 snap-center sm:w-[34vw] lg:w-[26vw]">
              <RailFrame photo={photo} />
              <RailCaption photo={photo} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[320vh] border-t border-hairline">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{heading}</div>

        <motion.div ref={trackRef} style={{ x }} className="flex gap-5 px-4 sm:px-6 lg:px-8">
          {railPhotos.map((photo, i) => (
            <div
              key={photo.src}
              className="w-[76vw] shrink-0 sm:w-[34vw] lg:w-[26vw]"
            >
              <RailFrame photo={photo} />
              <RailCaptionScrubbed
                photo={photo}
                progress={scrollYProgress}
                index={i}
                count={railPhotos.length}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Brief particle bridge into the split-nav section — not persistent. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]">
        <HeroParticles />
      </div>
    </section>
  );
}

function RailFrame({ photo }: { photo: GalleryPhoto }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface">
      <Image
        src={photo.src}
        alt={photo.caption}
        fill
        sizes="(min-width: 1024px) 26vw, (min-width: 640px) 34vw, 76vw"
        className="object-cover [filter:grayscale(0.3)_brightness(0.8)]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary/70 to-transparent" />
    </div>
  );
}

/** Static caption — reduced-motion rail. */
function RailCaption({ photo }: { photo: GalleryPhoto }) {
  return (
    <div className="mt-4">
      <CaptionText photo={photo} />
    </div>
  );
}

/** Caption brightens as its frame passes the centre of the viewport. */
function RailCaptionScrubbed({
  photo,
  progress,
  index,
  count,
}: {
  photo: GalleryPhoto;
  progress: MotionValue<number>;
  index: number;
  count: number;
}) {
  const opacity = useTransform(progress, fadeRange(index, count), [0.3, 1, 0.3]);

  return (
    <motion.div className="mt-4" style={{ opacity }}>
      <CaptionText photo={photo} />
    </motion.div>
  );
}

function CaptionText({ photo }: { photo: GalleryPhoto }) {
  return (
    <>
      <p className="font-sans text-sm font-semibold text-text-primary">
        {photo.caption}
      </p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
        {photo.meta}
      </p>
    </>
  );
}
