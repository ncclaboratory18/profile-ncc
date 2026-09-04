# NCC Lab Website — Implementation Plan

**Subject:** Net-Centric Computing Laboratory (NCC Lab), Informatics Engineering, ITS Surabaya
**Format:** Multi-page website (not a static PDF/PPT) with clickable member cards, generation-based rosters, and a placeholder link-out to a separate lab-booking system.
**This document is the brief — not the design system.** Hand it directly to Claude Code locally, and before it writes a single component or line of CSS, it should load and apply three skills from `.claude/skills`: **`awesome-design-md-main`** (pattern references), **`web-design-guidelines`** (implementation rules), and **`taste-skill`** (aesthetic judgment/critique). I don't have access to those skills in this chat, so this document deliberately stays at the level of tokens, structure, and intent — the actual visual decisions should come from those skills, not from me guessing at what they contain.

---

## 1. Design System

> Treat everything below as a starting brief, not a final spec. Every color, type, and layout choice here should be validated against `awesome-design-md-main` and `taste-skill` during implementation — pulled through those skills, not copy-pasted as-is.

### Color — pulled directly from your uploaded files, not guessed

| Token | Hex | Source | Usage |
|---|---|---|---|
| `--bg-primary` | `#05070A` | NC logo dark fill | page background — near-black |
| `--bg-surface` | `#0A1236` | card template background | cards, nav bar, panels, alternating sections |
| `--accent-blue` | `#0E74BC` | NC logo mark | the only accent — links, active tab, buttons, hero glow, hover states |
| `--text-primary` | `#FFFFFF` | both logos | headings, primary text |
| `--text-secondary` | `#9FC7E4` | accent-blue blended into white | muted labels, captions, secondary/de-emphasized text |

No pink, no secondary accent — this is deliberately monochrome: black/navy background, one blue, white-to-steel-blue text. That's the "modern company profile" look (think enterprise tech sites: Cisco, NVIDIA dark-mode marketing pages) rather than the more playful glitch-card aesthetic. **Note:** your existing member card template uses a pink tag/glitch accent (`#FF3B83`) — recolor that to `--accent-blue` or `--text-secondary` when you build the card component, so it matches this palette instead of standing apart from it.

**Principle: one accent, used sparingly.** Everything defaults to black, navy, or white. `--accent-blue` at full saturation is reserved for things you can click or that are currently active — if it shows up on every heading or block, it stops signaling "interactive" and the site starts to feel busy instead of premium.

