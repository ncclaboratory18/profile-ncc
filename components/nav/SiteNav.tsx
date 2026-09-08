"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { NccMark } from "@/components/brand/NccMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NAV_LINKS } from "@/lib/nav";
import { isNavActive } from "@/lib/isNavActive";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Over the home page's full-bleed hero the nav is transparent until you scroll.
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        overHero
          ? "border-b border-transparent bg-transparent"
          : "border-b border-hairline bg-bg-surface/85 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-text-primary"
          onClick={() => setOpen(false)}
        >
          <NccMark height={28} priority />
          <span className="hidden sm:inline">NCC Lab</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isNavActive(pathname ?? "", link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-[var(--radius-control)] px-3 py-2 font-sans text-sm font-medium transition-colors ${
                  active
                    ? "text-accent-blue-text"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/booking"
            className="hidden rounded-[var(--radius-chip)] bg-accent-blue px-4 py-2 font-sans text-sm font-semibold text-white transition-colors hover:bg-accent-blue-hover sm:inline-block"
          >
            Book Lab
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-text-primary lg:hidden"
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-hairline bg-bg-surface px-4 py-3 lg:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-[var(--radius-control)] px-3 py-2 font-sans text-sm font-medium ${
                    isNavActive(pathname ?? "", link.href)
                      ? "text-accent-blue-text"
                      : "text-text-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="mt-1 block rounded-[var(--radius-chip)] bg-accent-blue px-3 py-2 text-center font-sans text-sm font-semibold text-white"
              >
                Book Lab
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
