import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { NAV_LINKS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-accent-blue text-sm font-bold text-white">
                NC
              </span>
              NCC Lab
            </div>
            <p className="mt-3 max-w-[38ch] font-sans text-sm leading-relaxed text-text-secondary">
              Net-Centric Computing Laboratory, Department of Informatics
              Engineering, Institut Teknologi Sepuluh Nopember.
            </p>
          </div>

          <div>
            <h3 className="font-sans text-sm font-semibold text-text-primary">
              Navigate
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent-blue-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-sm font-semibold text-text-primary">
              Contact
            </h3>
            <ul className="mt-3 flex flex-col gap-2 font-sans text-sm text-text-secondary">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0 text-accent-blue" />
                Department of Informatics Engineering, ITS, Surabaya
              </li>
              <li className="text-text-tertiary">
                Email / Instagram — pending
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-hairline pt-6 font-sans text-xs text-text-tertiary">
          © {new Date().getFullYear()} Net-Centric Computing Laboratory, ITS.
        </div>
      </div>
    </footer>
  );
}
