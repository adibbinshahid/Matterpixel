# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** owners and founders of small-to-mid businesses in Europe and the US, deciding whether to hand a website or AI build to an outside studio. Core sectors: Ecommerce & D2C, Beauty & Personal Care, Health & Wellness, Food & Hospitality, Professional Services. They arrive with a business problem (slow or dated site, leads waiting for replies, manual busywork, a brand that looks like everyone else), not a technical spec, and they are weighing risk: price, timeline, and whether the person on the other end will still be there after launch.

**Secondary:** agencies that need an overflow / white-label development partner — websites, web apps and AI automations under their brand, under NDA, with no client contact.

## Product Purpose

matterpixel.com is the studio's lead-generation site. It turns a visitor's problem into a scoped engagement: a free audit call, a package inquiry, or a custom quote. Success is a qualified inquiry or booked audit from a buyer who already understands what they'll get, roughly what it costs, and who will build it.

## Positioning

Founder-led, fixed price. The buyer deals with Md. Adib Bin Shahid directly from first call to launch, and the work is built with vetted specialists under his direction — no account managers, no bench. Every engagement has a fixed quote upfront, fast delivery, and the client owns everything that's built. Web and AI (sites, apps, business software, automation, AI visuals) under one accountable person.

## Operating Context

- Entry points into an engagement: free audit call (on-site scheduler, `BOOKING_URL` in `content/siteConfig.ts`), the inquiry wizard on /contact, package links (`/contact?package=…`), a priced stack (`/contact?stack=…`), a custom brief (`/contact?details=…`), and agency partnership (`/contact?tab=partner`). All pre-fill the same inquiry handler.
- Reply promise: within 12 hours, 7 days a week. "24/7" is only ever said of AI systems (bots running around the clock), never of human support.
- Founder is based in Dhaka (GMT+6) and works with clients globally; audit-call availability lives in `lib/availability.ts`.
- Visitors evaluate by clicking through: live concept builds with open admin panels and published Lighthouse runs.

## Capabilities and Constraints

- Services, in this order: Web & App Development, AI Automation, Business Software, Branding & Identity, AI Product Visuals & Video, SEO & Digital Marketing. Detail pages live under `/services/<slug>`; Business Software has no page yet and points to `/services/web-app-development#software`.
- Packages and stack pricing are defined once in `content/packages.ts` (Fast Site from $700, Lead Engine from $1,200, Ops Automation from $500, Brand & Visuals from $300; stack ranges per item). Engagement models in `content/engagementModels.ts`: Fixed-Scope Project from $300, matching the lowest package (founding-client pricing for the first 10 projects), Support and Growth $149/month with the first 6 months free on any build, Growth Partner monthly. Prices must stay consistent with the pitch deck.
- Performance is part of the pitch: the site itself must hold Lighthouse 90+ and CLS near 0, and every motion must respect `prefers-reduced-motion`.
- Stack: Next.js (App Router) + React + TypeScript, Tailwind, motion/GSAP/Lenis, deployed on Vercel.
- Open decisions: real social profiles (removed until they exist); an external scheduler may later replace the on-site one via `BOOKING_URL`; Business Software page.

## Brand Commitments

- Name written lowercase as the wordmark "matterpixel". Tagline "We build what matters. Down to the pixel." is kept for the footer and meta title only; the hero carries the outcome headline.
- Voice: plain, confident, specific; outcome-first; no inflated agency language.
- Honesty is a brand commitment: never claim a team, an assigned team, or 24/7 human support. Use "founder-led, built with vetted specialists".

## Evidence on Hand

- Verifiable: Fiverr Top Rated Seller; 4.9 rating and 150+ projects delivered (Adib's own track record); 7+ years of experience; founder portrait at `public/founder.webp`.
- Concept builds (self-set briefs, not client work — must be labelled "Concept build"): ShopSphere, MindWell, L'Cinco Pizza, Scentora, each live with an open admin and measured Lighthouse scores recorded in `content/projects.ts`. AI image/video sets with stated sources, including before/after frames in `public/projects/ai-product-photography/`.
- **Absent — do not fabricate:** client logos, testimonials, client case studies, client-outcome percentages, real client results. Before/after stats on packages are shown as "typical" outcomes only.

## Product Principles

1. Start from the buyer's problem, then show the package, the price and the proof — in that order.
2. Every claim is checkable: if it can't be linked, measured or verified, it doesn't ship.
3. Remove risk visibly: fixed quote, stated timeline, ownership, and a named person accountable.
4. The site is the proof — it must be as fast and well-made as what it sells.
5. One person answers. Copy and flows never imply a structure that isn't there.

## Accessibility & Inclusion

Fully keyboard-accessible interactive components, reduced-motion respected everywhere, mobile-first down to 375px, with no horizontal overflow at any width.
