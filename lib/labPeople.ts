/**
 * "People at Net-Centric Computing Lab" — the cast and the scroll timeline for
 * the home page's pinned people sequence (`components/home/MeetTheLab.tsx`).
 *
 * The section is two movements: four people get a full editorial chapter of
 * roughly a screen each, the remaining seven go by in rapid passes at about a
 * third of that. The change of pace is the point — eleven full chapters would
 * be a twelve-screen pin, which nobody reads to the end of.
 *
 * All of the timing lives here as plain numbers and pure functions so the
 * component only has to render, and so `npm run check` can assert the parts
 * that have to hold (no gaps between people, no two neighbours moving the
 * same way).
 */

export type Enter = "below" | "right" | "left" | "behind";
export type Exit = "left" | "right" | "up" | "down" | "back" | "hold";

export interface LabPerson {
  id: string;
  name: string;
  role: string;
  /** The sentence that makes them interesting. Chapters only. */
  lead: string;
  /** What they actually work on. Chapters only. */
  body: string;
  /** The single short line the rapid passes get instead. */
  line: string;
  /** Three for a chapter (large, medium, small); one for a pass. */
  photos: string[];
  experience?: { year: string; what: string }[];
  enter: Enter;
  exit: Exit;
  /** Rapid passes only: which side of the screen this one occupies. */
  side?: "left" | "center" | "right";
}

/** Everyone before this index gets a full chapter; the rest are rapid passes. */
export const FULL_CHAPTERS = 4;

