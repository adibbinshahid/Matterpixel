# BUILD PROMPT — Matterpixel Agency Website

You are a senior front-end engineer + creative developer. Build a production-grade, award-worthy marketing website for a digital agency called **Matterpixel**. This is a portfolio/lead-gen site targeting European and American businesses. It must look and feel like the work of a top-tier studio (Awwwards Site of the Day tier), be extremely fast, and be fully responsive. Follow this brief exactly. Where a detail is unspecified, choose the most modern, tasteful option consistent with the direction below.

---

## 0. NON-NEGOTIABLES (read first)

1. **Theme:** LIGHT. Base surface is warm off-white, not stark white. Never a dark full-page theme. Bold saturated color is applied in accents, full-bleed section bands, type highlights, and interactions — the light base makes the color punch harder.
2. **Font:** `Inter Tight` for 100% of text — display, body, buttons, labels, everything. No other typeface. Load via `next/font/google`. Use weights 400 / 500 / 600 / 700 / 800.
3. **Animation:** Heavy, purposeful, buttery. Scroll-driven reveals, magnetic hovers, a custom cursor, a reactive pixel field, and the signature "pixelated → resolved" effect (see §5). Every animation must respect `prefers-reduced-motion` and never harm performance.
4. **Performance:** The agency SELLS 90+ Google PageSpeed / Core Web Vitals. The site MUST score 90+ mobile Lighthouse. This overrides any effect that would break it. Lazy-load heavy canvases, code-split, optimize images (next/image, AVIF/WebP), keep LCP < 2.5s, CLS < 0.1.
5. **Vibrant, bold, unusual.** Not another safe SaaS template. Break the grid, use oversized type, full-bleed color, and one genuinely memorable interaction. Aim for "how did they do that?"

---

## 1. BRAND SYSTEM

**Name:** Matterpixel
**Positioning line:** "We build what matters. Down to the pixel."
**Concept:** *matter* (substance, real business results) + *pixel* (the atomic unit of everything digital). Engineering meets craft. Two brand colors = two halves: blue is the engineering/precision, magenta is the creativity/energy.

**Colors** — implement each as a CSS custom property with sRGB value AND a Display-P3 override for wide-gamut screens:

```css
:root {
  --blue:      #2C4BFF;
  --magenta:   #FF2E93;
  --ink:       #16161C;   /* primary text */
  --ink-soft:  #3A3A42;   /* secondary text */
  --paper:     #FAF8F3;   /* base surface (warm off-white) */
  --paper-2:   #F2EFE8;   /* alt surface / cards */
  --line:      #E4E0D6;   /* hairline borders / grid lines */
}
@supports (color: color(display-p3 1 1 1)) {
  :root {
    --blue:    color(display-p3 0.20 0.29 1);
    --magenta: color(display-p3 1 0.18 0.58);
  }
}
```

Usage rule: exactly TWO brand colors + ink for text. Never introduce a third hue. Blue is primary/dominant; magenta is the accent that appears less often for maximum pop.

**Logo:** wordmark "matterpixel" (lowercase, Inter Tight 700/800) + a pixel-block "M" mark in blue+magenta. The letter `x` in "pixel" has a subtle custom infinity-crossing detail in the two brand colors. Provide an SVG placeholder for the mark; leave a clearly-labeled slot to drop in the final SVG asset.

---

## 2. TECH STACK (use current stable versions)

- **Framework:** Next.js 15 (App Router, Server Components where possible), React 19, TypeScript (strict).
- **Styling:** Tailwind CSS v4 (CSS-first config, `@theme`), CSS custom properties for the brand tokens above. No CSS-in-JS runtime.
- **Animation:** `motion` (Framer Motion v11+) as primary. Add **GSAP + ScrollTrigger** only for the complex scroll-pinned sequences (work section, process). **Lenis** for smooth scroll (integrate with ScrollTrigger).
- **Pixel field / hero canvas:** HTML5 `<canvas>` 2D (preferred for perf) OR `react-three-fiber` + `drei` if you can keep it under budget. Must degrade gracefully and be lazy-loaded/`dynamic()` with `ssr: false`.
- **UI primitives:** `shadcn/ui` (Radix under the hood) for accessible dialog, accordion, tabs where needed. Restyle to brand.
- **Icons:** `lucide-react`. Keep icon use minimal and custom-styled; prefer pixel-motif custom SVGs over stock icons for services.
- **Fonts:** `next/font/google` → Inter Tight.
- **Forms:** React Hook Form + Zod validation. Contact form posts to a Next.js Route Handler (stub the email send with a clearly-marked TODO for Resend/Nodemailer).
- **Deploy target:** Vercel. Include `vercel.json` if needed. Set up proper metadata, OG tags, favicon, sitemap, robots.
- **Quality:** ESLint + Prettier, TypeScript strict, semantic HTML, no console errors.

