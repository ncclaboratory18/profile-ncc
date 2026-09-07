---
version: beta
name: Lixyon-33-design-analysis
description: A terminal/hacker-console personal portfolio built around a "boot sequence" conceit — confirmed via screen recording, not just page-text inference this time. The site opens on a literal loading percentage counter, resolves into a headline mixing italic-lime verbs with upright-white nouns, and closes on an oversized wordmark with a ghosted duplicate layer behind it. The footer's own credit line names the stack outright: GSAP × Lenis × SplitType — making this the highest-confidence reference in the batch.
confidence: high — colors below are pixel-sampled directly from your screen recording (2026-09-07_20-12-43.mp4), not inferred from text. Exact hex may drift slightly from the live site due to video/JPEG compression, but is far more reliable than the previous text-only pass.

colors:
  canvas: "#000000"        # sampled — true black, not dark-gray, across nearly every frame
  canvas-alt: "#0c0c0c"    # sampled — a slightly lifted near-black used on some panel backgrounds
  accent-lime: "#d2ff1c"   # sampled — the signature accent: progress counters, headline emphasis words, small case-file tags, the wipe-reveal block
  ink: "off-white, warm-tinted (not pure #ffffff)"  # observed, not precisely sampled — numerals and headlines read slightly warm/cream against the pure-black canvas
  note: "accent-lime is a real measured value from the recording. Canvas black is essentially pure. Treat 'ink' as a strong visual impression rather than a measured hex."

typography:
  note: "Confirmed bold condensed sans for display type, with an italic cut used specifically for emphasis words within a headline (e.g. one clause in italic-lime, the next clause upright-white in the same line) — a deliberate two-voice technique, not just bold-vs-regular. Monospace is reserved for telemetry/status text (build numbers, coordinates, uptime) rather than headlines."
---

## Motion & Animation System — now observed directly, not just inferred

- **Boot-sequence percentage counter:** the loader displays a large numeral + "%" that changes over the sequence (observed at both 54% and 99% at different points) — a GSAP-tweened number count is the standard way to build this, consistent with the confirmed GSAP stack.
- **Two-voice headline treatment:** in the hero headline, one clause renders in italic lime and the next in upright off-white, on the same visual line — e.g. an italic-lime verb phrase directly followed by an upright-white qualifier. This is a reusable typographic technique independent of any specific words: **italic + accent-color for the "active" verb, upright + neutral for the consequence/qualifier.**
- **Solid-color wipe reveal:** a section headline is observed mid-transition with a solid lime block still covering part of the text — strong evidence of a **block-wipe reveal** (a colored rectangle slides away to uncover the headline beneath), rather than a simple opacity fade. This reads as much more "deliberate/mechanical," fitting the terminal conceit better than a soft fade would.
- **Infinite marquee ticker:** confirmed at two separate points in the scroll (once near the hero, once near the footer) — a looping horizontal band of role/discipline labels, functioning as a rhythmic bookend for the whole page rather than a one-off decoration.
- **Numbered case-file cards:** each project card pairs a moody black-and-white photograph with a numbered label (01–04) and a small solid-lime tag block — observed across at least three distinct cards, confirming this is a systemized component, not a one-off.
- **Oversized wordmark with ghost layer:** near the footer/contact area, the full wordmark appears at a very large size with a second, fainter duplicate of the same text offset behind it — a cheap, high-impact parallax-style effect (two text layers scrolling at slightly different rates, or one static and one animated).
- **Terminal-style contact form:** the contact section shows a status line and channel list styled like a connection log, consistent with the "handshake script" framing from the page's own text content.

## Layout & Structure (confirmed scroll order)

1. **Boot sequence** — loading percentage counter over pure black.
2. **Hero** — two-voice headline (italic-lime + upright-white), marquee ticker band beneath.
3. **Identity/stats** — numeric stat counters in a row.
4. **Arsenal** — "THREE DISCIPLINES." section header with a lime accent block.
5. **Fieldwork** — numbered case-file cards (moody B&W photography + lime tag + title), at least four observed.
6. **Uplink** — "ESTABLISH CONNECTION." headline (same two-voice treatment), terminal-styled contact form with channel/status list.
7. **Footer** — oversized wordmark with ghosted duplicate layer, closing marquee ticker.

## Components Worth Reusing

- **Two-voice headline (italic-accent + upright-neutral)** — a lightweight, high-impact technique to lift any headline without adding a new color or a new font family.
- **Block-wipe text reveal** — more mechanical/deliberate than a fade, fits a "security/terminal" identity noticeably better; directly applicable to your own card role-tags or section headers.
- **Numbered case-file card** — B&W photo + number + lime tag + short title, a clean template for your (currently deferred) Projects page.
- **Ghost-layer wordmark** — cheap two-layer text effect for a closing/footer moment.

## Known Gaps

- Colors are sampled from a compressed screen recording, not live devtools — treat `accent-lime` as very reliable and the rest as strong visual impressions.
- Exact easing curves, durations, and whether the wipe/counter effects use GSAP `ScrollTrigger` specifically (vs. plain scroll listeners) are inferred from effect and the confirmed library stack, not observed in source code.
