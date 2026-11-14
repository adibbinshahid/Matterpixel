---
name: Matterpixel
description: Founder-led web and AI studio. Built pixel by pixel.
colors:
  brand-blue: "#2C4BFF"
  brand-magenta: "#FF2E93"
  blue-ink: "#8F9DFF"
  night-ground: "#0A0B10"
  night-raised: "#12131A"
  night-line: "#22232D"
  night-text: "#F3F2EE"
  night-text-soft: "#A9A8B3"
  paper: "#FAF8F3"
  paper-raised: "#F2EFE8"
  paper-line: "#E4E0D6"
  ink: "#16161C"
  ink-soft: "#4A4A52"
  score-green: "#0CCE6B"
typography:
  display:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.3rem + 3vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  closing:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 4vw, 5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.6vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.16em"
  numeral:
    fontFamily: "Avenir Heavy, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "\"tnum\""
  button:
    fontFamily: "Avenir Heavy, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.15
rounded:
  pixel: "0px"
  sm: "8px"
  md: "16px"
  panel: "28px"
  full: "9999px"
spacing:
  gutter-mobile: "24px"
  gutter-desktop: "32px"
  container: "1200px"
  section-mobile: "72px"
  section-desktop: "120px"
components:
  button-primary:
    textColor: "#FFFFFF"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-secondary-dark:
    backgroundColor: "rgba(255,255,255,0.10)"
    textColor: "#FFFFFF"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-secondary-light:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-secondary-light-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  chip-choice:
    backgroundColor: "rgba(255,255,255,0.03)"
    textColor: "{colors.night-text-soft}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  chip-choice-selected:
    backgroundColor: "{colors.brand-blue}"
    textColor: "#FFFFFF"
  card:
    backgroundColor: "{colors.night-ground}"
    rounded: "{rounded.md}"
    padding: "20px"
  panel:
    backgroundColor: "{colors.night-raised}"
    rounded: "{rounded.panel}"
    padding: "40px"
---

# Design System: Matterpixel

## Overview

**Creative North Star: "Built Pixel by Pixel"**

