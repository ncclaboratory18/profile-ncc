# NCC Lab — Design Direction v2: Techy, Restrained, Animated

**Supersedes:** Section 1 (Design System) of `ncc-lab-implementation-plan.md`. Everything else in that document — IA, data model, components, page specs, build phases, and the mandatory use of `awesome-design-md-main` / `web-design-guidelines` / `taste-skill` — still applies unchanged. This file only replaces the *color and motion* direction, per feedback: more modern, more animation, more techy, less "colorful blueish."

---

## 0. References (current, real, checked before writing this)

| Site | What to borrow |
|---|---|
| [Linear.app](https://linear.app) | Near-black canvas, hierarchy built from a ladder of surface elevations + white-opacity steps instead of new colors. One accent, used only where something is interactive. Hairline (1px, low-opacity white) borders instead of colored dividers. |
| [Vercel.com](https://vercel.com) | Even more restraint — color is stripped down until only structure remains. Good model for how sparse the accent should feel across Home/Lecturers/Projects. |
| [Ockom](https://webflow.com/website/Ockom-or-Enabling-a-Secure-Cyberspace) (cybersecurity studio site) | The atmospheric, "dive into the topic immediately" feeling — closer to your existing card template's mood. Use this as the reference for the Home hero and the network/particle background layer, not for the rest of the site (keep that Linear-restrained). |
| [Awwwards — Dark Mode collection](https://www.awwwards.com/awwwards/collections/dark-mode/) | Ongoing browsing reference while building — pull specific micro-interaction ideas as you go rather than treating any one site as the full spec. |

**The one-line takeaway:** build hierarchy through *luminance and motion*, not through more blue. Blue becomes rarer and more precise, not more prominent.

---

## 1. Updated Color System

| Token | Hex / Value | Role |
|---|---|---|
| `--canvas` | `#05070A` | Page background. Near-black, unchanged from v1. |
| `--surface-1` | `#0A1236` | First elevation — nav, cards, panels at rest. |
| `--surface-2` | `#272E4E` | Hover / elevated state (surface-1 lightened ~12%). |
| `--surface-3` | `#404662` | Active / pressed state (surface-1 lightened ~22%). |
| `--accent-blue` | `#0E74BC` | The *only* chromatic color. Brand mark, links, focus rings, active tab, one CTA per section — never decorative fill. |
| `--accent-blue-hover` | `#3289C6` | Accent on hover only. |
| `--text-primary` | `#FFFFFF` @ 100% | Headings, primary content. |
| `--text-secondary` | `#FFFFFF` @ 70% opacity | Body copy, descriptions. |
| `--text-tertiary` | `#FFFFFF` @ 45% opacity | Meta text — timestamps, labels, captions. |
| `--border-hairline` | `#FFFFFF` @ 8% opacity | All dividers/borders. Replaces any solid navy or blue border from v1. |

**What changed from v1:** the palette itself barely moved — `--canvas` and the blue are the same hex values as before. What changed is *usage*: text hierarchy now comes from white-opacity steps (Linear's technique) instead of a separate light-blue text color, borders are hairline-transparent instead of solid, and `--accent-blue` is reserved for interactive states only — it should never appear as a large fill or background block anywhere on the site.

**Card template note (carried over from v1, refined):** your existing member card uses a pink tag/glitch accent. Recolor it to `--accent-blue` as before, but keep the glitch/scan effect itself as a brief *white-flash* or thin chromatic-aberration line rather than a solid color swap — that reads as more "techy interface glitch" and less "colored sticker."

---

## 2. Motion System

Animation is structural here, not decorative — it's one of the two things (along with luminance) now doing the work color used to do.

### Entrance (on scroll into view)
- `opacity: 0 → 1`, `translateY: 12px → 0`
- Duration: 450ms, easing `cubic-bezier(0.16, 1, 0.3, 1)` (a soft "ease-out-expo" — the standard premium-site curve)
- Stagger: 60–80ms per sibling in a list/grid (nav items, card grids, roster carousels)

### Hover / interactive
- Border: `--border-hairline` → `--accent-blue` @ 40% opacity, 150ms ease
- Card: subtle scale `1 → 1.02`, 200ms ease
- Focus ring: `box-shadow: 0 0 0 3px rgba(14,116,188,0.35)` — accent-blue glow, not a hard outline

### Page / route transitions
- Crossfade 250ms between routes — no hard cuts, no slide transitions (those read as "app," not "site")

### Home hero — the one atmospheric moment
- A subtle animated network/particle canvas behind the hero content: nodes + connecting lines, `--accent-blue` only, opacity capped around 6–10%, slow drift (not attention-grabbing)
- This is the *only* place on the site that gets this treatment — keep every other page in the Linear-style restrained mode so the hero moment actually reads as special

### Non-negotiable
- Respect `prefers-reduced-motion`: disable translate/scale, keep opacity-only fades (or none) for users who request it

---

## 3. Suggested Libraries

- **Framer Motion** — entrance/hover/stagger animations at the component level, pairs cleanly with Next.js + React
- **GSAP + ScrollTrigger** — the hero network/particle canvas and any timeline-based sequences
- **Lenis** — smooth scroll, makes scroll-triggered entrance animations feel intentional rather than jumpy
- **tailwindcss-animate** — quick utility-level transitions for simple hover/focus states that don't need a full Framer Motion component

---

## 4. Prompt Block for Claude Code

Copy-paste this directly into your Claude Code session:

> Update the NCC Lab site's design direction per `ncc-lab-design-direction-v2.md` — this supersedes Section 1 of `ncc-lab-implementation-plan.md` only; everything else in that plan (IA, data model, components, phases) still applies.
>
> Load `awesome-design-md-main`, `web-design-guidelines`, and `taste-skill` from `.claude/skills` before making any changes. Use `awesome-design-md-main` specifically to find concrete pattern references matching Linear.app's and Vercel.com's restrained, luminance-based hierarchy (near-black canvas, hairline borders, one sparingly-used accent color) combined with Ockom's atmospheric "hacker-lab" feel on the Home hero only.
>
> Implement the color tokens and motion system exactly as specified in Section 1 and Section 2 of the v2 doc, using Framer Motion for component-level animation and GSAP/ScrollTrigger for the hero network-canvas background. Respect `prefers-reduced-motion` everywhere.
>
> Build the Home hero first as a checkpoint — run it against `taste-skill` before applying the same system to the roster, detail, and other pages.

---

## 5. Quick Diff vs. v1

| | v1 | v2 |
|---|---|---|
| Feel | "Modern company profile" (Cisco/NVIDIA marketing page) | Techy, restrained, dev-tool-adjacent (Linear/Vercel) with one atmospheric hero moment (Ockom) |
| Hierarchy | Surface color blocks | White-opacity luminance steps + hairline borders |
| Blue | Primary/structural accent, used broadly | Rare, precise, interactive-only |
| Motion | Not specified | First-class: entrance fades, stagger, hover states, page crossfade, hero particle canvas |
