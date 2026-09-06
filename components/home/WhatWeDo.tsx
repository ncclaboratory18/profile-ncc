"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  DeviceMobile,
  ShareNetwork,
  ShieldCheck,
  Broadcast,
  CloudCheck,
  Fingerprint,
  WifiHigh,
} from "@phosphor-icons/react/dist/ssr";
import { useReducedMotion } from "@/lib/reduced-motion";

const AREAS = [
  {
    name: "Mobile Computing",
    icon: DeviceMobile,
    description: "Applications and protocols for devices that move, reconnect, and run on a budget.",
  },
  {
    name: "Distributed Systems",
    icon: ShareNetwork,
    description: "Coordinating work across many machines without a single point of failure.",
  },
  {
    name: "Network Security",
    icon: ShieldCheck,
    description: "Finding, understanding, and closing the gaps in networked systems.",
  },
  {
    name: "Multimedia Networks",
    icon: Broadcast,
    description: "Moving audio and video across networks that were never promised to behave.",
  },
  {
    name: "Cloud Computing",
    icon: CloudCheck,
    description: "Building for infrastructure that is rented, elastic, and shared with strangers.",
  },
  {
    name: "Digital Forensics",
    icon: Fingerprint,
    description: "Reconstructing what happened on a system from the traces it left behind.",
  },
  {
    name: "Pervasive Computing",
    icon: WifiHigh,
    description: "Sensors and embedded devices woven into physical spaces across campus.",
  },
];

/**
 * Sticky-scroll-stack: the section heading and the active number pin to the
 * left while the seven areas scroll past on the right, revealing one at a
 * time.
 *
 * The active index is driven by viewport-enter callbacks rather than
 * scroll-progress math on purpose — a scroll-linked `useTransform` feeds its
 * input range to WAAPI as keyframe offsets, which has to stay inside [0,1]
 * and has broken this codebase before. Callbacks carry no such constraint.
 */
export function WhatWeDo() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  return (
    <section className="border-y border-hairline bg-bg-surface/40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
            What we do
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.1] text-text-primary sm:text-4xl">
            Seven areas of focus
          </h2>
          <p className="mt-4 max-w-[38ch] font-sans text-base leading-relaxed text-text-secondary">
            Student research and systems work across the stack, from the radio
            up to the application.
          </p>

          <div className="mt-8 hidden items-baseline gap-3 lg:flex" aria-hidden="true">
            <span className="font-display text-6xl font-semibold leading-none text-accent-blue-text tabular-nums">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-sm text-text-tertiary">
              / {String(AREAS.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <ol className="flex flex-col">
          {AREAS.map((area, i) => {
            const Icon = area.icon;
            return (
              <motion.li
                key={area.name}
                initial={reduce ? undefined : { opacity: 0, y: 24 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onViewportEnter={() => setActive(i)}
                className="group border-b border-hairline py-8 first:border-t"
              >
                <div className="flex items-start gap-5">
                  <span className="mt-1 font-mono text-xs tabular-nums text-text-tertiary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon size={24} weight="light" className="mt-0.5 shrink-0 text-accent-blue" />
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-semibold text-text-primary sm:text-2xl">
                      {area.name}
                    </h3>
                    <p className="mt-2 max-w-[52ch] font-sans text-base leading-relaxed text-text-secondary">
                      {area.description}
                    </p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