const photo = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/ncc-${seed}/${w}/${h}`;

export const labPeople: LabPerson[] = [
  {
    id: "hamasah-daikullah",
    name: "Hamasah Fatih Daikullah",
    role: "Lab Coordinator",
    lead: "Runs the lab the way you would run a small network operations centre — on a schedule, with a log, and with somebody always on call.",
    body: "Coordinates the practicum intake, the research rotation, and the hardware fund. Most of what the lab ships passes through a review he set up in his first month.",
    line: "Coordinates the practicum intake and the research rotation.",
    photos: [
      photo("hamasah-a", 1200, 1500),
      photo("hamasah-b", 900, 700),
      photo("hamasah-c", 700, 700),
    ],
    experience: [
      { year: "2026", what: "Lab Coordinator" },
      { year: "2025", what: "Practicum lead, Computer Networks" },
      { year: "2024", what: "Research assistant, security track" },
    ],
    enter: "below",
    exit: "left",
  },
  {
    id: "nabila-syalwani",
    name: "Nabila Syalwani",
    role: "Research Lead — Network Security",
    lead: "Spent a semester convinced the campus mesh was clean, then found four months of beaconing nobody had looked at.",
    body: "Leads the network security track: intrusion detection on live campus traffic, and the labelling work that makes any of it trainable.",
    line: "Leads the network security track and its detection work.",
    photos: [
      photo("nabila-a", 1200, 1500),
      photo("nabila-b", 900, 700),
      photo("nabila-c", 700, 700),
    ],
    experience: [
      { year: "2026", what: "Research lead, network security" },
      { year: "2025", what: "Co-author, IoT anomaly detection" },
      { year: "2024", what: "Research assistant" },
    ],
    enter: "right",
    exit: "up",
  },
  {
    id: "algof-zega",
    name: "Algof Kristian Zega",
    role: "Infrastructure",
    lead: "Everything in the lab that has an uptime number is his, and he will tell you the number without being asked.",
    body: "Owns the cluster, the storage, and the deployment path from a member's laptop to something the rest of the lab can actually run.",
    line: "Owns the cluster, the storage, and the deploy path.",
    photos: [
      photo("algof-a", 1200, 1500),
      photo("algof-b", 900, 700),
      photo("algof-c", 700, 700),
    ],
    experience: [
      { year: "2026", what: "Infrastructure lead" },
      { year: "2025", what: "Rebuilt the lab cluster" },
      { year: "2024", what: "Systems assistant" },
    ],
    enter: "behind",
    exit: "down",
  },
  {
    id: "arya-rexa",
    name: "Arya Rexa",
    role: "Digital Forensics",
    lead: "Reconstructs what happened from what was left behind, which in practice means reading logs long after everyone else has given up on them.",
    body: "Works on incident reconstruction and evidence-grade tooling — the unglamorous half of security, and the half that ends up in court.",
    line: "Reconstructs incidents from the logs everyone else gave up on.",
    photos: [
      photo("arya-a", 1200, 1500),
      photo("arya-b", 900, 700),
      photo("arya-c", 700, 700),
    ],
    experience: [
      { year: "2026", what: "Forensics track lead" },
      { year: "2025", what: "Incident response toolkit" },
      { year: "2024", what: "Research assistant" },
    ],
    enter: "left",
    exit: "back",
  },
  {
    id: "danish-chitato",
    name: "Danish Chitato",
    role: "Practicum Coordinator",
    line: "Runs the practicum every new member meets first.",
    lead: "",
    body: "",
    photos: [photo("danish-p", 800, 1000)],
    enter: "below",
    exit: "left",
    side: "left",
  },
  {
    id: "nanda-regon",
    name: "Nanda Regon",
    role: "Botnet Detection",
    line: "Finds coordinated hosts by how they behave, not what they send.",
    lead: "",
    body: "",
    photos: [photo("nanda-p", 800, 1000)],
    enter: "right",
    exit: "down",
    side: "center",
  },
  {
    id: "reza-indomie",
    name: "Reza Indomie",
    role: "Steganography",
    line: "Hides data in ordinary carriers, then proves it can be found.",
    lead: "",
    body: "",
    photos: [photo("reza-p", 800, 1000)],
    enter: "below",
    exit: "right",
    side: "right",
  },
  {
    id: "andra-juago",
    name: "Andra Juago",
    role: "Cloud Computing",
    line: "Works the cost side of running anything at scale.",
    lead: "",
    body: "",
    photos: [photo("andra-p", 800, 1000)],
    enter: "left",
    exit: "up",
    side: "left",
  },
  {
    id: "zuardi-yasfin",
    name: "Zuardi Yasfin",
    role: "IoT & Sensor Networks",
    line: "Low-power sensing, and the edge that has to survive it.",
    lead: "",
    body: "",
    photos: [photo("zuardi-p", 800, 1000)],
    enter: "behind",
    exit: "left",
    side: "right",
  },
  {
    id: "raynald-ambatukam",
    name: "Raynald Ambatukam",
    role: "Web & Interfaces",
    line: "Builds the front the rest of the lab's work is seen through.",
    lead: "",
    body: "",
    photos: [photo("raynald-p", 800, 1000)],
    enter: "right",
    exit: "down",
    side: "left",
  },
  {
    id: "uwais-achmad",
    name: "Uwais Achmad",
    role: "Distributed Systems",
    line: "Consensus, replication, and what happens when a node lies.",
    lead: "",
    body: "",
    photos: [photo("uwais-p", 800, 1000)],
    enter: "below",
    exit: "hold",
    side: "center",
  },
];

/** Every photograph the pinned sequence needs, for the preload gate. */
export const titlePhoto = photo("lab-title", 2400, 1400);
export const sequencePhotos = [titlePhoto, ...labPeople.flatMap((p) => p.photos)];

/* ── Timing, in screens ──────────────────────────────────────────────────
   One "screen" is one viewport height of scroll. Slots overlap: the outgoing
   person is still leaving as the next starts to arrive, so there is never an
   empty screen between two people. */

export const TITLE_SCREENS = 1;
export const CHAPTER_SCREENS = 1;
export const PASS_SCREENS = 0.45;
export const OUTRO_SCREENS = 0.55;

/** Share of a slot spent arriving, and spent leaving. Exits are faster. */
export const ENTER_FRAC = 0.45;
export const EXIT_FRAC = 0.28;

/** Share of a slot handed back to the previous person. */
const CHAPTER_OVERLAP = 0.25;
const PASS_OVERLAP = 0.45;

export interface Slot {
  start: number;
  end: number;
  span: number;
  /** Uwais does not leave — he settles and holds while the section closes. */
  holds: boolean;
}

export const slots: Slot[] = (() => {
  const out: Slot[] = [];
  let cursor = TITLE_SCREENS;
  labPeople.forEach((person, i) => {
    const chapter = i < FULL_CHAPTERS;
    const span = chapter ? CHAPTER_SCREENS : PASS_SCREENS;
    const start = cursor - span * (chapter ? CHAPTER_OVERLAP : PASS_OVERLAP);
    out.push({ start, end: start + span, span, holds: person.exit === "hold" });
    cursor = start + span;
  });
  return out;
})();

/** Scroll position at which a person is fully arrived. */
export const arrivalAt = (i: number) => slots[i].start + slots[i].span * ENTER_FRAC;

/** The headline finishes its travel exactly as the first person arrives. */
export const TITLE_END = arrivalAt(0);
/** The dark-to-light wipe, ending as the headline clears the left edge. */
export const FLIP_FROM = TITLE_END - 0.45;
export const FLIP_TO = TITLE_END;

export const TOTAL_SCREENS = slots[slots.length - 1].end + OUTRO_SCREENS;
/** The light panel gives way back to near-black over the closing stretch. */
export const OUTRO_FROM = TOTAL_SCREENS - OUTRO_SCREENS * 0.8;

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
/** Fast at the start, settling slowly. Nothing here travels at constant speed. */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const track = (v: number, from: number, to: number) =>
  clamp01((v - from) / (to - from));

/**
 * How far into arriving and how far into leaving a person is at scroll
 * position `s`, both 0..1. Pure functions of `s`, which is what makes
 * scrolling back up run the whole sequence cleanly in reverse.
 */
export function phases(s: number, i: number) {
  const slot = slots[i];
  const enter = clamp01((s - slot.start) / (slot.span * ENTER_FRAC));
  const exit = slot.holds
    ? 0
    : clamp01((s - (slot.end - slot.span * EXIT_FRAC)) / (slot.span * EXIT_FRAC));
  return { enter: easeOut(enter), exit: easeOut(exit) };
}

/**
 * The counter's position, 0..11, as a continuous value — the sum of how far
 * every person has arrived. It speeds up on its own through the second
 * movement, because the passes arrive three times as often.
 */
export function counterAt(s: number): number {
  let n = 0;
  for (let i = 0; i < slots.length; i++) {
    n += clamp01((s - slots[i].start) / (slots[i].span * ENTER_FRAC));
  }
  return n;
}

/** Where a person's tick sits on the progress rail, 0..1. */
export function railAt(i: number): number {
  const first = arrivalAt(0);
  const last = arrivalAt(labPeople.length - 1);
  return (arrivalAt(i) - first) / (last - first);
}

/** Travel offsets, as a fraction of the viewport. */
export const ENTER_VECTORS: Record<
  Enter,
  { x: number; y: number; scale: number; blur: number }
> = {
  below: { x: 0, y: 0.55, scale: 1, blur: 0 },
  right: { x: 0.72, y: 0, scale: 1, blur: 0 },
  left: { x: -0.72, y: 0, scale: 1, blur: 0 },
  behind: { x: 0, y: 0, scale: 0.84, blur: 14 },
};

export const EXIT_VECTORS: Record<
  Exit,
  { x: number; y: number; scale: number; blur: number }
> = {
  left: { x: -0.9, y: 0, scale: 1, blur: 0 },
  right: { x: 0.9, y: 0, scale: 1, blur: 0 },
  up: { x: 0, y: -0.8, scale: 1, blur: 0 },
  down: { x: 0, y: 0.9, scale: 1, blur: 0 },
  back: { x: 0, y: 0, scale: 0.86, blur: 12 },
  hold: { x: 0, y: 0, scale: 1, blur: 0 },
};
