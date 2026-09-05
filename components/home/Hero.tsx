"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { HeroParticles } from "./HeroParticles";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { heroPhoto } from "@/lib/gallery";
import { NccMark } from "@/components/brand/NccMark";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Background drifts slower than the copy — 18% offset, not a full parallax scene.
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[92dvh] items-end overflow-hidden bg-bg-primary"
    >
      <motion.div
        className="absolute inset-0 -bottom-[18%]"
        style={reduce ? undefined : { y: photoY }}
      >
        <Image
          src={heroPhoto.src}
          alt={heroPhoto.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover [filter:grayscale(0.55)_brightness(0.5)]"
        />
      </motion.div>

      {/* Atmosphere: particles sit over the photo, under the scrim. */}
      <div className="absolute inset-0 opacity-50">
        <HeroParticles />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/55 to-bg-primary/25" />

      <RevealGroup className="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <RevealItem>
          <span className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-hairline-strong bg-bg-primary/50 px-3 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">
              Now recruiting — Gen 2026
            </span>
          </span>
        </RevealItem>

        <RevealItem className="mt-8">
          <NccMark height={72} priority />
        </RevealItem>

        <RevealItem>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-tight text-text-primary sm:text-7xl lg:text-[5.5rem]">
            Net-Centric
            <br />
            Computing Lab
          </h1>
        </RevealItem>

        <RevealItem>
          <p className="mt-6 max-w-[46ch] font-sans text-base leading-relaxed text-text-secondary sm:text-lg">
            Research and student projects in mobile, distributed, and secure
            networked systems — Departemen Teknik Informatika, ITS.
          </p>
        </RevealItem>

        <RevealItem className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/admins"
            className="rounded-[var(--radius-chip)] bg-accent-blue px-6 py-3 font-sans text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-blue-hover"
          >
            Meet the Team
          </Link>
          <Link
            href="/research"
            className="rounded-[var(--radius-chip)] border border-hairline-strong bg-bg-primary/40 px-6 py-3 font-sans text-sm font-semibold text-text-primary backdrop-blur-sm transition-colors duration-200 hover:border-accent-blue-border-hover"
          >
            View Research
          </Link>
          <span className="ml-1 hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary sm:flex">
            <ArrowDown size={13} weight="bold" />
            Scroll
          </span>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
