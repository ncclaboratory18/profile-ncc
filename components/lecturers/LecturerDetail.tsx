import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  EnvelopeSimple,
  IdentificationCard,
  GraduationCap,
  Books,
  LinkSimple,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { Lecturer } from "@/lib/types";

/**
 * Full-profile page for a single lecturer — the same two-column detail
 * layout as `MemberDetail` (admins / research team), adapted to the
 * `Lecturer` shape: a mono role kicker, name, academic title, bio, and a
 * card grid of whichever external links (email, faculty profile, Scopus,
 * Scholar, SINTA) are present in the data.
 */
export function LecturerDetail({ lecturer }: { lecturer: Lecturer }) {
  const initials = lecturer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const contactRows = (
    [
      lecturer.email && {
        Icon: EnvelopeSimple,
        label: "Email",
        value: lecturer.email,
        href: `mailto:${lecturer.email}`,
      },
      lecturer.profileUrl && {
        Icon: IdentificationCard,
        label: "Faculty profile",
        value: lecturer.profileUrl,
        href: lecturer.profileUrl,
      },
      lecturer.scopusUrl && {
        Icon: Books,
        label: "Scopus",
        value: lecturer.scopusUrl,
        href: lecturer.scopusUrl,
      },
      lecturer.scholarUrl && {
        Icon: GraduationCap,
        label: "Google Scholar",
        value: lecturer.scholarUrl,
        href: lecturer.scholarUrl,
      },
      lecturer.sintaUrl && {
        Icon: LinkSimple,
        label: "SINTA",
        value: lecturer.sintaUrl,
        href: lecturer.sintaUrl,
      },
    ].filter(Boolean) as {
      Icon: Icon;
      label: string;
      value: string;
      href: string;
    }[]
  ).map((row) => ({
    ...row,
    display: row.value.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/lecturers"
        className="inline-flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-accent-blue"
      >
        <ArrowLeft size={16} />
        Back to Lecturers
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-bg-surface">
          {lecturer.photo ? (
            <Image
              src={lecturer.photo}
              alt={lecturer.name}
              fill
              sizes="(min-width: 1024px) 380px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-surface-raised font-display text-5xl text-text-secondary">
              {initials}
            </div>
          )}
        </div>

        <div>
          {lecturer.role && (
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-text-tertiary">
              {lecturer.role}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl font-semibold text-text-primary sm:text-4xl">
            {lecturer.name}
          </h1>
          <p className="mt-2 font-sans text-base text-text-secondary">
            {lecturer.title}
          </p>

          {lecturer.bio && (
            <p className="mt-4 max-w-[65ch] font-sans text-base leading-relaxed text-text-secondary">
              {lecturer.bio}
            </p>
          )}

          {contactRows.length > 0 && (
            <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {contactRows.map(({ Icon, label, href, display }) => (
                <div
                  key={label}
                  className="rounded-[var(--radius-card)] border border-hairline bg-bg-surface p-4"
                >
                  <dt className="flex items-center gap-2 font-sans text-xs font-medium text-text-tertiary">
                    <Icon size={16} className="text-accent-blue" />
                    {label}
                  </dt>
                  <dd className="mt-1 font-sans text-sm text-text-primary">
                    <a
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                      className="break-all transition-colors hover:text-accent-blue"
                    >
                      {display}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
