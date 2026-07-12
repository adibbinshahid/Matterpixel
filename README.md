# Matterpixel — Agency Website

Production marketing site for Matterpixel, built with Next.js 15 (App
Router), React 19, TypeScript, and Tailwind CSS v4. Multipage site
(home, work, services, about, insights/blog, contact) sharing one
layout shell — nav, footer, smooth scroll, reveal system, and
route-to-route page transitions.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm run build      # runs the sitemap script, then production build
npm run start       # serve the production build
npm run lint
```

## Routes

| Route | Source | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Trimmed funnel: hero → proof strip → services → work → playground → process → stats → CTA. |
| `/work` | `app/work/page.tsx` | Filterable grid of demo builds (`components/WorkGrid.tsx`). |
| `/work/[slug]` | `app/work/[slug]/page.tsx` | Case study template (overview, approach, tech stack, highlights, gallery, related services, CTA). SSG via `generateStaticParams`. |
| `/services` | `app/services/page.tsx` | Overview of all 6 services. |
| `/services/[slug]` | `app/services/[slug]/page.tsx` | Service detail template (what's included, related demo builds, FAQ accordion, CTA). SSG. |
| `/about` | `app/about/page.tsx` | Founder credibility + founding-client offer. |
| `/insights` | `app/insights/page.tsx` | Blog index, cards from `content/posts/*.mdx`. |
| `/insights/[slug]` | `app/insights/[slug]/page.tsx` | MDX post template with TOC, share links, related posts. SSG. |
| `/contact` | `app/contact/page.tsx` | Renders `<CTA>` — contact form + "book a call" column. |
| `/*` (unmatched) | `app/not-found.tsx` | Custom 404 (`components/NotFoundScene.tsx`). |

## Content — edit these, not the page files

All copy and structured content lives in `content/`, not scattered
across components:

- **`content/siteConfig.ts`** — nav links, hero copy, proof strip,
  stats, founder bio/credentials, founding offer, footer, and
  `bookingUrl` (Calendly placeholder — see TODOs below).
- **`content/projects.ts`** — the 4 demo builds (`Project[]`). Add a
  new case study by appending an object here (slug, category, accent,
  summary, approach, techStack, highlights, `liveDemoUrl`,
  `relatedServiceSlugs`) — `/work` and `/work/[slug]` pick it up
  automatically, as does the sitemap.
- **`content/services.ts`** — the 6 services (`Service[]`), including
  each one's FAQ. Add a new service the same way; it'll appear on
  `/services` and get its own `/services/[slug]` page.
- **`content/posts/*.mdx`** — blog posts. Frontmatter: `title`,
  `excerpt`, `date`, `tag`. Add a new `.mdx` file here and it appears
  on `/insights` and gets its own route — no other wiring needed.
  Read via `lib/posts.ts` (`getAllPosts`, `getPostBySlug`, TOC
  extraction from `## ` headings).

There is no fabricated content anywhere on the site — no fake client
logos, no invented metrics, no fake testimonials. Proof points are
real (PageSpeed scores, load times, WCAG level) and every project
links to a live demo.

## Sitemap & robots.txt

`app/sitemap.ts` / `app/robots.ts` are **not used** — this repo's
absolute path contains an apostrophe, which corrupts Next's
`next-metadata-route-loader` codegen for those file-convention routes
(upstream Next.js bug, not fixable from userland). Instead,
`scripts/generate-sitemap.ts` reads `content/projects.ts`,
`content/services.ts`, and `lib/posts.ts` and writes
`public/sitemap.xml` / `public/robots.txt` directly. It runs
automatically via the `prebuild` npm script before every `next build`;
run `npm run sitemap` to regenerate it manually during development.

## Project structure

- `app/` — routes, root layout (nav/footer/route-transition shell,
  Organization JSON-LD), `api/contact` and `api/og` route handlers.
- `components/` — one file per section/template piece, plus shared
  systems (`FluidGradient`, `PixelResolve`, `Loader`,
  `SmoothScrollProvider`, `Reveal`, `RouteTransition`,
  `NotFoundScene`) and `components/ui/` for restyled Radix primitives
  (`Accordion` for service FAQs).
- `content/` — all site copy and structured content (see above).
- `lib/` — `posts.ts` (MDX reading/TOC), `schema.ts` (contact form Zod
  schema), reduced-motion/in-view hooks.
- `scripts/generate-sitemap.ts` — static sitemap/robots generator.
- `public/logo.png` / `public/mark.png` — brand assets (see below).

## Brand tokens

Colors, easing, and the font variable are defined once in `app/globals.css`
(`:root` custom properties + a Display-P3 `@supports` override) and exposed
to Tailwind via the `@theme inline` block. Change brand colors in exactly
one place: the `:root` block at the top of that file.

## Brand assets

- **`public/logo.png`** — master lockup (mark + wordmark), rendered via
  `<Logo>` (`components/Logo.tsx`) in the nav, mobile menu, and footer.
- **`public/mark.png`** — mark alone, rendered via `<MarkImg>`
  (`components/MarkImg.tsx`) in the hero visual and the playground's
  reduced-motion fallback.
- **`components/Loader.tsx`** draws the intro assembly animation from
  hand-coded `<div>` blocks (not the PNG) so each block can animate
  independently — the coordinates match `mark.png`'s layout. If the mark
  ever changes shape, update the `BLOCKS` array there too.
- **Work mockups:** `components/WorkMockup.tsx` is an original CSS device
  mockup (no third-party imagery). Replace with real product screenshots
  via `next/image` if/when available — keep using `<PixelResolve>` as the
  wrapper so the signature effect still applies.
- **OG image:** generated dynamically at `app/api/og/route.tsx` (edge
  runtime, `next/og`). Edit that file directly, no static asset needed.
- **Favicon:** `public/favicon.svg`.

## TODOs before launch

- **`content/siteConfig.ts` → `bookingUrl`** — placeholder Calendly URL,
  swap for the real scheduling link.
- **`content/siteConfig.ts` → `founder`** — placeholder name/photo
  comment, swap for the real founder's name, headshot, and bio.
- **`content/projects.ts` → `liveDemoUrl`** per project — placeholder
  URLs, point at the actual deployed demo builds.
- **Contact form email** — see below.

## Wiring the contact form email

`app/api/contact/route.ts` validates the payload with `contactSchema` and
currently only `console.log`s it — the send step is stubbed with a
`TODO(email)` comment. To go live, pick one:

- **Resend** (recommended): `npm install resend`, set `RESEND_API_KEY`,
  uncomment the example call in the route handler.
- **Nodemailer**: `npm install nodemailer`, configure SMTP transport env vars.

## Performance notes

- `LivingMark`, `PlaygroundCanvas`, and GSAP ScrollTrigger sequences are
  all `dynamic(..., { ssr: false })` and pause via `IntersectionObserver`
  when offscreen.
- Every animation respects `prefers-reduced-motion` — either via the
  global `MotionConfig reducedMotion="user"` (Framer Motion components) or
  explicit `useReducedMotion()` checks (GSAP/canvas pieces).
- `RouteTransition` (`components/RouteTransition.tsx`) animates via
  `clip-path`, not `filter`/`transform` — those create a new containing
  block for `position: fixed` descendants and break viewport-relative
  positioning (e.g. the nav). Keep any future transition work on
  `clip-path`/`opacity` for the same reason.
- All content routes (`/work/*`, `/services/*`, `/insights/*`) are
  statically generated via `generateStaticParams`.
- Run `npm run build` and check the route size table, then a Lighthouse
  pass (mobile, throttled) before shipping — budget is 90+ performance /
  95+ accessibility / 95+ best practices / 95+ SEO.

## Deploying

Deploy target is Vercel — `vercel.json` sets baseline security headers.
Push to a repo connected to Vercel, or run `vercel` from this directory.
