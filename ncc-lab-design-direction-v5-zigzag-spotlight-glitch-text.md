# NCC Lab — Design Direction v5: Zigzag Spotlight, Glitch Text, "What We Do"

**Extends v2–v4, replaces nothing already built.** Admins' coverflow carousels, Research Team's card grid, and Lecturers' stacked hierarchy all stay exactly as speced. This doc adds one new Home-page section (a zigzag people spotlight), a site-wide glitch-text treatment, and a placement decision for "What We Do."

**Assumption flagged for confirmation:** placement of both new sections is proposed as Home-page content (see Section 1 and Section 3) rather than the Admins page — reasoning is in each section below. Say so if you'd rather it sit elsewhere.

---

## 0. References Used

| Reference | What it confirms |
|---|---|
| "Zigzag Layout" pattern (industry-standard term) | Alternating image-left/text-right, then image-right/text-left per row — the structural pattern you described. |
| "Expand OnHover List" / "Dim Inactive Menu Items on Hover" (real, current components) | The exact interaction you asked for: rows sit minimal/dimmed by default, the hovered row expands and brightens, and — this is the detail that makes it read as intentional rather than just a fade — the *other* rows dim further rather than staying neutral, so attention funnels to the one being hovered. |
| Glitch text (RGB-split + clip-path slicing) | Confirmed again from v4 — real, current, CSS-achievable technique, best used as a triggered moment, not a constant loop. |
| Sticky-scroll-stack numbered section pattern | The "What We Do" scroll behavior — items reveal one at a time, numbered, as the section scrolls. |

---

## 1. New Section: "Meet the Lab" Zigzag Spotlight

**Placement (proposed):** Home page, after the hero + photo rail, before the Admins/Research Team split-nav tiles. Reasoning: this becomes the "who we are" beat that earns the click into the full rosters — hero (what NCC Lab is) → spotlight (a few of the people) → split-nav (go meet everyone) → hover-swap grid. If you'd rather this replace part of the Admins page instead, that's an easy move — just say so.

**Content:** a short curated list (4–6 people) — not the full roster, which stays on the Admins/Research Team pages. Good candidates: the current Koor Lab, Prof. Tohari, one or two standout researchers.

**Layout:**
- Row 1: photo left, name/role/one-line text right.
- Row 2: photo right, text left.
- Alternates down the page, one person per row.

**Interaction — this is the part you specifically asked for:**
- **Default state:** the entire row (image *and* text together) sits desaturated/reduced-opacity — quiet, not competing with anything.
- **On hover or keyboard focus:** that row's image returns to full color with a slight scale-up (~1.03), the text reaches full opacity/brightness, and a thin `--accent-blue` underline or glow appears beneath the name.
- **Siblings actively dim further** while one row is hovered — not just "stay as they were," but recede a bit more — so the eye is pulled to the active row rather than free to wander.
- **Touch/mobile (no hover):** don't dim by default here — there's no hover gesture to reveal what's hidden, so render all rows at full brightness on touch devices instead of starting dim. This is a real fallback to build, not an edge case to skip.
- **Click** navigates to that person's existing profile page (from the original implementation plan's data model).

---

## 2. Glitch / Tech Text System (used with intent, not everywhere)

- **Technique:** RGB channel split (2–3 slightly offset color layers) plus horizontal clip-path slicing — CSS-achievable, no heavy library required.
- **Where it's used:**
  - The Home hero headline.
  - Each spotlight row's name — but **only on hover**, so the glitch becomes part of the same interaction from Section 1 rather than a separate constant animation.
  - Role tags on cards ("ADMIN" / "RESEARCHER" / "KOORDINATOR").
- **Where it's deliberately *not* used:** body copy, navigation, anything read repeatedly or quickly — glitch text is a moment, not a resting state. Continuous looping glitch on text people need to actually read hurts legibility and burns CPU/battery for no reason (ties back to the performance section in v4).
- **Reduced motion:** falls back to plain, static text — the glitch is decoration on top of real content, never the only way the content is conveyed.

---

## 3. "What We Do" — Placement Decision

**Proposed placement:** Home page, directly after the spotlight section (Section 1) and before the Admins/Research Team split-nav tiles. Full Home flow becomes: hero → photo rail → "Meet the Lab" spotlight → **What We Do** → split-nav tiles → hover-swap grid → footer. Grouping "who" and "what" together before sending visitors deeper into the site reads more naturally than splitting them across pages.

If you'd rather this live at the bottom of the Admins page instead (as a closing-context beat after seeing the people), that's a straightforward alternative — flag it and I'll adjust.

**Pattern:** sticky-scroll-stack, numbered 01–07 for the seven expertise areas already on record (Mobile Computing, Distributed Systems, Network Security, Multimedia Networks, Cloud Computing, Digital Forensics, Pervasive Computing) — each with a short title and one-line description, revealing one at a time as the section scrolls.

---

## 4. Prompt Block for Claude Code

> Implement `ncc-lab-design-direction-v5-zigzag-spotlight-glitch-text.md` on top of the existing v2–v4 direction. Nothing already built for Admins, Research Team, or Lecturers changes — this adds a new Home-page "Meet the Lab" zigzag spotlight section, a site-wide glitch-text treatment used with intent, and the "What We Do" scroll section.
>
> Before writing any code, load `awesome-design-md-main`, `web-design-guidelines`, and `taste-skill` from `.claude/skills` again. Specifically search `awesome-design-md-main` for reference entries on: zigzag/alternating image-text layouts, dim-inactive-siblings-on-hover list interactions, glitch/RGB-split text effects, and sticky-scroll-stack numbered sections. Cross-check the finished implementation against `taste-skill`, and follow `web-design-guidelines` for how the components should be structured in code.
>
> Build the "Meet the Lab" spotlight first: alternating left-right rows per person, each row desaturated/dimmed by default, reaching full color/brightness/scale only on hover or keyboard focus, with sibling rows dimming further rather than staying neutral while one is active. On touch devices, skip the dimmed default state entirely and render all rows at full brightness, since there's no hover to reveal them otherwise. Clicking a row navigates to that person's existing profile page.
>
> Then build the glitch-text system (CSS RGB-split + clip-path slicing) and apply it to the Home hero headline, to each spotlight row's name on hover only, and to card role tags — not as a continuous loop, and not on body copy or navigation. Respect `prefers-reduced-motion` by falling back to plain static text.
>
> Finally, build the "What We Do" sticky-scroll-stack section (seven numbered expertise areas), placed on the Home page between the spotlight section and the Admins/Research Team split-nav tiles.
