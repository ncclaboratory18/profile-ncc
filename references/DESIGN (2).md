---
version: beta
name: CharlesLeclerc-design-analysis
description: A chapter-structured documentary site that alternates between full-bleed dark photo/video moments and clean white editorial content sections — confirmed via screen recording, not just described secondhand from an agency case study this time. The rhythm is the real story here — dark cinematic beat, white editorial beat, dark quote-break beat, repeat — closer to a print magazine's pacing translated to scroll than to a continuous single-tone experience.
confidence: high on structure and rhythm (directly observed across the full recorded scroll); medium on exact color values (sampled from a compressed recording, not live CSS).

colors:
  canvas-light: "near-white/cream, warm-tinted"   # observed — editorial sections (bio, stats, gallery) sit on this, not a stark #ffffff
  canvas-dark: "#000000 to near-black"            # observed — hero video and quote-break sections
  accent-red: "Ferrari red, used sparingly"       # observed as small graphic elements (a vertical ribbon/bar, a badge) — not large fills; exact hex not reliably sampled from compressed video
  ink-on-light: "near-black"
  ink-on-dark: "#ffffff"
  note: "The light sections are warmer/creamier than pure white — closer to an off-white editorial paper tone than a stark white app background."

typography:
  display: "bold condensed grotesk with a dynamic/italicized lean, consistent with the bespoke 'Leclerc Sans' identity"
  note: "Headline weight is heavy and condensed enough to read as motorsport-branded rather than generic; body copy on the light sections is a plain, restrained serif-free text face, kept small and quiet next to the loud headlines."
---

## Motion & Animation System

- **Alternating light/dark section rhythm:** confirmed directly — the recording shows a full-bleed dark hero video, then a light editorial section (bio + stats), then a dark quote-break, then another light editorial section (karting-era gallery), then dark photo-gallery sections, repeating through to the footer. This alternation is the site's primary pacing device.
- **Persistent "CHAPTERS" dropdown nav:** visible at the top of every recorded frame regardless of scroll position — a fixed/sticky nav element, not something that hides on scroll.
- **Quote-break sections:** at least two distinct instances observed, each a single large line of text over a full-bleed dark photo, functioning as a breather beat between denser narrative sections — confirmed as a repeated pattern, not a one-off.
- **Stats-as-sidebar-card:** on the light "Driver" section, a compact card of numeric stats (career totals, birthdate, hometown) sits beside the bio text rather than below it — a side-by-side editorial layout, not a stacked one.
- **Small red graphic accents:** a vertical color bar/ribbon shape appears in at least one light section as a pure graphic accent next to a photo — red is used as a deliberate, small punctuation mark, not a background or button color.
- **Photo gallery grids:** multiple dark-background gallery sections show 2–3 images per row with generous gutters, captioned by location and year — consistent with the "documentary" framing rather than a dense tiled gallery.
- **Closing card grid:** the final pre-footer section shows four cards (each pairing a dark, color-tinted photo with an overlaid short label), a clean grid rather than another quote-break, giving the page a "menu of what's next" close before the footer.

## Layout & Structure (confirmed scroll order, home chapter)

1. **Hero** — full-bleed background video, large condensed headline, "Scroll to explore" prompt, small CTA button bottom-right, persistent CHAPTERS nav top-right.
2. **The Driver (light)** — bio copy + stats sidebar card + team/helmet/number showcase.
3. **Quote break (dark)** — single large line over full-bleed photo.
4. **Beginnings (light)** — karting-era narrative with side-by-side photos.
5. **Motorsport-era photo pairs (light/dark mix)** — portrait + action-shot pairings.
6. **Quote break (dark)** — second instance, confirming the pattern repeats.
7. **The World of Ferrari (light, with red graphic accent)** — narrative + photo + small red ribbon/bar element.
8. **Extended photo gallery (dark)** — multi-year, multi-location image set.
9. **Closing four-card grid (dark, tinted photos)** — a "life as a driver" menu.
10. **Footer** — wordmark, nav columns, legal links, agency credit.

## Components Worth Reusing

- **Light/dark alternation as pacing, not theme indecision:** the single most transferable idea here — deliberately switching canvas tone section-by-section to control pacing and give dense content room to breathe, rather than committing the whole site to one mode.
- **Stats-as-sidebar-card next to bio copy:** a cleaner alternative to stacking a stat block above or below a paragraph.
- **Small, punctuation-only accent color usage:** red appears as one ribbon/bar per section at most — worth this discipline when applying `--accent-blue` in your own system, per the "one accent, used sparingly" principle already in your v2 doc.

## Known Gaps

- Colors are visual impressions/sampled from a compressed recording, not extracted CSS — no confirmed hex values for the red accent or exact light-canvas tone.
- Only the home chapter's full scroll was recorded; the other four chapters (Beginnings, Motorsport, World of Ferrari, Life as a Driver as standalone chapter pages) likely repeat this rhythm but weren't independently re-verified frame-by-frame in this pass.
