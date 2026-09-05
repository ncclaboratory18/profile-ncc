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

/** Horizontal scroll-linked rail — lab moments. */
export const railPhotos: GalleryPhoto[] = [
  { src: "https://picsum.photos/seed/ncc-rail-1/1200/1500", caption: "Internal Hackathon", meta: "Lab · 2025" },
  { src: "https://picsum.photos/seed/ncc-rail-2/1200/1500", caption: "Network Security Workshop", meta: "Departemen Informatika · 2025" },
  { src: "https://picsum.photos/seed/ncc-rail-3/1200/1500", caption: "Open Recruitment Day", meta: "NCC Lab · 2024" },
  { src: "https://picsum.photos/seed/ncc-rail-4/1200/1500", caption: "Research Sprint", meta: "Research Team · 2024" },
  { src: "https://picsum.photos/seed/ncc-rail-5/1200/1500", caption: "Generation Handover", meta: "Lab · 2024" },
  { src: "https://picsum.photos/seed/ncc-rail-6/1200/1500", caption: "Practicum Session", meta: "Lab · 2023" },
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