---

## 3. GLOBAL SYSTEMS

**Smooth scroll:** Lenis, wired to GSAP ScrollTrigger's ticker. Momentum feel, not janky. Disable on `prefers-reduced-motion`.

**Custom cursor:** a small square "pixel" cursor (blend-mode difference or brand-colored) that:
- follows the mouse with slight spring lag,
- grows / changes color on hover over links, buttons, and work cards,
- leaves a short fading pixel-trail.
Hidden on touch devices; native cursor restored. Respect reduced-motion (static or disabled).

**Reactive pixel field (background layer):** a faint grid of small squares across the hero (and optionally persisting subtly site-wide). Pixels near the cursor light up in blue/magenta and gently displace/scale, then settle. On the hero, the pixels are denser and arranged to imply the M shape. Lazy-loaded canvas; capped particle count; pause when offscreen (IntersectionObserver) and on reduced-motion.

**Visible design grid:** faint 1px grid lines (`--line`) subtly present behind content in a few sections to reinforce the "we build to the pixel / design canvas" idea. Very subtle — texture, not noise.

**Section reveal system:** every section's content animates in on scroll — staggered fades + upward translate + slight blur-to-sharp, orchestrated with Framer Motion `whileInView` / GSAP ScrollTrigger. Consistent easing (custom cubic-bezier, e.g. `[0.22, 1, 0.36, 1]`).

**Color-band rhythm:** the page alternates between the warm paper base and full-bleed saturated bands (blue or magenta) so the user is never on plain paper for too long. Each transition into a colored band is a moment — e.g. a pixel-wipe or clip-path reveal.

---

## 4. LOADING SCREEN

A brief (~1.2s, skippable on repeat visits via sessionStorage) intro:
- Paper background. Small pixels scatter in, then rush together and **assemble the Matterpixel M** in blue+magenta.
- The assembled M then scales/flies up into its nav position as the loader lifts (clip-path or mask wipe) to reveal the hero.
- Reduced-motion: instant fade, no animation.

---

## 5. SIGNATURE INTERACTION — "pixelated → resolved"

This is the site's defining move. Implement it as a reusable component `<PixelResolve>`:
- Any image/work-thumbnail starts **low-res / pixelated** (CSS `image-rendering: pixelated` + downscaled source or canvas mosaic + blur).
- On scroll-into-view (and/or on hover), it **resolves to crisp full quality** — pixels shrink/sharpen, blur clears, over ~600ms with the site easing.
- Use it on: hero visual, every work card, case-study headers.
- This literally animates the brand name. Make it smooth and premium, never gimmicky. Provide a shader-based premium variant if within perf budget; otherwise the CSS/canvas version.

---

## 6. TYPOGRAPHY

All Inter Tight. Tight tracking on display sizes.
- **Display / H1:** clamp() huge — up to ~7–9rem on desktop, bleeds toward edges, weight 700–800, letter-spacing -0.03em. Headlines are SHORT (4–7 words).
- **H2:** ~3–4rem, weight 700.
- **Body:** 1.0625–1.125rem, weight 400–500, `--ink-soft`, line-height 1.6. Keep copy short.
- **Labels / eyebrows / technical bits:** uppercase, small, letter-spacing +0.12em, weight 600, often in blue. Use monospace-style pixel labels sparingly (still Inter Tight, tabular) like `[ 01 ]`, `px`, coordinates — lean into the design-canvas language.
- Highlight key words inside headlines in blue or magenta (e.g. "…down to the **pixel**.").

---

## 7. VOICE / COPY

Punchy, claim-driven, lightly cocky. Lead with numbers and claims, never adjectives. Use this copy (edit lightly for fit):

- Hero H1: **"We build what matters. Down to the pixel."**
- Hero sub: "From consumer brands to complex platforms, we engineer digital experiences that scale, convert, and last."
- Section eyebrows: "what we do", "selected work", "how we build", "the proof".
- Sample claims: "+42% conversions for Meril in 90 days." · "90+ PageSpeed, guaranteed." · "Pretty is easy. Performance is the point."
- Final CTA: **"Got something that matters? Let's build it."**

