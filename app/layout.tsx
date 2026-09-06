import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/nav/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { LoaderGate } from "@/components/motion/LoaderGate";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#05070a",
};

export const metadata: Metadata = {
  title: "NCC Lab — Net-Centric Computing Laboratory",
  description:
    "Net-Centric Computing Laboratory, Informatics Engineering, ITS Surabaya. Mobile computing, distributed systems, network security, and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-[var(--radius-control)] focus:bg-accent-blue focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <LoaderGate />
        <SmoothScroll />
        <SiteNav />
        <main id="main" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
