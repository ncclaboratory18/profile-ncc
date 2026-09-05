# NCC Lab — Design Direction v3: Scrollytelling / Image-Heavy / Particle Background

**Builds on v2** (`ncc-lab-design-direction-v2.md`) — the color tokens and base motion system (entrance fades, hover states, hairline borders) stay exactly as they are; you confirmed the color is right. This doc escalates *structure, imagery density, and animation* — the part that currently reads as "lame and simple."

**Structural reference model:** [landonorris.com](https://landonorris.com/) — a single scrollable cinematic page: loader gate → full-bleed hero → horizontal photo rail with captions → big two-panel split navigation → hover-swap image grid → partner-logo row → social grid → closing statement. This maps cleanly onto NCC Lab's content.

---

## 0. Reference Model, Mapped

| landonorris.com section | What it does | NCC Lab equivalent |
|---|---|---|
| "Load Norris" gate | Brief branded loading animation before the site unlocks | "Loading NCC Lab" gate revealing the NC mark, then unlocking scroll |
| Full-bleed hero + "Next Race" pill | Big photo, name, one status pill | Full-bleed lab/event photo, "NCC Lab" + tagline, a pill like "Now recruiting — Gen 2026" |
| Horizontal photo rail (location + year captions) | Scroll-linked strip of moments | Lab moments strip: "Hackathon, 2025" / "Workshop, 2024" style captions, pulled from real event photos |
| Two-panel split nav ("On Track" / "Off Track") | Two huge clickable tiles, image reveals on hover | "Admins" / "Research Team" as two big tiles — this is your primary nav moment, not a small top navbar link |
| Hover-swap grid (Helmets Hall of Fame) | Grid where hovering a tile swaps base → highlight image | **Reuse your existing member card template directly here** — a "Members" or "Projects" grid where hover swaps a calm base image for the full glitch-card treatment |
| Partner logo row | Static logo strip | ITS / Informatics / lecturer-affiliation marks |
| Social image grid | Recent posts as a grid | Recent @ncclab_its Instagram grid, refreshed manually for now |
| Closing statement + footer flourish | Big line + contact + socials | Mission line + contact + Instagram/email |

---

## 1. Asset Placement — where your uploaded files go

| File | Where it's used | Folder |
|---|---|---|
| `logo_ncc_tanpa_nama` (NC mark) | Nav bar (persistent, small), loader gate (large, center), footer | `public/logo/ncc-mark.png` |
| `logo_tim_transparent` (padlock/network mark) | Research Team section header + Research Team card sub-badge | `public/logo/research-team-mark.png` |
| Card template (Admin/Researcher example) | This *is* the hover-swap grid's "highlight" state — base state can be a calmer, desaturated crop of the same photo | `public/members/{generation}/{id}-base.jpg` + `{id}-card.jpg` |

New folders to add to the structure from the implementation plan:

```
public/
├─ gallery/          ← hero + horizontal scroll-rail photography (real event/lab photos)
├─ social/           ← manual mirror of recent Instagram grid images
├─ members/{generation}/{id}-base.jpg, {id}-card.jpg
└─ logo/ncc-mark.png, research-team-mark.png
```

Until real event photos exist, use dark, moody tech/lab-adjacent placeholder photography in `gallery/` rather than leaving it empty — an empty hero is a bigger problem than a placeholder one.

**Reference folder:** once you send the zip, extract it into `reference/` at the project root (not `public/` — this is inspiration material, not shipped assets) and tell Claude Code to treat everything in it as additional style reference alongside `awesome-design-md-main`.

---

## 2. Particle / Background System

Scope it deliberately so it reads as atmosphere, not noise:
- **Hero:** the network/particle canvas from v2, now allowed to be a bit more present (opacity ~10–14% instead of 6–10%) since it's sitting behind a full-bleed photo with a dark overlay, not bare background.
- **Section transitions:** a thin particle/line layer can bridge between the photo rail and the split-nav section — brief, not persistent, disappears once the next section's content takes over.
- **Everywhere else** (roster grids, lecturer list, footer): stays calm, no particles — per the v2 "restraint" principle. Particles are a hero/transition device, not wallpaper.

---

## 3. Animation Techniques to Add (beyond v2's base system)

1. **Loader gate** — NC mark fades/draws in, brief hold, then wipes or fades to reveal the hero. 800ms–1.2s total, skippable on repeat visits (localStorage/session flag).
2. **Horizontal scroll-linked rail** — photos translate horizontally as the user scrolls vertically (GSAP ScrollTrigger `scrub`), captions fade in per-image as it centers in view.
3. **Split-tile hover reveal** — the Admins/Research Team tiles show a static state by default; on hover, a photo crossfades in behind the label (300ms).
4. **Hover-swap card grid** — base image → full card-template treatment on hover/focus, 200ms crossfade. This is the single biggest visual upgrade available, since the asset already exists.
5. **Logo marquee** — partner/lecturer logos scroll slowly, pause on hover.
6. **Scroll-triggered parallax** on hero photo (background moves slower than foreground text, subtle — 10–20% offset, not a full parallax scene).

All of this still respects `prefers-reduced-motion`: loader gate becomes instant, parallax/scroll-scrub becomes static, hover-swaps still work (hover isn't motion-sickness-triggering) but lose any scale/slide component.

---

## 4. Tell Claude Code to Search Local References First

Before building any of this, have Claude Code search `awesome-design-md-main` for entries matching:
- scrollytelling / cinematic scroll
- sports or athlete portfolio sites (structurally closest to landonorris.com)
- hover-swap or "reveal on hover" grid patterns
- horizontal scroll rail / scroll-linked gallery
- particle / canvas background

And once `reference/` exists, treat it as equal-priority source material — pull concrete pattern choices from both, not just one.

---

## 5. Prompt Block for Claude Code

> Escalate the NCC Lab site per `ncc-lab-design-direction-v3-scrollytelling.md`. Keep all color tokens and the base motion system from `ncc-lab-design-direction-v2.md` exactly as they are — the color was right, the structure was too plain.
>
> Load `awesome-design-md-main`, `web-design-guidelines`, and `taste-skill` from `.claude/skills`, and search `awesome-design-md-main` specifically for scrollytelling, cinematic-scroll, sports/athlete-portfolio, hover-swap grid, and particle-background reference entries. If a `reference/` folder exists at the project root, treat it as equally important source material.
>
> Restructure the Home page as a single scrollable cinematic experience modeled on landonorris.com's structure (see Section 0 of the v3 doc for the full section-by-section mapping): loader gate → full-bleed hero with a subtle particle canvas behind it → horizontal scroll-linked photo rail → a two-panel split nav for Admins/Research Team with hover image reveals → a hover-swap grid reusing the existing member card template as the "highlight" state → a partner-logo marquee → a social image grid → a closing statement.
>
> Use GSAP + ScrollTrigger for the scroll-linked rail and parallax, Framer Motion for discrete hover/entrance interactions, and respect `prefers-reduced-motion` throughout (static fallback for the loader, rail, and parallax; hover-swaps can remain).
>
> Build the hero + loader + photo rail first as a checkpoint, run it against `taste-skill`, then apply the same density of imagery and motion to the rest of the sections.

---

## 6. Open Item

The reference zip mentioned wasn't received on my end — only the three earlier files (both logos + the card template) are here. Once you upload it, I'll fold its specifics into this doc directly; in the meantime, Claude Code should still find plenty to work with in `awesome-design-md-main` per Section 4 above.
