/**
 * "Meet the amazing people at Net-Centric Computing Lab" — the cast and the
 * scroll timeline for the home page's pinned people sequence
 * (`components/home/MeetTheLab.tsx`).
 *
 * The section is two pinned stretches: a headline far wider than the screen
 * that slides sideways as the visitor scrolls, then a large 2D canvas with
 * every member scattered along a winding path, which the viewport travels
 * like a camera — down, across, up, and down again.
 *
 * Every tunable lives in `LAB_CONFIG` below; the path math is in
 * `lib/labPath.ts`, and `npm run check` asserts the parts that have to hold.
 */

import { anchorsFor, buildPath, fitScale, scalePoints, toPx } from "./labPath.ts";

export interface LabPerson {
  id: string;
  name: string;
  /** The research-area label above the name. */
  role: string;
  /** The short headline sentence. */
  lead?: string;
  /** What they actually work on, at more length. */
  body?: string;
  skills?: string[];
  /** Up to three: large, medium, small. Missing ones are left out. */
  photos: string[];
  experience?: { year: string; what: string }[];
}

const photo = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/ncc-${seed}/${w}/${h}`;

/** The large / medium / small set every member gets. */
const photoSet = (seed: string) => [
  photo(`${seed}-a`, 1200, 1500),
  photo(`${seed}-b`, 900, 700),
  photo(`${seed}-c`, 700, 700),
];

export const labPeople: LabPerson[] = [
  {
    id: "hamasah-daikullah",
    name: "Hamasah Fatih Daikullah",
    role: "Lab Coordinator",
    lead: "Runs the lab the way you would run a small network operations centre — on a schedule, with a log, and with somebody always on call.",
    body: "Coordinates the practicum intake, the research rotation, and the hardware fund. Most of what the lab ships passes through a review he set up in his first month.",
    skills: ["Operations", "Network design", "Mentoring", "Linux"],
    photos: photoSet("hamasah"),
    experience: [
      { year: "2026", what: "Lab Coordinator" },
      { year: "2025", what: "Practicum lead, Computer Networks" },
      { year: "2024", what: "Research assistant, security track" },
    ],
  },
  {
    id: "nabila-syalwani",
    name: "Nabila Syalwani",
    role: "Research Lead — Network Security",
    lead: "Spent a semester convinced the campus mesh was clean, then found four months of beaconing nobody had looked at.",
    body: "Leads the network security track: intrusion detection on live campus traffic, and the labelling work that makes any of it trainable.",
    skills: ["Intrusion detection", "Zeek", "Python", "Traffic labelling"],
    photos: photoSet("nabila"),
    experience: [
      { year: "2026", what: "Research lead, network security" },
      { year: "2025", what: "Co-author, IoT anomaly detection" },
      { year: "2024", what: "Research assistant" },
    ],
  },
  {
    id: "algof-zega",
    name: "Algof Kristian Zega",
    role: "Infrastructure",
    lead: "Everything in the lab that has an uptime number is his, and he will tell you the number without being asked.",
    body: "Owns the cluster, the storage, and the deployment path from a member's laptop to something the rest of the lab can actually run.",
    skills: ["Kubernetes", "Proxmox", "Ceph", "CI/CD"],
    photos: photoSet("algof"),
    experience: [
      { year: "2026", what: "Infrastructure lead" },
      { year: "2025", what: "Rebuilt the lab cluster" },
      { year: "2024", what: "Systems assistant" },
    ],
  },
  {
    id: "arya-rexa",
    name: "Arya Rexa",
    role: "Digital Forensics",
    lead: "Reconstructs what happened from what was left behind, which in practice means reading logs long after everyone else has given up on them.",
    body: "Works on incident reconstruction and evidence-grade tooling — the unglamorous half of security, and the half that ends up in court.",
    skills: ["Memory forensics", "Volatility", "Log analysis", "Rust"],
    photos: photoSet("arya"),
    experience: [
      { year: "2026", what: "Forensics track lead" },
      { year: "2025", what: "Incident response toolkit" },
      { year: "2024", what: "Research assistant" },
    ],
  },
  {
    id: "danish-chitato",
    name: "Danish Chitato",
    role: "Practicum Coordinator",
    lead: "Runs the practicum every new member meets first, and rewrites it every semester based on where people actually got stuck.",
    body: "Designs the networking and systems practicum modules, trains the assistants who teach them, and keeps the grading pipeline honest.",
    skills: ["Curriculum design", "Cisco IOS", "Bash", "Teaching"],
    photos: photoSet("danish"),
    experience: [
      { year: "2026", what: "Practicum Coordinator" },
      { year: "2025", what: "Practicum assistant, Operating Systems" },
      { year: "2024", what: "Practicum assistant, Computer Networks" },
    ],
  },
  {
    id: "nanda-regon",
    name: "Nanda Regon",
    role: "Botnet Detection",
    lead: "Finds coordinated hosts by how they behave, not what they send.",
    body: "Builds flow-level detectors that group hosts by timing and rhythm, so a botnet shows up even when every packet it sends is encrypted.",
    skills: ["NetFlow", "Graph analysis", "scikit-learn", "Wireshark"],
    photos: photoSet("nanda"),
    experience: [
      { year: "2026", what: "Researcher, botnet detection" },
      { year: "2025", what: "Flow dataset collection" },
      { year: "2024", what: "Research assistant" },
    ],
  },
  {
    id: "reza-indomie",
    name: "Reza Indomie",
    role: "Steganography",
    lead: "Hides data in ordinary carriers, then proves it can be found.",
    body: "Works on both sides of steganography — embedding schemes for images and audio, and the steganalysis that detects them at scale.",
    skills: ["Image processing", "Steganalysis", "PyTorch", "C++"],
    photos: photoSet("reza"),
    experience: [
      { year: "2026", what: "Researcher, steganography" },
      { year: "2025", what: "Co-author, audio embedding study" },
      { year: "2024", what: "Research assistant" },
    ],
  },
  {
    id: "andra-juago",
    name: "Andra Juago",
    role: "Cloud Computing",
    lead: "Works the cost side of running anything at scale.",
    body: "Benchmarks autoscaling strategies and builds cost models for lab-hosted services, so a deployment decision comes with a number attached.",
    skills: ["AWS", "Terraform", "Autoscaling", "Go"],
    photos: photoSet("andra"),
    experience: [
      { year: "2026", what: "Researcher, cloud cost models" },
      { year: "2025", what: "Autoscaling benchmark suite" },
      { year: "2024", what: "Research assistant" },
    ],
  },
  {
    id: "zuardi-yasfin",
    name: "Zuardi Yasfin",
    role: "IoT & Sensor Networks",
    lead: "Low-power sensing, and the edge that has to survive it.",
    body: "Deploys and maintains the campus sensor network, and studies how far edge processing can go on a device that runs on a coin cell.",
    skills: ["LoRaWAN", "ESP32", "MQTT", "Embedded C"],
    photos: photoSet("zuardi"),
    experience: [
      { year: "2026", what: "Researcher, sensor networks" },
      { year: "2025", what: "Campus sensor deployment" },
      { year: "2024", what: "Research assistant" },
    ],
  },
  {
    id: "raynald-ambatukam",
    name: "Raynald Ambatukam",
    role: "Web & Interfaces",
    lead: "Builds the front the rest of the lab's work is seen through.",
    body: "Owns the lab's web presence and the dashboards other tracks use to show their results, from the first sketch to the deploy.",
    skills: ["React", "Next.js", "TypeScript", "UI design"],
    photos: photoSet("raynald"),
    experience: [
      { year: "2026", what: "Web lead" },
      { year: "2025", what: "Lab dashboard rebuild" },
      { year: "2024", what: "Research assistant" },
    ],
  },
  {
    id: "uwais-achmad",
    name: "Uwais Achmad",
    role: "Distributed Systems",
    lead: "Consensus, replication, and what happens when a node lies.",
    body: "Studies Byzantine fault tolerance in practice — building small replicated services, then breaking them on purpose to see what holds.",
    skills: ["Raft", "Go", "Fault injection", "Distributed tracing"],
    photos: photoSet("uwais"),
    experience: [
      { year: "2026", what: "Researcher, distributed systems" },
      { year: "2025", what: "Replicated KV store prototype" },
      { year: "2024", what: "Research assistant" },
    ],
  },
];

/** Every photograph the pinned sequence needs, for the preload gate. */
export const titlePhoto = photo("lab-title", 2400, 1400);
export const sequencePhotos = [titlePhoto, ...labPeople.flatMap((p) => p.photos)];

/* ── Tunables ────────────────────────────────────────────────────────────
   Everything that shapes the section lives in this one object. */

/** A member's five parts, as grid areas of their cluster. */
export type PartKind = "photo" | "accent" | "text" | "detail" | "card";

/** The parts that slide toward and away from the title. The title (name and
 *  headline) is the still centre; `label` is the rule and research-area line
 *  above it, and `detail` the profile photograph, description and link. */
export type MoverKind = "photo" | "accent" | "card" | "detail" | "label";

/** Easing curves for the assemble motion, each mapping 0..1 onto 0..1. */
export const EASINGS = {
  linear: (t: number) => t,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};
export type EasingName = keyof typeof EASINGS;

/** One arrangement of a cluster: column widths (fr), row sizes (CSS track
 *  sizes), and which part sits in which cell. Every part appears once, as a
 *  rectangle. */
type ClusterLayout = {
  columns: number[];
  rows: string[];
  areas: PartKind[][];
};

export const LAB_CONFIG = {
  /* The headline */

  /** Pinned scroll over which the headline travels its full length, in vh. */
  heroScrollVh: 300,
  /** Below `lg`, the headline's scroll distance is multiplied by this. */
  mobileScrollFactor: 0.8,
  /** `-1` slides the headline right→left as you scroll down, so it reads in
   *  order from "MEET" to "LAB"; `1` slides it left→right instead. */
  heroDirection: -1 as 1 | -1,

  /* The members: a camera travelling a path through a 2D canvas, with each
     member one rigid cluster of parts on it */

  /** A member's cluster on desktop: `w` wide (vw) and at most `h` tall (vh);
   *  its height follows its content up to that. Keep within 90 × 80 so a
   *  whole member is always on one screen. */
  cluster: { w: 76, h: 70 },
  /** On phones the cluster is a single column `w` wide (vw), at most `maxH`
   *  tall (vh). Both heights are what the path spacing assumes, and the tests
   *  hold the real clusters to them. */
  mobileCluster: { w: 82, maxH: 80 },
  /** Space between the parts inside a cluster, in px (phones: `mobileGap`). */
  gap: 32,
  mobileGap: 20,
  /** The least empty canvas between any two clusters: x in vw, y in vh (two
   *  clusters only need to be this far apart on one of the axes). The path
   *  keeps the shape of the waypoints but is scaled up until this holds, so
   *  raising it lengthens the path — and, through `scrollPerPathPx`, the
   *  scroll. */
  clusterGap: { x: 40, y: 40 },
  /** Parallax, applied to whole clusters only: members alternate between
   *  depth `1 + parallax` and `1 - parallax`, so the one leaving moves a few
   *  percent faster than the one arriving. The parts of a cluster never move
   *  relative to one another. 0 switches it off. */
  parallax: 0.03,

  /** Assemble / disassemble: away from the centre of the screen a cluster's
   *  parts sit a little apart, pushed out from the title along the line from
   *  the title's centre to their own; as the member reaches the centre they
   *  slide in to the exact layout, and out again as it leaves. Scrubbed by
   *  scroll, translate only, and the title itself never moves. */
  assemble: {
    /** Full spread in px, before each part's `amount`: desktop, then phones. */
    maxOffset: 80,
    mobileMaxOffset: 36,
    /** Distance along the path from the member's anchor, in members (1 = one
     *  member's share of the path), over which the parts go from fully apart
     *  to assembled. Keep `range × timing` at most 0.5 so every member is
     *  fully spread by the halfway point to its neighbour. */
    range: 0.45,
    /** How the spread follows distance: one of `EASINGS`. easeInOutCubic
     *  decelerates into the assembled layout and keeps that moment short. */
    easing: "easeInOutCubic" as EasingName,
    /** Per part: `amount` multiplies the spread (0.8–1.2), `timing` multiplies
     *  `range` (below 1 comes together later and leaves sooner). Fixed, so
     *  the motion is the same on every visit. */
    stagger: {
      photo: { amount: 1.2, timing: 1 },
      accent: { amount: 1.05, timing: 0.85 },
      card: { amount: 0.9, timing: 1.1 },
      detail: { amount: 0.8, timing: 0.95 },
      label: { amount: 1, timing: 0.9 },
    } as Record<MoverKind, { amount: number; timing: number }>,
  },

  /** Page scroll per px of camera travel, so total scroll = path length ×
   *  this. With the gaps above each member gets 2.4 to 2.6 screens of
   *  path on common desktop sizes, so 1 is roughly 250vh of scroll per
   *  member there, and about 130vh on phones. */
  scrollPerPathPx: 1,
  /** Per-frame lerp of the camera toward the scroll position (0..1). Lower
   *  is more liquid and laggier; 1 turns it off. Stacks on top of Lenis. */
  smoothing: 0.1,
  /** Tilt of the vertical lines of the background grid, in degrees. */
  gridAngleDeg: 12,

  /** The desktop path's shape, `[vw, vh]`, smoothed into a curve and scaled
   *  to fit `clusterGap`. Members are placed at equal distances along it, so
   *  the shape decides only where the camera goes, never how long a member
   *  lasts. About two points per member: down-right, then across, then
   *  up-right, then across, and again. */
  waypoints: [
    [0, -16],
    [32, 32], [72, 84], //     01 down-right
    [120, 104], [172, 96], //  02 across, bottoming out
    [212, 48], [240, -16], //  03 up-right
    [280, -40], [332, -24], // 04 across, cresting
    [368, 32], [400, 96], //   05 down-right
    [448, 120], [500, 108], // 06 across
    [540, 56], [568, -8], //   07 up-right
    [608, -32], [660, -20], // 08 across
    [696, 40], [728, 100], //  09 down-right
    [776, 124], [828, 112], // 10 across
    [868, 60], [896, 0], //    11 up-right
  ] as [number, number][],

  /** Phones: mostly downward, swaying left and right. Scaled the same way. */
  mobileWaypoints: [
    [0, -30],
    [16, 40], [0, 86], [-16, 132], [0, 178], [16, 224], [0, 270], [-16, 316],
    [0, 362], [16, 408], [0, 454], [-16, 500], [0, 546], [16, 592], [0, 638],
    [-16, 684], [0, 730], [16, 776], [0, 822], [-16, 868], [0, 914],
    [16, 960], [0, 1006],
  ] as [number, number][],

  /** Desktop arrangements of a cluster. Member i uses `layouts[i % 2]`,
   *  mirrored left-for-right on every other round, so the sequence runs
   *  A, B, A′, B′, … and no two neighbours look alike. Phones stack the
   *  parts in one column instead. */
  layouts: [
    // A — tall photograph on the left, the text block in the middle with the
    // description under it, the second photograph and the card on the right.
    {
      columns: [0.9, 1.3, 0.8],
      rows: ["auto", "minmax(26vh, auto)"],
      areas: [
        ["photo", "text", "accent"],
        ["photo", "detail", "card"],
      ],
    },
    // B — text across the top with the card beside it, both photographs and
    // the description underneath.
    {
      columns: [1.15, 0.8, 1.05],
      rows: ["auto", "32vh"],
      areas: [
        ["text", "text", "card"],
        ["photo", "accent", "detail"],
      ],
    },
  ] as ClusterLayout[],
};

export const HERO_DIRECTION = LAB_CONFIG.heroDirection;

/** Pinned scroll for the headline, in screens. */
export const heroScreens = (desktop: boolean) =>
  (LAB_CONFIG.heroScrollVh / 100) * (desktop ? 1 : LAB_CONFIG.mobileScrollFactor);

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Member `i`'s cluster arrangement, mirrored on alternate rounds. */
export function layoutAreas(i: number): ClusterLayout {
  const { layouts } = LAB_CONFIG;
  const base = layouts[i % layouts.length];
  if (Math.floor(i / layouts.length) % 2 === 0) return base;
  return {
    columns: [...base.columns].reverse(),
    rows: base.rows,
    areas: base.areas.map((row) => [...row].reverse()),
  };
}

/** The same, as CSS grid values. Columns may shrink below their content,
 *  so a long word wraps rather than pushing the cluster wider. */
export function layoutFor(i: number) {
  const L = layoutAreas(i);
  const track = (t: string) => (t.endsWith("fr") ? `minmax(0, ${t})` : t);
  return {
    columns: L.columns.map((c) => `minmax(0, ${c}fr)`).join(" "),
    rows: L.rows.map(track).join(" "),
    areas: L.areas.map((row) => `"${row.join(" ")}"`).join(" "),
  };
}

/** A member's cluster size in px, for a `w` × `h` screen. */
export function clusterPx(desktop: boolean, w: number, h: number) {
  return desktop
    ? { w: (LAB_CONFIG.cluster.w / 100) * w, h: (LAB_CONFIG.cluster.h / 100) * h }
    : { w: (LAB_CONFIG.mobileCluster.w / 100) * w, h: (LAB_CONFIG.mobileCluster.maxH / 100) * h };
}

/**
 * The camera's path for a `w` × `h` screen and where each member sits on it:
 * the waypoints' shape, scaled so every two clusters keep `clusterGap` of
 * empty canvas between them.
 */
export function membersPath(desktop: boolean, w: number, h: number) {
  const n = labPeople.length;
  const points = toPx(desktop ? LAB_CONFIG.waypoints : LAB_CONFIG.mobileWaypoints, w, h);
  const gap = { x: (LAB_CONFIG.clusterGap.x / 100) * w, y: (LAB_CONFIG.clusterGap.y / 100) * h };
  const scale = fitScale(points, n, clusterPx(desktop, w, h), gap, LAB_CONFIG.parallax);
  const path = buildPath(scalePoints(points, scale));
  return { path, anchors: anchorsFor(path, n), scale };
}

/** Member `i`'s parallax depth. */
export const depthOf = (i: number) => 1 + (i % 2 === 0 ? 1 : -1) * LAB_CONFIG.parallax;

/**
 * How far part `kind` sits from its assembled place, in px, when the camera
 * is `d` members along the path from the member's anchor (either side).
 */
export function assembleOffset(d: number, kind: MoverKind, desktop: boolean): number {
  const { maxOffset, mobileMaxOffset, range, easing, stagger } = LAB_CONFIG.assemble;
  const { amount, timing } = stagger[kind];
  const t = clamp01(Math.abs(d) / (range * timing));
  return (desktop ? maxOffset : mobileMaxOffset) * amount * EASINGS[easing](t);
}

/** Beyond this distance (in members) every part is fully spread. */
export const ASSEMBLE_REACH =
  LAB_CONFIG.assemble.range *
  Math.max(...Object.values(LAB_CONFIG.assemble.stagger).map((s) => s.timing));
