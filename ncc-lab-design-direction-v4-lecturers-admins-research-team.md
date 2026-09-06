# NCC Lab — Design Direction v4: Lecturers / Admins / Research Team + Reduced-Motion Fix

**Scope of this doc, on purpose:** Lecturers, Admins, and Research Team pages only. Projects and Research are explicitly skipped for now. Everything from v2 (color tokens) and v3 (scrollytelling base, particle scoping, hero structure) still applies — this doc adds page-specific specs plus a fix for animations not running under reduced-motion/battery-saving conditions.

---

## 0. Nav Order Update

Supersedes the route order in Section 2 of `ncc-lab-implementation-plan.md`. New left-to-right order:

**Lecturers → Admins → Research Team → Projects → Research**

"Book the Lab" stays, positioned as before (last item / distinct CTA-styled nav entry, since it's an external redirect rather than a content page).

---

## 1. References Used in This Doc

| Reference | What it validates / supplies |
|---|---|
| Swiper.js `effect-coverflow` module (current, v14) | The actual 3D carousel engine — real, maintained, configurable `depth`, `rotate`, `scale`, `stretch`, `slideShadows`. This is what "carouselnya terlihat 3D" should be built on, not a custom from-scratch 3D transform system. |
| "Glow Hover Card" / "Glow Card Grid" (21st.dev, shadcn-compatible React components) | Cursor-tracked glow that lights up a card's border on hover across a grid — already built to respect `prefers-reduced-motion`. Exactly the "more glow" effect, adapted to single-hue accent-blue instead of the multi-color cycling some versions default to. |
| University "Faculty Card" / "People Card" patterns (ACC Arches, UNC Charlotte design systems) | Confirms hierarchy-via-cards-and-spacing (no connector lines) is a standard, real pattern for leadership/faculty pages — not a shortcut. |
| web.dev + Verdigris "Reduced Motion Guide" | The accessibility rationale (vestibular disorders, WCAG 2.1 AA) and — critically — the exact bug pattern to avoid (see Section 5). |
| Framer "3D Reel Carousel" / "Cover Flow Carousel" marketplace components | Confirms "scroll- and drag-driven 3D coverflow... reduced-motion friendly" is an established, expected combination, not a tradeoff you're inventing. |

---

## 2. Lecturers Page

**Background:** same hero-style image treatment as the landing page (full-bleed photo + dark overlay), carried through as this page's backdrop so it doesn't feel like a different site once you scroll past Home.

**Layout — hierarchy through stacking, not lines:**
- **Row 1 (top, centered):** Prof. Tohari Ahmad's card, rendered larger than the others (roughly 1.3–1.5x scale) with the `--accent-blue` glow-border treatment always-on (not just on hover) to mark him as Head of Lab.
- **Row 2 (below):** the remaining four lecturers (Hudan Studiawan, Prof. Ary Mazharuddin Shiddiqi, Bagus Jati Santoso, Moch. Nafkhan Alzamzami) in a single row/grid at standard card size.
- No SVG connector lines, no org-chart branches — the size difference plus vertical order communicates the hierarchy on its own.
- Apply the Glow Card Grid hover treatment to Row 2's cards; Prof. Tohari's card keeps its glow persistent rather than hover-triggered, since he's meant to read as fixed/anchoring, not interactive-on-discovery.
- Entry animation: Row 1 fades up first, Row 2 follows ~150ms later (not simultaneous) — a small sequencing detail that reinforces the hierarchy.

---

## 3. Admins Page

**Header:** "Our Admins" with the same top-of-page hero background treatment as the landing page (reduced height compared to the full Home hero — a banner-scale version, same photo treatment/overlay, not a second full hero).

**Body — one Swiper coverflow carousel per generation, stacked vertically:**

| Setting | Value | Why |
|---|---|---|
| Effect | `coverflow` | The real 3D-carousel module — matches "carouselnya terlihat 3D" |
| `depth` | ~120–150 | Enough Z-depth to read as 3D without distorting photos badly |
| `rotate` | ~15–25° | Cards angle away from center, classic coverflow look |
| `slideShadows` | `true` | Sells the depth |
| Autoplay | **off, or very slow** (5–6s/slide) if you want it to idle-advance | You explicitly said "tidak moving fastly per tick" — manual drag/swipe/arrow-click should be the primary interaction, not a fast auto-rotate |
| Transition duration | 700–900ms | Slow, deliberate glide between cards, not a snap |

**Order top-to-bottom on the page:** 2022 → 2023 → 2024 (oldest generation first, matching natural scroll-down-through-time reading order).

**Koor Lab (lab coordinator) card:** within each year's carousel, the coordinator's card gets a distinct treatment — larger size (like Prof. Tohari's on the Lecturers page), a persistent glow border, and a small "Koordinator" badge/ribbon. Recommend positioning them as that year's default-centered slide so they're the first thing in focus when the carousel enters view.

**Entry animation per year block:** fade-in-from-bottom as each year's section scrolls into view (`IntersectionObserver`-triggered), staggered so the section header appears first and the carousel follows ~100–150ms later. Each year's block animates independently — reaching 2023 shouldn't replay 2022's animation.

---

## 4. Research Team Page

**Layout:**
- Prof. Tohari's card at the top — same treatment as the Lecturers page (larger, persistent glow), for visual consistency across both pages he appears on.
- Below: a grid of research team member cards (research assistants), same "player card" style as Admins — big photo, big name, the existing card template's glitch-name treatment, recolored to the v2 palette.
- Apply Glow Card Grid hover to this grid, same as Admins.
- Research Team's own sub-logo (the padlock/network mark) appears in this page's header, alongside the main NC mark — not replacing it.
- No generation-based carousel is specified for Research Team in this pass — a straightforward grid is enough unless you want the same year-carousel treatment as Admins (say so if you do).

---

## 5. Fix: Animations Not Running Under Reduced-Motion / Power-Saving Conditions

There isn't one single "battery saver" signal browsers expose — some things map directly to a real, standard API; others don't exist as a detectable signal at all, so the fix there is to build defensively rather than to detect. Three real mechanisms, and what to do for each:

### A. OS-level "Reduce Motion" (`prefers-reduced-motion`) — this is real and standard
Every major OS exposes this (macOS Reduce Motion, Windows "Show animations," Android "Remove animations," iOS Reduce Motion), and it's a WCAG 2.1 AA requirement, not an edge case.

**The likely actual bug:** if an entrance animation is simply turned off under `prefers-reduced-motion` without also resetting the element's final state, anything that started at `opacity: 0` (common with `animation-fill-mode: both`) stays invisible forever — the animation that would have revealed it never runs, and nothing else sets it back to visible. This is very likely what's happening.

**Fix pattern:**
```css
/* Base: animated entrance */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 450ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Reduced-motion fallback: force the FINAL state explicitly */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-up {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```
Apply the same logic in JS-driven animation: Framer Motion exposes `useReducedMotion()` — check it and skip the animated `initial`/`animate` props (render at final state) rather than just skipping the transition. GSAP has no built-in check — gate every `ScrollTrigger`/timeline creation behind `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and render the final layout state directly when true.

### B. Data Saver mode — real, but a different API
`navigator.connection?.saveData` (Network Information API) reports whether the user has Data Saver on. When `true`: skip initializing the particle/network canvas entirely and use a static gradient or a single lightweight image instead, and skip autoplay on any video.

### C. Low-power / throttled devices — no reliable detection API, so degrade adaptively instead
There's no standard, privacy-safe "battery saver" flag exposed to JS anymore. Rather than trying to detect it, monitor actual performance and step down automatically:
- Track frame time on the particle canvas's `requestAnimationFrame` loop; if the rolling average drops below ~30fps for 2+ seconds, reduce particle count by half, and if it's still struggling, stop the canvas and fall back to a static frame.
- Pause any canvas/ScrollTrigger animation when its section isn't visible (`IntersectionObserver`) and when the tab isn't visible (`document.visibilityState`/`visibilitychange`) — this saves battery regardless of whether the device is in a power-saving mode, which is the actual goal.
- Cap canvas `devicePixelRatio` (e.g., max 1.5) rather than rendering at full device pixel ratio on every device.

### D. Give people a manual override too
Add a small "Reduce motion" toggle in the footer that forces the same code path as `prefers-reduced-motion: reduce`, for anyone whose OS setting isn't picked up correctly or who just wants it off regardless of OS state.

**Test by actually toggling the OS setting** (System Settings → Accessibility → Reduce Motion on macOS; equivalent on Windows/Android/iOS) rather than assuming the media query is wired up correctly — this is the step most likely to have been skipped.

---

## 6. Prompt Block for Claude Code

> Implement `ncc-lab-design-direction-v4-lecturers-admins-research-team.md`. Scope is Lecturers, Admins, and Research Team only — skip Projects and Research for this pass. Keep all color tokens (v2) and the scrollytelling/particle scoping rules (v3) unchanged.
>
> Load `awesome-design-md-main`, `web-design-guidelines`, and `taste-skill` from `.claude/skills`, and search `awesome-design-md-main` for reference entries on: faculty/leadership hierarchy pages, 3D coverflow carousels, glow/hover card grids, and reduced-motion fallback patterns. If `reference/` exists at the project root by now, treat it as equally important source material.
>
> Build the Lecturers page first: Prof. Tohari Ahmad as a larger, persistently-glowing card in row one, the other four lecturers below in a standard row — no connector lines, hierarchy communicated through size and vertical order only. Reuse the landing page's hero background treatment behind this whole page.
>
> Then build the Admins page: "Our Admins" header on a banner-scale version of the hero background, followed by three Swiper.js `effect-coverflow` carousels (2022, 2023, 2024, top to bottom), each with slow/deliberate transitions (no fast autoplay — manual drag/arrows as the primary interaction), and each generation's Koor Lab member rendered as a larger, glowing, centered card within that year's carousel. Each year's block should fade in from the bottom independently as it scrolls into view.
>
> Then build the Research Team page: Prof. Tohari's card at top (same treatment as Lecturers), a grid of research-assistant "player cards" below using the existing card template's big-photo/big-name treatment, with the Glow Card Grid hover effect applied. Include the Research Team's own sub-logo in the page header alongside the main NC mark.
>
> Finally, fix the reduced-motion/power-saving issue per Section 5: for every entrance animation, ensure the `prefers-reduced-motion: reduce` fallback explicitly resets `opacity: 1` and `transform: none` rather than only removing the animation — audit existing CSS/Framer Motion code for this specific gap first, since it's the most likely cause of animations "not working" in a motion-reduced browser. Add the `navigator.connection.saveData` check for the particle canvas, an FPS-based adaptive degrade loop, `IntersectionObserver`/`visibilitychange`-based pausing, and a manual "Reduce motion" footer toggle. Test by actually toggling the OS-level Reduce Motion setting, not just by reading the code.