---

## 8. PAGE STRUCTURE (single-page, section by section)

### NAV (sticky, glass-free)
Left: pixel-M mark + "matterpixel" wordmark. Center/right: Work, Services, About, Insights, Contact. Right: primary button "Start a Project" (blue fill, magenta on hover, magnetic hover effect + arrow). Nav shrinks/gains a subtle paper background + hairline on scroll. Animated underline/pixel-dot on active link. Mobile: full-screen animated menu (staggered items, pixel-wipe open).

### 1 — HERO (paper base)
- Reactive pixel field forming the M on the right / behind.
- Left: eyebrow "we build digital products that deliver", huge H1 with "pixel" highlighted, short sub, two CTAs ("See Our Work" solid, "How We Work" text+arrow).
- The M visual uses `<PixelResolve>` on load — assembles pixelated then sharpens.
- Subtle scattered blue/magenta pixel accents bleeding off the edges (density gradient: denser near M, sparse outward — never fully random).
- Scroll cue at bottom.

### 2 — PROOF STRIP (full-bleed BLUE band)
- Infinite marquee of real proof, white text on blue: "+42% Meril · 90+ PageSpeed · 4 national brands shipped · Next.js experts · 100% on-time". Slows/pauses on hover.

### 3 — TRUSTED BY (paper)
- "Trusted by leading brands" + logo row: **Meril, Square Toiletries Ltd, LAFZ, kool, WhitePlus** (mono/ink logos, subtle stagger-in, slight grayscale→color on hover). Use text/SVG placeholders labeled for real logos.

### 4 — WHAT WE DO / SERVICES (paper, with faint design grid)
- H2: "End-to-end digital, engineered for **growth**."
- Services as interactive **pixel-tiles** (NOT pastel icon cards). Each tile: custom pixel-motif graphic, title, one-line desc, "Explore" link. On hover the tile's pixel graphic resolves/animates + a brand-color sweep. Services: **Web & App Development, UI/UX & Product Design, Branding & Identity, AI Image / Product Photography, AI Video, SEO & Growth.** (6 tiles, responsive grid, asymmetric sizing allowed.)

### 5 — SELECTED WORK (full-bleed near-INK section for contrast — the ONE dark moment, used deliberately)
- This is the cinematic heart. H2: "Digital platforms. Real business impact."
- 3–4 featured case studies, each with a large `<PixelResolve>` device mockup (desktop + phone), pinned/parallax scroll reveal (GSAP ScrollTrigger). Numbered `[01] [02] [03]`.
- Projects: **Scentora** (luxury fragrance eCommerce), **MindWell** (mental wellness platform), **L'Cinco Pizza** (restaurant), **Sales Intelligence Dashboard** (enterprise). Each: name, category, one metric/result, "View Case Study →".
- Blue/magenta pixel accents bleed across the section edges.
- NOTE: do NOT use any third-party/branded IP imagery in mockups (no Nike/other logos) — placeholder or original only.

### 6 — PIXEL PLAYGROUND (full-bleed MAGENTA band) — the "wow / unusual" moment
- An interactive canvas: the visitor drags/paints brand-colored pixels on a grid; after a few strokes it **auto-completes into the Matterpixel M** (or a client product silhouette), then offers "Reset / Share". Playful, sticky, screenshot-worthy. Must be lightweight canvas, lazy-loaded, reduced-motion fallback = static graphic + caption.
- Copy: "We don't just talk pixels. Play with them."

### 7 — HOW WE BUILD / PROCESS (paper)
- 4 steps shown as a **pixel-by-pixel assembly** animation across a horizontal scroll or pinned sequence: Discover → Design → Build → Ship. Each step's icon assembles from pixels as it enters. Short copy per step. Reinforce systems/rigor.

### 8 — THE PROOF / TESTIMONIALS (full-bleed BLUE band)
- Real quotes on bold surface. Card carousel (accessible, keyboard + swipe). Attribution: "— Brand Manager, Meril", etc. Brand chips: Meril, Square, LAFZ, WhitePlus. Big pull-quote typography.

### 9 — STATS (paper)
- Animated count-up metrics on scroll-into-view: "50+ Projects · 30+ Happy Clients · 10+ Team · 98% Satisfaction". Numbers in blue/magenta, pixel-tick animation.

