import {
  DeviceMobile,
  ShareNetwork,
  ShieldCheck,
  Broadcast,
  CloudCheck,
  Fingerprint,
  WifiHigh,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const AREAS = [
  { name: "Mobile Computing", icon: DeviceMobile },
  { name: "Distributed Systems", icon: ShareNetwork },
  { name: "Network Security", icon: ShieldCheck },
  { name: "Multimedia Networks", icon: Broadcast },
  { name: "Cloud Computing", icon: CloudCheck },
  { name: "Digital Forensics", icon: Fingerprint },
  { name: "Pervasive Computing", icon: WifiHigh },
];

export function ExpertiseGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <h2 className="max-w-xl font-display text-3xl font-semibold text-text-primary">
          What we work on
        </h2>
        <p className="mt-3 max-w-[60ch] font-sans text-base leading-relaxed text-text-secondary">
          Seven areas of focus spanning student research, systems building, and
          applied security work.
        </p>
      </Reveal>

      <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {AREAS.map(({ name, icon: AreaIcon }) => (
          <RevealItem
            key={name}
            className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-hairline bg-bg-surface p-5 transition-colors duration-200 hover:border-hairline-strong"
          >
            <AreaIcon size={22} className="text-accent-blue" />
            <span className="font-sans text-sm font-medium text-text-primary">
              {name}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