### Type
- **Display/headline:** a technical grotesk in the spirit of the card's glitch treatment (e.g. Space Grotesk, Chakra Petch, or Rajdhani) — reserved for the hero headline and member names on cards only.
- **Body:** a clean neutral sans (Inter or IBM Plex Sans) for everything else — descriptions, nav, lecturer bios. Keep line length under ~80 characters.
- Avoid defaulting to: all-caps labels on every section, an eyebrow tag above every heading, or 01/02/03 numbering unless the content is an actual sequence (a build-phase list qualifies; a features list doesn't).

### Layout concept
- **Home:** full-bleed lab photo/video as hero (dark overlay for contrast), NC mark + one-line mission statement over it. Content below in a calm single column — not stacked generic cards.
- **Admins / Research Team:** a horizontal rolling card carousel per generation. Generation is a tab/filter row above the carousel, using your existing card design as the card component itself — no new card style needed.
- **Detail page (click a card):** the card enlarged on one side, bio/contact/role history on the other — not a generic center-screen modal with a soft grey shadow.
- **Projects / Research:** documentation-style grid (image + title + short description) — reads like a portfolio/case-study log, not pricing-tier cards.

### Principles
1. The member card is the hero of the whole site — everything else should sit quietly around it, not compete with it.
2. Build hierarchy with tone, not new colors — `--bg-primary` vs. `--bg-surface` for depth, `--text-primary` vs. `--text-secondary` for emphasis, `--accent-blue` only for what's interactive.
3. Vary border-radius and elevation with intent — avoid the identical-rounded-card-with-soft-shadow look on every block regardless of hierarchy.

---

## 2. Information Architecture

| Route | Page |
|---|---|
| `/` | Home / landing (lab intro, photos, mission) |
| `/admins` | Admin roster, grouped by generation |
| `/admins/[id]` | Individual admin profile |
| `/research-team` | Research Team roster, grouped by generation |
| `/research-team/[id]` | Individual researcher profile |
| `/lecturers` | Lecturer list (from the ITS department page) |
| `/projects` | Project grid (placeholder content for now) |
| `/projects/[id]` | Project detail w/ images & documentation |
| `/research` | Research paper list (placeholder, optionally seeded from Prof. Tohari Ahmad's Scopus/Scholar) |
| `/booking` | Placeholder page → redirects/links out to the PC lab booking system |

**Open question for you:** is the padlock/network mark (`logo_tim`) specifically the **Research Team's** sub-logo, or a general "security" icon used elsewhere too? I've assumed the former per your note ("Research Team has their logo as well but it is still under NCC") — flag it if that's wrong.

---

## 3. Content / Data Model

Keeping data as plain structured files (JSON/TS) for the MVP means anyone on the team can add a new generation's members without touching component code.

```ts
// Shared by Admins and Research Team — same card, different "team" value
interface TeamMember {
  id: string;                 // slug, e.g. "danish-abqori"
  name: string;                // full name, e.g. "Muhammad Quthbi Danish Abqori"
  nickname?: string;           // "Danish" — the big glitch-title on the card
  team: "admin" | "research";
  role: string;                // "Admin", "Lead Researcher", etc.
  generation: string;          // batch/angkatan, e.g. "2024"
  major: string;               // "Informatics"
  nrp?: string;                 // student ID
  photo: string;
  email?: string;
  instagram?: string;
  bio?: string;                 // longer bio, detail page only
}

interface Lecturer {
  id: string;
  name: string;
  title: string;                // "Prof. Ir. Tohari Ahmad, S.Kom, MIT, Ph.D"
  role?: string;                 // "Head of Laboratory"
  email?: string;
  photo?: string;
  profileUrl?: string;           // ITS profile page
  scopusUrl?: string;
  scholarUrl?: string;
  sintaUrl?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  year?: string;
  images: string[];              // placeholder array for now
  status?: "ongoing" | "completed";
  members?: string[];            // TeamMember ids
  link?: string;
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: string;
  venue?: string;
  link?: string;                  // DOI / Scopus / Scholar
  abstract?: string;
}
```

---

## 4. Component Inventory

- `SiteNav` — tabs: Home / Admins / Research Team / Lecturers / Projects / Research / Book the Lab
- `Hero` — Home page banner
- `GenerationTabs` — filter control above a roster carousel
- `MemberCard` — your existing card design as a component; variants for admin vs. research (swap sub-logo), compact (carousel) vs. expanded (detail page)
- `MemberCardCarousel` — horizontal rolling row, scoped to one generation
- `MemberDetail` — profile layout for `/admins/[id]` and `/research-team/[id]`
- `LecturerCard` / `LecturerGrid`
- `ProjectCard` / `ProjectGrid`
- `PaperListItem` / `PaperList`
- `PlaceholderState` — for Projects/Research/Booking while real content is pending; should read as "content coming soon," not a broken page
- `BookingRedirectCTA` — the placeholder page's link-out button
- `Footer` — contact, Instagram, address

---

## 5. Page-by-Page Spec

**Home** — Hero (lab photo + mission line) → short "what we do" section (the expertise areas: Mobile Computing, Distributed Systems, Network Security, Multimedia Networks, Cloud Computing, Digital Forensics, Pervasive Computing) → quick links to the other tabs → footer. Real content available now (from the ITS page); just needs your lab photos.

**Admins** — `GenerationTabs` at top → `MemberCardCarousel` per selected generation → click a card → `/admins/[id]`. Needs: photos/data per generation.

**Research Team** — identical structure to Admins, but `team: "research"` and the padlock/network sub-logo shown alongside the NCC mark on cards/header.

**Lecturers** — simple grid/list, real data already gathered: Prof. Tohari Ahmad (Head), Hudan Studiawan, Prof. Ary Mazharuddin Shiddiqi, Bagus Jati Santoso, Moch. Nafkhan Alzamzami — each linking out to their Scopus/Scholar/Sinta profiles.

**Projects** — `ProjectGrid`, placeholder entries for now (title + "documentation coming soon" state), swap in real images/write-ups later.

**Research** — `PaperList`, placeholder for now; can be seeded with a starter list pulled from Prof. Tohari Ahmad's Scopus/Scholar page if you want a non-empty first version — say the word and I'll pull it.

**Book the Lab** — placeholder page: short explanation + `BookingRedirectCTA` linking out to wherever the actual booking system lives (URL TBD).

---

## 6. Tech Stack Recommendation

**Primary: Next.js (App Router) + TypeScript + Tailwind CSS**
File-based routing maps directly onto the route table above (`/admins/[id]` = a folder), built-in image optimization matters here since you'll have dozens of member photos across generations, and static export or Vercel hosting is free and simple for a student org site.

**Lighter alternative: Vite + React + React Router + Tailwind** — same component model, less framework "magic," a bit more manual setup for routing/images. Pick this if the team wants to avoid learning Next.js conventions.

Either way: bake the palette from Section 1 into `tailwind.config` as named colors (`bg-primary`, `bg-surface`, `accent-blue`, `text-secondary`) so nobody accidentally reaches for Tailwind's default slate/gray/blue instead of your actual brand — and follow `web-design-guidelines` for how that config and the component structure itself should be organized. This plan defines *what* the tokens are; `web-design-guidelines` defines *how* the codebase should enforce them.

---

## 7. Suggested Folder Structure

```
ncc-lab-site/
├─ app/
│  ├─ page.tsx                    → Home
│  ├─ admins/
│  │  ├─ page.tsx                  → roster
│  │  └─ [id]/page.tsx             → detail
│  ├─ research-team/
│  │  ├─ page.tsx
│  │  └─ [id]/page.tsx
│  ├─ lecturers/page.tsx
│  ├─ projects/
│  │  ├─ page.tsx
│  │  └─ [id]/page.tsx
│  ├─ research/page.tsx
│  └─ booking/page.tsx
├─ components/
│  ├─ nav/  cards/  roster/  layout/
├─ content/                        ← plain data files for the MVP
│  ├─ admins.json
│  ├─ research-team.json
│  ├─ lecturers.json
│  ├─ projects.json
│  └─ papers.json
├─ public/
│  ├─ logo/
│  │  ├─ ncc-mark.png
│  │  └─ research-team-mark.png    ← the padlock/network icon
│  └─ members/{generation}/{id}.jpg
└─ styles/tokens.css                ← palette as CSS variables
```

---

## 8. Build Phases

**Every phase below should close with a check against `awesome-design-md-main` (does this match a credible reference pattern, not a generic default?) and `taste-skill` (does this actually look good, not just technically correct?) before moving to the next phase.** Catching a generic-looking hero or an overused accent color at Phase 1 is cheap; catching it at Phase 7 means redoing the roster and detail pages too.

1. **Foundations** — scaffold repo, wire the palette into `tailwind.config`/CSS variables, build `SiteNav` + `Footer` + Home hero with real lab photos.
2. **Roster system** — build `MemberCard` + `GenerationTabs` + `MemberCardCarousel` once against real Admins data, then reuse for Research Team (swap logo + copy only).
3. **Detail pages** — `/admins/[id]`, `/research-team/[id]`.
4. **Lecturers** — real data already gathered above.
5. **Projects + Research** — placeholder content + intentional empty states.
6. **Booking** — placeholder page + redirect CTA.
7. **Polish** — responsive pass, keyboard focus, contrast check on the dark palette, reduced-motion respected.

---

## 9. Content Checklist — what's still needed from you

- [ ] Member photos + data (name, nickname, role, NRP, email, IG) per generation, for both Admins and Research Team
- [ ] Confirm: `logo_tim` = Research Team's sub-mark?
- [ ] Lecturer photos/short bios, if you want more than the official 5-person roster
- [ ] 2–3 real project write-ups + images (rest can stay placeholder)
- [ ] Research paper list — say the word if you want me to pull a starter set from Prof. Tohari Ahmad's Scopus/Scholar profile
- [ ] Booking system URL/embed target for the redirect

---

## 10. Handoff Note — mandatory skill usage in Claude Code

This plan intentionally stops short of writing application code or making final visual calls — that's the job of your three local skills, and Claude Code shouldn't skip them or treat them as optional polish at the end. When you start that build session, make each one's role explicit:

1. **`awesome-design-md-main` — read first, before anything else.** Use it to find concrete reference patterns for a dark, monochrome-blue "modern company profile" site: hero treatment, nav style, card layout, spacing rhythm. This plan sets the tokens and structure (Section 1); `awesome-design-md-main` supplies the actual pattern references so the result doesn't default to a generic dark SaaS template.
2. **`web-design-guidelines` — the implementation rulebook.** Load it alongside `awesome-design-md-main` and apply it to every component in Section 4, and to how the Section 1 tokens get wired into `tailwind.config`/CSS. It governs *how* the codebase is structured, not just *what* it looks like.
3. **`taste-skill` — a check at the end of every phase in Section 8, not once at the end of the whole build.** Its job is to catch what's technically correct but doesn't actually look good: generic spacing, a card that fights the hero, `accent-blue` overused until it stops reading as "interactive."

None of these three are "nice to have" — they're the actual design authority for this build. This document is the brief they work from, not a substitute for running them.
