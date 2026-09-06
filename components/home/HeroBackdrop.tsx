"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";
import { HeroParticles } from "./HeroParticles";

/**
 * Full-bleed photo + particle canvas + dark scrim, parallaxed 18% on scroll.
 * Shared banner treatment for Home's hero and the Lecturers/Admins page tops —
 * per v4, those two pages keep the same visual identity as Home rather than a
 * flat background.
 */
export function HeroBackdrop({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 -bottom-[18%]"
        style={reduce ? undefined : { y: photoY }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover [filter:grayscale(0.55)_brightness(0.5)]"
        />
      </motion.div>

      <div className="absolute inset-0 opacity-50">
        <HeroParticles />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/55 to-bg-primary/25" />
    </div>
  );
}
