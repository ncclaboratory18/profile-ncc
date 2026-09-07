---
version: beta
name: TheodorusClarence-design-analysis
description: A correction as much as an update — the previous pass treated this as a confirmed light-mode site because of an explicit white theme-color meta tag, but the screen recording shows it running in dark mode, meaning the site supports both and the meta tag only sets the default/initial state. In dark mode it reads as a quiet, near-black personal hub with one muted accent color and a recurring script/cursive flourish used specifically for personality moments, distinct from its clean sans everywhere else.
confidence: high on structure and the light/dark-mode correction (directly observed); medium on exact hex values (sampled from a compressed recording).

colors:
  canvas-dark: "near-black, warmer/softer than pure #000000"   # observed in the recording
  canvas-light: "#ffffff"    # still confirmed from the earlier meta-tag read — the site's declared default
  accent-muted-green: "a desaturated teal-green"   # observed on section eyebrows ("Featured Posts", "The Blog" style labels) — not a bright/neon green, sits quietly against the dark canvas
  ink: "#ffffff on dark / near-black on light"
  note: "The real finding here is that this site is theme-aware (light + dark), not single-mode. Design docs based on a meta tag alone can miss this — worth remembering as a general lesson, not just for this site."

typography:
  note: "Two clearly distinct type voices: a clean, highly legible sans for nearly everything (nav, body, cards, dates), and a script/cursive face reserved specifically for short personality-forward phrases (a testimonial section header observed directly). The script face never appears in body copy or navigation — it's a deliberate accent, not a secondary body font."
---

## Motion & Animation System

- **Dual-mode theming:** confirmed directly by recording — this is a real light/dark-mode-aware site, correcting the previous single-mode assumption. Worth building your own site the same way if you want it to feel equally considered regardless of the visitor's OS preference.
- **Small decorative line-art near the hero:** a simple, minimal line-drawing illustration sits near the "hello world" greeting — low-key personality touch rather than a large hero graphic, consistent with the site's overall restraint.
- **Script accent for testimonial/personality moments:** a cursive/script treatment is used specifically for one short section header, contrasting deliberately against the clean sans used everywhere else — confirms the "one accent font, used narrowly" discipline also seen in this batch's color choices elsewhere.
- **Card-based content modules:** a small set of rounded, icon-labeled cards (topic/skill highlights) sits near the top of the page — compact, content-dense, and low-ornamentation compared to the cinematic hero treatments on the F1 sites.
- **Tabbed testimonial carousel:** confirmed via page structure — testimonials switch between categories with explicit prev/next controls, not a single auto-scrolling strip.
- **Photo-album masonry grid:** the album/photos section (observed in the recording) uses a dense, varied-aspect-ratio grid of travel/personal photography — a different rhythm from the otherwise text/card-heavy rest of the site, giving it room to feel personal rather than purely professional.
- **Resume-style experience timeline:** the about section lists roles with dates in a simple vertical list — plain and scannable, no heavy animation, consistent with the site's overall "content over spectacle" priority.

## Layout & Structure (confirmed scroll order, dark mode)

1. **Hero** — greeting + name headline + current-role credit + small line-art illustration + primary CTAs + social icons.
2. **Skill/topic cards** — a compact row of icon-labeled cards.
3. **Featured Posts** — section eyebrow in the muted accent color, post cards with thumbnail + date + short description.
4. **Yearly Retrospective** — 2–3 recent year entries plus a link to older ones.
5. **Featured Projects** — project cards with banner image, tool tags, and links.
6. **Testimonials** — tabbed carousel across relationship categories (colleague/reader/mentee-style groupings), with a script-font section header.
7. **Footer** — bio blurb, contact links, multi-column site-map-style link block, newsletter CTA.

*(Additional pages observed in the recording beyond the home scroll: a Blog index with post-list rows, a photo-album masonry grid, and an About page with a resume-style experience timeline — confirming the site is a genuine multi-page hub, not a single long-scroll homepage.)*

## Components Worth Reusing

- **Theme-awareness as a baseline expectation**, not an extra — the clearest lesson from the correction itself.
- **One narrow, deliberately "un-matching" accent font reserved for personality moments** — directly reusable for NCC Lab if you ever want a similar warm/human touch point distinct from the glitch-text system, without diluting either effect.
- **Photo-album masonry as a distinct rhythm from the rest of the site** — worth considering if the Lab ever wants an "events/moments" gallery that should feel different from the structured card grids elsewhere.

## Known Gaps

- Only the home page was fully re-verified via recording in this pass; the Blog/Projects/About pages were only briefly glimpsed and would benefit from their own dedicated pass if deeper detail is needed later.
- Exact hex for the muted accent green and the dark-mode canvas tone are visual impressions from a compressed recording, not extracted CSS.