The site is a near-black workshop floor where finished work assembles out of square brand-coloured blocks. Everything rests on a deep ground (#0A0B10) under a hairline drafting grid (64px cells, 1px white lines at 5.5% opacity, vignetted toward the edges) that glides slowly left-to-right on a shallow ~12° rise (9px/s, swaying ±6°, never vertical, sub-pixel smooth) and lags the scroll at 0.25× for parallax; one fixed layer behind every dark section, still under reduced motion. The two brand colours from the Matterpixel M, electric blue and hot magenta, never paint a band. They show up as light (blurred pools behind the proof), as edges (gradient hairlines and borders), and as pixel blocks (the eyebrow dot, the light edge, the closing M). The page reads as one dark field broken by three warm-paper beats (Founder, Engagement models, FAQ).

Density is editorial rather than dashboard: one 1200px container, generous 120px section rhythm on desktop, left-aligned sentence-case headings, and proof (real builds in browser frames, measured Lighthouse scores) carrying the visual weight in place of illustration. Motion is the signature. Pixel blocks assemble the signature moments (the hero build, the stack pixels, the closing M); a blue→magenta light edge carries the transitions (section seams, the package sweep); and every entrance settles on one expo curve, so the page has a single motion language and no animation library cost.

**Key Characteristics:**
- Dark ground under the drifting parallax grid; three light beats on the homepage (Founder, Engagement models, FAQ), placed where the page turns from showing to reading or deciding; /services adds Build your stack.
- Brand colour as light, edge and pixel, never as a fill.
- One heading pattern: a magenta pixel and an uppercase eyebrow above a left-aligned H2.
- Inter Tight for words, Avenir Heavy for buttons and numerals.
- Pixel-block motion grammar with a static fallback for every effect.

## Colors

A near-black ground lit by two saturated brand colours, plus a warm paper for its light beats.

### Primary
- **Electric Blue** (brand-blue): the build colour. Pixel blocks, the hero's blurred light pool, gradient edges, the selected chip and selected stack card, and half of the primary button's gradient. Raw blue sits at about 3.2:1 on the night ground, so on dark it is only used at display size or as a non-text element.
- **Periwinkle Ink** (blue-ink): blue lifted for text and small marks on dark (checkmarks, hover borders, small accents). Inside a light beat the same role reverts to Electric Blue.

### Secondary
- **Hot Magenta** (brand-magenta): the marker colour. The square pixel before every eyebrow, the "Most popular" tag, bundle highlights, the second blurred light pool, the other half of the primary gradient, and the dark-section text selection.

### Tertiary
- **Lighthouse Green** (score-green): functional only. Lighthouse performance numerals and score rings, matching the colour the audit tool itself uses. Never decorative.

### Neutral
- **Night Ground** (night-ground): the page background, seen through the drifting grid.
- **Night Raised** (night-raised): raised surfaces on dark, such as the score badge, panels and the stack summary.
- **Night Line** (night-line): hairline borders and dividers on dark.
- **Bone Text** (night-text): headings and primary text on dark.
- **Ash Text** (night-text-soft): eyebrows, ledes and secondary copy on dark.
- **Warm Paper** (paper) / **Paper Raised** (paper-raised) / **Paper Line** (paper-line): ground, raised surface and hairline inside the light beats.
- **Ink** (ink) / **Ink Soft** (ink-soft): text on paper.

### Named Rules
**The Light, Edge and Pixel Rule.** Blue and magenta appear as blurred light pools (blur 120 to 140px at 15 to 25% alpha), 1px gradient edges, or square blocks. A section, band or full-width panel is never filled with either. Small solid fills are allowed only on interactive state (a selected chip, a selected card's icon) and on the primary button.

**The Two Beats Rule.** The page is dark by default. A section flips to Warm Paper only where the page turns from showing to reading or deciding: on the homepage the Founder strip, Engagement models and FAQ; on /services, Build your stack. Never strict alternation. Light sections are plain Warm Paper with no grid: the grid belongs to the dark ground. Light sections re-scope the same tokens, so components never carry a light/dark variant of their own.

**The Lifted Blue Rule.** Blue text on dark uses Periwinkle Ink, never raw Electric Blue, except at display size.

## Typography

**Display Font:** Inter Tight (with ui-sans-serif, system-ui)
**Body Font:** Inter Tight
**Label/Mono Font:** Avenir Heavy for button labels and numerals

**Character:** Inter Tight's compressed, slightly negative-tracked bold gives headings density without shouting; Avenir Heavy's round geometric numerals make prices and scores read as objects, separate from prose.

### Hierarchy
- **Display** (700, clamp 2.25rem to 3.75rem, 1.06, tracking -0.03em): the hero H1 only. One or two words may take a brand colour.
- **Closing** (700, clamp 2.5rem to 5rem, 1.02, tracking -0.035em): the final call-to-action line, the one heading allowed to be larger than the H1.
- **Headline** (700, clamp 2rem to 3.25rem, 1.06, tracking -0.025em): every section H2, sentence case, left-aligned, text-wrap balanced, max width about 48rem.
- **Title** (700, 1.25rem, tight tracking): card and model H3s. H3s carry no eyebrow or kicker.
- **Body** (400, 1rem mobile to 1.125rem from 640px, relaxed leading): ledes and copy, capped at 62ch for section ledes and 34 to 40ch beside headings.
- **Label** (600, 0.75rem, tracking 0.16em, uppercase): the section eyebrow, always led by a 6px square magenta pixel at a 10px gap.
- **Numeral** (Avenir Heavy, 1.25 to 2.25rem, leading 1, tabular figures): prices, stats and Lighthouse scores.

### Named Rules
**The One Heading Rule.** Every section H2 sits under the eyebrow (magenta pixel plus uppercase label) in the Headline style. This eyebrow is a confirmed user decision for this site and applies to H2s only; nothing above an H3.

**The Two Voices Rule.** Inter Tight speaks; Avenir Heavy counts and acts. Avenir never sets a sentence, and Inter Tight never sets a price or a button label.

## Layout

One container: 1200px of content plus gutters of 24px (mobile) and 32px (640px and up). Sections pad 72px top and bottom on mobile and 120px from 1024px. The closing call-to-action goes deeper (96px mobile, 144px desktop). Headings sit left-aligned at the top-left of their section and are never centred. The hero is a two-column split from 1024px (offer about 1.08fr, proof 1fr), full viewport height, with the proof dropping below the actions on narrow screens. Grids beyond that are content-led: two-column FAQ (0.85fr sticky heading, 1.15fr answers), a staggered two-up builds grid where alternate cards drop 80px, and a sticky summary sidebar beside the stack grid that becomes a bottom sheet on mobile. The layout holds from 375px with no horizontal overflow.

## Elevation & Depth

Depth comes from light and dark shadow, not tonal stacks. On the night ground, shadows are deep, long and offset downward (large negative spread) so objects read as floating over the dark. A blue-tinted variant marks the proof and hover state. On raised panels, a blurred magenta or blue light pool behind the content provides atmosphere. Hard offset shadows are not part of this world.

### Shadow Vocabulary
- **Proof float** (`0 40px 90px -30px rgba(44,75,255,0.45)`): the hero browser frame at rest and concept cards on hover. Blue light under the work.
- **Card rest on dark** (`0 30px 70px -30px rgba(0,0,0,0.85)`): browser frames at rest.
- **Badge** (`0 18px 40px -16px rgba(0,0,0,0.7)`): floating score badge and small overlays.
- **Selected glow** (`0 10px 28px -10px rgba(44,75,255,0.8)`): the selected chip.
- **Primary hover** (`0 14px 30px -12px rgba(255,0,128,0.55)`): the primary button's magenta bloom on hover.

### Named Rules
**The Blue Light Under Work Rule.** Only real work (a browser frame holding a build) gets the blue-tinted float. Everything else uses neutral black shadow.

## Shapes

Two shape families coexist on purpose. Brand marks are hard squares with zero radius: the eyebrow pixel, the hero assembly tiles, the flying stack pixels, the pixel clusters around the founder portrait and the closing M (cells separated by a 12% gap). Containers are soft: 16px on cards, stat tiles and choice cards; 28px on large panels (custom quote, engagement models, white-label, package viewer); full pills on buttons, chips and tags. Borders are 1px hairlines in the line colour; a featured panel may swap its hairline for a blue-to-magenta gradient border.

## Components

### Buttons
Confident pills that lift on hover.
- **Shape:** full pill (9999px), 14px by 28px padding, Avenir Heavy 0.875rem.
- **Primary:** an animated blue-magenta-blue gradient (200% wide, shifting over 4s) with white label. The only conversion style; "Get a Free Audit" uses it everywhere. On a solid brand-coloured panel it inverts to a white pill with the panel's hue as label colour.
- **Hover / Focus:** lift 2px and scale 1.035 over 300ms on the site ease (cubic-bezier(0.22,1,0.36,1)); press settles to scale 1.01; primary adds a magenta bloom.
- **Secondary on dark:** translucent white glass (10% fill, 22% border, 14px backdrop blur), brightening to 18% and 50% on hover.
- **Secondary on paper:** 40% ink outline, inverting to solid ink on hover.
- **Small:** 10px by 20px, 0.8125rem, for nav-height actions.

### Chips
- **Style:** pill choice chips, 44px min height, hairline border with 3% white fill and Ash Text on dark.
- **State:** selected chips fill Electric Blue with white text and the selected glow; the "Concept build" tag is a bordered pill led by a magenta pixel.

### Cards / Containers
- **Corner Style:** 16px for cards, 28px for panels.
- **Background:** night-ground or night-raised on dark; paper on light, with a selected stack card tinting blue at 6% and gaining a 1px blue ring.
- **Shadow Strategy:** see Elevation; dark long shadows, blue float only on work.
- **Border:** 1px line hairline.
- **Internal Padding:** 20px cards, 32 to 40px panels.

### Navigation
A floating translucent bar: dark glass at rest (38% night, 28px blur, saturate 180%), denser (62%) once scrolled, and switching to a light glass theme whenever the content behind it is light. Links are Avenir labels with a translucent pill on hover and active.

### Section Entrance (signature)
Every homepage section stages its `data-reveal` elements below the fold and plays each one as it reaches the screen (lib/useReveal.ts); elements arriving together run in reading order, 90ms apart (capped at six steps), on cubic-bezier(0.16, 1, 0.3, 1).
- **Seam:** on sections with a top border, a 1px blue→magenta light (with a soft blue glow) draws across from the left and fades back to the hairline (1.4s).
- **Eyebrow:** lifts 10px (700ms).
- **Title:** rises 0.45em out of a mask that opens from below (1.05s).
- **Lede:** lifts 16px, blur 6px to sharp (900ms).
- **Block:** cards, grids and panels rise 40px from blur 8px, scale 0.985 and transparent (1s).
Staging is script-only and only for elements below the fold, so content is never hidden by default; animations are cancelled on finish, leaving no inline styles. Reduced motion: a 400ms fade.

### Pixel Motion Grammar (signature)
- **Hero assembly:** the real build's screenshot breaks into a 20-column tile grid; tiles fly up from below as solid brand blocks and resolve into the image (about 1.2s), then the Lighthouse score counts from 0 over 900ms. Hover replays it; it never loops. Reduced motion shows the finished mockup and score.
- **Package sweep:** choosing a package sweeps it in from the side of travel (right chip → from the right). The incoming panel is unmasked behind a moving edge (clip-path, 760ms, cubic-bezier(0.77, 0, 0.175, 1)); a 2px blue→magenta light line with a 160px trailing glow rides the boundary; the outgoing panel drifts 56px the other way, dimming to 15% and blurring 6px; each incoming element slides 44px in from the sweep side, from blur 3px, as the edge passes it (560ms expo-out). The chip pill slides on the same curve and length. All four panels share one grid cell, so the card never resizes. Reduced motion swaps instantly.
- **Flying stack pixels:** adding a stack item throws ten 6 to 12px blue and magenta squares in an arc into the summary over about 520 to 700ms. Skipped under reduced motion.
- **Closing M:** the Matterpixel mark, rasterised to a 30-column block grid, assembles from the left once in view (about 1.6s) and holds. Reduced motion draws the finished mark.
- **Score count:** concept card scores count up once on first view over 1.1s.

## Do's and Don'ts

### Do:
- **Do** set every page section on the night ground over the drifting grid (never a second texture on top), and flip to Warm Paper only for a working or reading beat.
- **Do** lead every section H2 with the magenta-pixel uppercase eyebrow (0.75rem, 0.16em tracking) and keep the H2 left-aligned, sentence case, in the Headline clamp.
- **Do** use Periwinkle Ink for blue text on dark.
- **Do** set prices, stats and scores in Avenir Heavy with tabular figures, and Lighthouse scores in Lighthouse Green.
- **Do** build new motion from the page's three materials (pixel blocks, the light edge, the expo settle) and ship a static or fade fallback under reduced motion.
- **Do** keep proof in browser frames with the blue float, and keep content visible without script.

### Don't:
- **Don't** fill a section, band or full-width panel with brand blue or magenta; use light pools, gradient edges and pixel blocks.
- **Don't** centre section headings or put an eyebrow or kicker above an H3.
- **Don't** introduce a second heading style for H2s or hand-set a new eyebrow treatment.
- **Don't** invent a second entrance style: section entrances go through `data-reveal` and lib/useReveal.ts.
- **Don't** round the pixel marks; squares stay square.
- **Don't** use raw Electric Blue for body-size text on dark.