### 10 — FINAL CTA (full-bleed, hard BLUE→MAGENTA split or pixel-transition)
- Massive headline "Got something that matters? Let's build it." + contact block (email hello@matterpixel.com, location Dhaka / working globally) + the contact form (RHF + Zod). Magnetic submit button. Pixel-burst success animation on submit.

### FOOTER (paper, with pixel-grid texture)
- Mark + wordmark, nav links, socials (LinkedIn, Behance, X, Dribbble), copyright "© 2026 Matterpixel". Blue/magenta split accent line. Back-to-top with pixel animation.

---

## 9. ANIMATION INVENTORY (implement all)

1. Loader M-assembly + lift.
2. Custom pixel cursor + trail + hover states.
3. Hero reactive pixel field (cursor-responsive).
4. `<PixelResolve>` on hero + all work.
5. Scroll reveals (stagger + blur-to-sharp) site-wide.
6. Magnetic buttons + links (spring toward cursor).
7. Marquee proof strips (blue bands).
8. Pinned/parallax work section (ScrollTrigger).
9. Pixel-wipe / clip-path transitions into colored bands.
10. Service tile hover resolve + color sweep.
11. Pixel Playground interactive canvas.
12. Process pixel-assembly sequence.
13. Count-up stats.
14. Mobile menu pixel-wipe.
15. Contact success pixel-burst.

Global easing: `cubic-bezier(0.22, 1, 0.36, 1)`. Durations 0.4–0.8s. Nothing bouncy/cheesy. Everything reduced-motion-safe.

---

## 10. PERFORMANCE BUDGET (hard requirements)

- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- LCP < 2.5s, CLS < 0.1, INP < 200ms.
- next/image for all raster; AVIF/WebP; explicit width/height (no layout shift).
- `dynamic(() => …, { ssr:false })` for canvas/three components; load on idle or on-view.
- Cap particle counts; requestAnimationFrame throttling; pause offscreen.
- Preload Inter Tight; `font-display: swap`.
- Tree-shake; avoid loading GSAP where Framer Motion suffices.
- Test on mid-tier mobile, not just desktop.

---

## 11. ACCESSIBILITY

- Semantic landmarks, logical heading order, alt text on all imagery.
- Full keyboard nav; visible focus rings (brand-colored).
- Color contrast AA on all text (watch magenta/blue on light — use ink for body copy, reserve color for large/bold text and verify contrast).
- `prefers-reduced-motion`: disable/reduce every animation, keep content fully usable.
- ARIA on carousel, menu, dialog, form. Announce form errors.

---

## 12. RESPONSIVE

- Mobile-first. Breakpoints: 640 / 768 / 1024 / 1280 / 1536.
- Reflow multi-column sections to stacked; scale display type via clamp().
- Custom cursor + heavy pixel field: simplify or disable on mobile for perf; keep the brand feel via static pixel accents.
- Touch targets ≥ 44px. Test the playground + work section touch interactions.

---

## 13. DELIVERABLES / STRUCTURE

- Clean Next.js App Router project, TypeScript strict, componentized:
  `/app`, `/components` (Nav, Hero, PixelField, PixelResolve, Cursor, WorkSection, Playground, Process, Testimonials, Stats, CTA, Footer, ui/…), `/lib`, `/styles`, `/public`.
- Central `theme` (Tailwind v4 `@theme` + CSS tokens from §1).
- All copy/content in a single `content.ts` (or MDX) so it's editable in one place.
- Placeholder assets clearly labeled; real logo/work slots marked with `TODO`.
- README with setup, scripts, and where to drop final assets + wire the email send.
- No dead code, no console errors, passes lint/build.

---

## 14. ACCEPTANCE CRITERIA

The site is done when:
1. It reads as a bold, vibrant, LIGHT-themed award-tier agency site — not a template.
2. Inter Tight everywhere; brand colors correct (sRGB + P3); two-color discipline held.
3. All 15 animations present, smooth, and reduced-motion-safe.
4. The pixelated→resolved signature and the Pixel Playground both work and feel premium.
5. Lighthouse mobile ≥ 90 performance and all budgets in §10 met.
6. Fully responsive and accessible (AA), no console/build errors.
7. Real content wired (Matterpixel brand, real client names, real projects), asset slots ready.

Build it. Prioritize: (1) structure + tokens + Inter Tight, (2) hero + pixel field + PixelResolve, (3) work section, (4) remaining sections, (5) playground + polish, (6) performance pass. Ship clean, commented, production-ready code.
