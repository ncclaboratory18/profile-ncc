/**
 * Home-page imagery for the v3 scrollytelling layout.
 *
 * SWAPPING IN REAL PHOTOS: replace the `src` values below with local paths
 * (`/gallery/hackathon-2025.jpg`, `/social/post-01.jpg`, ...) and drop the files
 * into `public/gallery/` and `public/social/`. Nothing else needs to change —
 * every home section reads from this file.
 */

export interface GalleryPhoto {
  src: string;
  caption: string;
  meta: string;
}

/** Full-bleed hero backdrop. */
export const heroPhoto = {
  src: "https://picsum.photos/seed/ncc-hero-lab/2000/1200",
  alt: "NCC Lab workspace",
};

/**
 * Horizontal scroll-linked milestone timeline — home page.
 *
 * `size` picks the frame's height + aspect, `depth` how near the camera it
 * sits, `offset` how far it rides above (negative) or below (positive) the
 * middle of the screen, as a fraction of the timeline area. Arrows are drawn
 * between consecutive entries, so order is the story. Years/captions are
 * placeholders — swap for real lab history.
 */
export interface Milestone {
  year: string;
  caption: string;
  meta: string;
  size: "sm" | "md" | "lg" | "tall" | "wide";
  depth: "far" | "mid" | "near";
  offset: number;
  /** Photo entries carry a `src`; note entries carry a `body` instead. */
  src?: string;
  body?: string;
}

/**
 * Stable list key for a milestone.
 *
 * Not `src`: note entries carry a `body` instead, so keying on `src` hands
 * React `undefined` for every one of them — a missing key, and a collision
 * between notes on top of that. Years are not unique either (a year can hold
 * both a photo and a note), so identity is the pair.
 */
export function milestoneKey(m: Milestone): string {
  return `${m.year}-${m.caption}`;
}

export const milestones: Milestone[] = [
  { year: "2018", caption: "Lab established", meta: "Departemen Informatika", size: "lg", depth: "near", offset: -0.05, src: "https://picsum.photos/seed/ncc-ms-1/1200/1500" },
  { year: "2019", caption: "First practicum intake", meta: "Lab", size: "sm", depth: "far", offset: 0.19, src: "https://picsum.photos/seed/ncc-ms-2/1000/1000" },
  {
    year: "2020",
    caption: "Remote research year",
    meta: "Research Team",
    size: "wide",
    depth: "mid",
    offset: -0.18,
    body: "Everything moved onto the network the lab studies. Weekly reading groups, paper drafts and testbeds all ran remote — and the lab kept publishing through it.",
  },
  { year: "2021", caption: "First research sprint", meta: "Research Team", size: "tall", depth: "near", offset: 0.07, src: "https://picsum.photos/seed/ncc-ms-4/1000/1500" },
  { year: "2022", caption: "Network lab rebuild", meta: "Lab", size: "sm", depth: "far", offset: -0.21, src: "https://picsum.photos/seed/ncc-ms-5/1000/1000" },
  {
    year: "2023",
    caption: "Practicum program",
    meta: "Lab",
    size: "wide",
    depth: "mid",
    offset: 0.17,
    body: "Computer networks practicum runs out of the lab: routing, subnetting, packet capture and the kind of debugging you only learn with a cable in your hand.",
  },
  { year: "2023", caption: "Paper streak", meta: "Research Team", size: "wide", depth: "near", offset: -0.12, src: "https://picsum.photos/seed/ncc-ms-7/1600/1000" },
  { year: "2024", caption: "Open recruitment day", meta: "NCC Lab", size: "lg", depth: "mid", offset: 0.15, src: "https://picsum.photos/seed/ncc-ms-8/1000/1500" },
  {
    year: "2024",
    caption: "Generation handover",
    meta: "Lab",
    size: "md",
    depth: "mid",
    offset: -0.17,
    body: "Every generation hands the lab to the next one: keys, servers, running projects and the habits that keep them alive.",
  },
  { year: "2025", caption: "Network security workshop", meta: "Departemen Informatika", size: "wide", depth: "far", offset: 0.16, src: "https://picsum.photos/seed/ncc-ms-10/1600/1000" },
  { year: "2025", caption: "Internal hackathon", meta: "Lab", size: "lg", depth: "near", offset: -0.06, src: "https://picsum.photos/seed/ncc-ms-11/1200/1500" },
];

/** Backdrops revealed on hover in the two-panel split nav. */
export const splitPhotos = {
  admins: "https://picsum.photos/seed/ncc-split-admins/1400/1000",
  research: "https://picsum.photos/seed/ncc-split-research/1400/1000",
};

/** Manual mirror of the recent @ncclab_its grid. */
export const socialPhotos = [
  "https://picsum.photos/seed/ncc-ig-1/800/800",
  "https://picsum.photos/seed/ncc-ig-2/800/800",
  "https://picsum.photos/seed/ncc-ig-3/800/800",
  "https://picsum.photos/seed/ncc-ig-4/800/800",
  "https://picsum.photos/seed/ncc-ig-5/800/800",
  "https://picsum.photos/seed/ncc-ig-6/800/800",
  "https://picsum.photos/seed/ncc-ig-7/800/800",
  "https://picsum.photos/seed/ncc-ig-8/800/800",
];

export const INSTAGRAM_URL = "https://www.instagram.com/ncclab_its/";
export const INSTAGRAM_HANDLE = "@ncclab_its";
export const LAB_EMAIL = "ncclaboratory18@gmail.com";

/** Brand marks (real assets, from `images/`). */
export const NCC_MARK = "/logo/ncc-mark.png";
export const RESEARCH_MARK = "/logo/research-team-mark.png";
