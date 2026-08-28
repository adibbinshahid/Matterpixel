/**
 * Selected builds — concept projects, not client work (Matterpixel is a new
 * studio; see siteConfig.workIntro for the honest framing shown on every page
 * these render on). Edit here to add/update a project.
 *
 * HONESTY RULES for this file — every one of these is load-bearing for the
 * whole Projects section, so read before editing:
 *
 *  1. `brief` is written as a self-set brief, never as "a client came to us".
 *     These are concept builds and the copy says so, on the card and on the
 *     case study page.
 *  2. Every entry in `features` must be something a visitor can verify by
 *     clicking `liveDemoUrl` themselves. No aspirational features.
 *  3. `lighthouse` and `fieldMetrics` are OUR OWN Lighthouse runs against the
 *     live demo, recorded with the exact tool version, preset, and date in
 *     `metricsMethod` so a prospect can re-run them. Never hand-write a
 *     score. Every build carries all four categories, including the ones
 *     that came back short — the row is only worth showing because it isn't
 *     curated. Scores are the MEDIAN OF THREE runs: a single desktop run
 *     swings 10+ points on performance depending on CDN warmth, so one run
 *     is not a number you can ask anyone to reproduce. To refresh:
 *       CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *       npx lighthouse@12 <url> --preset=desktop \
 *         --only-categories=performance,accessibility,best-practices,seo \
 *         --output=json --output-path=out.json --chrome-flags="--headless=new"
 *     ...three times per URL, then take the median of each category.
 *  4. `gallery` captions describe what is actually in the screenshot.
 *  5. Demo admin credentials are published by the demos themselves on their
 *     own login screens — nothing private is exposed here.
 */

/** Filter axis on /projects. Websites ship today; the AI lanes are the
 * studio's other two output types and fill in as work is posted. */
export type Medium = "website" | "ai-image" | "ai-video";

export const mediums: { id: Medium; label: string; empty: string }[] = [
  {
    id: "website",
    label: "Websites",
    empty: "No website builds published yet.",
  },
  {
    id: "ai-image",
    label: "AI Images",
    empty:
      "AI product and campaign imagery is being prepared for publication. In the meantime, see the AI Product Photography service page for how the work is produced.",
  },
  {
    id: "ai-video",
    label: "AI Videos",
    empty:
      "AI video work is being prepared for publication. In the meantime, see the AI Video service page for how the work is produced.",
  },
];

/** The four Lighthouse categories, 0-100, median of three desktop runs. */
export type LighthouseScores = {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
};

export type Project = {
  slug: string;
  name: string;
  medium: Medium;
  /** Sector line under the name — "Industry · Product type". */
  category: string;
  /** Single-word sector used by nothing but the card's corner tag. */
  sector: string;
  accent: "blue" | "magenta";
  oneLiner: string;
  /** Two-sentence card summary. */
  summary: string;
  /** The self-set brief this build answers. Never phrased as client work. */
  brief: string;
  /** The industry problem, stated as observed reality, not as a client quote. */
  problem: string;
  /** What was built in response, in build terms. */
  solution: string;
  /** Clickable-verifiable features. Every one exists on the live demo. */
  features: { title: string; body: string }[];
  /** Build decisions worth stating to a technical or semi-technical buyer. */
  decisions: { title: string; body: string }[];
  techStack: string[];
  /** Measured Lighthouse category scores — see honesty rule 3. All four,
   * always, so the gauge row is comparable across builds. */
  lighthouse: LighthouseScores;
  /** Field metrics captured in the same run, shown as supporting text
   * beside the gauges. Not scores — these are times and ratios. */
  fieldMetrics: { label: string; value: string; note: string }[];
  metricsMethod: string;
  liveDemoUrl: string;
  /** The back office a real owner would run the site from. */
  admin?: { url: string; user: string; pass: string; note: string };
  /** Card/hero screenshot. There used to be a `coverFull` beside it — the
   * tall full-page capture the grid card panned on hover — dropped with the
   * pan itself; see WorkGrid's ProjectCard for why the pan went. */
  cover: string;
  mobile: string;
  /** `url` overrides the address shown in the frame — set it when the shot
   * is not of the storefront (the admin capture, for one). */
  gallery: { src: string; caption: string; url?: string }[];
  relatedServiceSlugs: string[];
};

export const projects: Project[] = [
  {
    slug: "shopsphere",
    name: "ShopSphere",
    medium: "website",
    category: "Multi-Category Retail · eCommerce",
    sector: "Retail",
    accent: "blue",
    oneLiner: "A five-category storefront that stays fast while the catalogue grows.",
    summary:
      "Search, filters, deals with a live countdown, order tracking, and an analytics-grade admin. The general-store problem, solved without the general-store bloat.",
    brief:
      "Build the storefront a growing multi-category retailer needs before they can justify enterprise commerce: search and filtering that scale past a handful of products, a deals mechanism that creates urgency honestly, self-serve order tracking, and an admin that answers 'how is the shop doing' in one screen.",
    problem:
      "A shop selling one category can get away with a simple site. A shop selling five cannot — the customer needs to narrow before they can choose, and the owner needs to know which category is actually earning. The usual fix is a heavyweight platform with a theme, which brings a slow storefront, a plugin for every feature, and a monthly bill that scales faster than the revenue does.",
    solution:
      "ShopSphere is the lean version. Search, category chips, sorting, and filters all resolve client-side over a shared catalogue, so narrowing 12 or 1,200 products costs no page loads. Deals are their own surface with a live countdown and a daily flash pick. Order tracking is self-serve against an order number. And the admin is analytics-first — active visitors, revenue trend, category share, conversion funnel, and traffic sources on the landing screen, so the owner sees the shape of the business before they see a table.",
    features: [
      {
        title: "Search, chips, sort, and filters",
        body: "Five categories with instant search and sorting over one shared catalogue — narrowing never triggers a page load.",
      },
      {
        title: "Product pages with real inventory state",
        body: "Quantity stepper bounded by live stock, SKU and tags, ratings with review counts, and a related-products rail.",
      },
      {
        title: "Deals surface with live countdown",
        body: "A flash-sale banner counting down in real time, a daily flash pick, and a discounted sale grid — urgency from a real clock, not a fake one.",
      },
      {
        title: "Self-serve order tracking",
        body: "Order number plus email returns the order, its items, estimated delivery, and a timestamped timeline from placed to in transit.",
      },
      {
        title: "Analytics-first admin",
        body: "Active visitors, orders today, average rating, low stock, revenue trend, category share, conversion funnel, and traffic sources — before any table.",
      },
      {
        title: "Merchandising controls",
        body: "Products, coupons and deals, campaigns, hero carousel, and a customer mailbox, so the shop front can be re-merchandised without a deploy.",
      },
    ],
    decisions: [
      {
        title: "The lightest build here, by design",
        body: "The homepage lands in roughly 559 KB — under half of every other build in this collection — which is what puts largest paint at 0.5s and the performance score at 100.",
      },
      {
        title: "Filtering in the client, not the server",
        body: "One catalogue fetch backs search, chips, sort, and filters. Narrowing is instant and stays instant as the catalogue grows.",
      },
      {
        title: "Countdowns tied to a real deadline",
        body: "The flash-sale timer counts to an actual end time rather than resetting on every visit — the pattern most storefronts abuse and customers have learned to ignore.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Client-side search", "Analytics dashboard"],
    lighthouse: {
      performance: 100,
      accessibility: 99,
      bestPractices: 100,
      seo: 100,
    },
    fieldMetrics: [
      { label: "Largest paint", value: "0.5s", note: "LCP, desktop" },
      { label: "Layout shift", value: "0", note: "CLS, desktop" },
    ],
    metricsMethod:
      "Lighthouse 12.8.2, desktop preset, run against the live demo on 28 August 2026. Each category is the median of three runs, because a single desktop run swings by ten points or more depending on how warm the CDN edge is. Re-runnable by anyone — the URL is public.",
    liveDemoUrl: "https://shopsphere.matterpixel.com",
    admin: {
      url: "https://shopsphere.matterpixel.com/admin",
      user: "admin",
      pass: "admin",
      note: "Demo credentials are pre-filled on the panel's own sign-in screen.",
    },
    cover: "/projects/shopsphere/hero.webp",
    mobile: "/projects/shopsphere/mobile.webp",
    gallery: [
      {
        src: "/projects/shopsphere/shop.webp",
        caption: "Catalogue with search, category chips, sorting, and filters resolving client-side.",
      },
      {
        src: "/projects/shopsphere/product.webp",
        caption: "Product page — stock-bounded quantity stepper, SKU and tags, ratings with review counts.",
      },
      {
        src: "/projects/shopsphere/tracking.webp",
        caption: "Self-serve tracking — a demo order number returns its timestamped delivery timeline.",
      },
      {
        src: "/projects/shopsphere/admin.webp",
        url: "https://shopsphere.matterpixel.com/admin",
        caption: "Analytics-first admin — revenue trend, category share, conversion funnel, and traffic sources.",
      },
    ],
    relatedServiceSlugs: ["web-app-development", "seo-growth", "ai-automation"],
  },
  {
    slug: "mindwell",
    name: "MindWell",
    medium: "website",
    category: "Mental Healthcare · Clinic Platform",
    sector: "Healthcare",
    accent: "magenta",
    oneLiner: "A psychiatry clinic site where the person in crisis is never more than one line away from help.",
    summary:
      "A full clinic platform — specialists, services, a four-step booking flow, intake paperwork, and a staff portal. Designed so the most urgent need is served before the marketing is.",
    brief:
      "Build what a multi-clinician psychiatry and psychology practice actually needs online: a way to choose a clinician and book without phoning, paperwork done before the first visit, insurance and fees answered up front, and a staff-side portal for bookings and slots.",
    problem:
      "Clinic websites are usually built as brochures and then asked to do operations work they were never designed for. Booking is a phone number. Fees are 'contact us'. Intake forms arrive as an email attachment the day before. And the visitor in genuine distress — statistically a real share of the traffic on a mental health site — has to scroll past a hero and three service cards before finding a number that helps them tonight.",
    solution:
      "MindWell inverts that order. A crisis line sits above the navigation on every page, before the logo, so it is the first thing on screen and never scrolls out of reach. Beneath it, the site is built to actually transact: pick a specialist by condition and availability, choose a slot, enter details, confirm — four steps, no phone call. Fees, accepted insurers, sliding scale, and downloadable intake forms are stated plainly instead of gated. Staff get a portal for bookings, slot management, messages, and content.",
    features: [
      {
        title: "Persistent crisis bar",
        body: "988, the Crisis Text Line, and emergency services pinned above the navigation on every page — placed ahead of the brand, deliberately.",
      },
      {
        title: "Four-step booking flow",
        body: "Choose specialist, select date and time, enter patient details, confirm — with a visible progress rail and a phone fallback for anyone who would rather talk to a person.",
      },
      {
        title: "Specialists with real filters",
        body: "Each clinician lists credentials, conditions treated, languages, and the days they actually work, so the choice is made on fit rather than on a headshot.",
      },
      {
        title: "Services by modality",
        body: "Individual, couples, family, telehealth, psychiatric evaluation, and medication management, each with session length, cadence, and the named approaches used — CBT, DBT, EMDR, ACT, Gottman, psychodynamic.",
      },
      {
        title: "Paperwork and money up front",
        body: "Downloadable intake, medication history, and insurance verification forms, plus accepted plans, self-pay fees, and sliding-scale availability stated openly.",
      },
      {
        title: "Staff portal",
        body: "Bookings, slot management, patient messages, blog and content editing, and revenue by clinician — the operational half of the practice, not just the marketing half.",
      },
    ],
    decisions: [
      {
        title: "Safety outranks branding",
        body: "The crisis strip is the first element in the document, above the header. It is the one piece of the page that never moves, collapses, or waits for hydration.",
      },
      {
        title: "Calm as a constraint, not a palette",
        body: "Generous line height, high-contrast body copy, and no autoplaying motion — a clinical audience should not have to fight the interface to read it.",
      },
      {
        title: "Booking is componentised for a real backend",
        body: "The wizard, availability model, and slot manager are separate from the demo data, so a practice management system or EHR can be connected without the front end changing.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Booking engine", "Staff portal"],
    lighthouse: {
      performance: 96,
      accessibility: 94,
      bestPractices: 100,
      seo: 100,
    },
    fieldMetrics: [
      { label: "Largest paint", value: "1.4s", note: "LCP, desktop" },
      { label: "Layout shift", value: "0", note: "CLS, desktop" },
    ],
    metricsMethod:
      "Lighthouse 12.8.2, desktop preset, run against the live demo on 28 August 2026. Each category is the median of three runs, because a single desktop run swings by ten points or more depending on how warm the CDN edge is. Re-runnable by anyone — the URL is public.",
    liveDemoUrl: "https://mindwell.matterpixel.com",
    admin: {
      url: "https://mindwell.matterpixel.com/admin",
      user: "admin",
      pass: "admin",
      note: "Demo credentials are published on the portal's own sign-in screen.",
    },
    cover: "/projects/mindwell/hero.webp",
    mobile: "/projects/mindwell/mobile.webp",
    gallery: [
      {
        src: "/projects/mindwell/booking.webp",
        caption: "Step one of the booking flow — specialists shown with conditions treated and working days.",
      },
      {
        src: "/projects/mindwell/services.webp",
        caption: "Services by modality, with session length, cadence, and the named therapeutic approaches used.",
      },
      {
        src: "/projects/mindwell/resources.webp",
        caption: "Intake paperwork offered before the first visit, with insurance and fees stated on the same page.",
      },
      {
        src: "/projects/mindwell/admin.webp",
        url: "https://mindwell.matterpixel.com/admin",
        caption: "Staff portal — today's appointments, revenue by clinician, and the recent bookings table.",
      },
    ],
    relatedServiceSlugs: ["web-app-development", "ai-automation", "branding-identity"],
  },
  {
    slug: "lcinco-pizza",
    name: "L'Cinco Pizza",
    medium: "website",
    category: "Restaurant · Ordering & Delivery",
    sector: "Hospitality",
    accent: "magenta",
    oneLiner: "A Paris pizzeria that takes the order itself instead of renting the customer to a delivery app.",
    summary:
      "Zone-aware ordering, a slide-out cart, live order tracking, and a full store back office. Built so a restaurant keeps its own customers, margins, and data.",
    brief:
      "Build the ordering system a multi-zone pizzeria needs to run direct: check the address is deliverable before the menu is shown, take the order in a handful of taps, let the customer watch it being made, and give the owner a dashboard that runs the shift.",
    problem:
      "Most restaurants hand ordering to a marketplace, then pay 25–30% of every order for the privilege — and never see the customer's details again. The ones who do build their own site usually ship a PDF menu and a phone number, which converts worse than the app they were trying to escape. Neither route gives the owner the two things that actually matter: the margin and the customer list.",
    solution:
      "L'Cinco is a direct-ordering system. The delivery zone is chosen in the header before anything else, so nobody builds a basket that cannot be delivered. The menu filters by diet, sizes and prices update in place, and the cart is a slide-out panel that never leaves the menu. After checkout the customer gets an order code and a four-stage tracker. Behind it, the owner has live orders, menu and meal-deal editing, coupon performance, hero banners, announcements, and store hours.",
    features: [
      {
        title: "Zone-aware ordering",
        body: "Nine Paris and inner-suburb delivery zones with their real addresses, selected in the header, so deliverability is settled before the basket is built.",
      },
      {
        title: "Filterable menu with live sizing",
        body: "Vegetarian, meat, and spicy filters, per-pizza S/M/L sizing with prices that update in place, and dietary badges on the card.",
      },
      {
        title: "Slide-out cart",
        body: "Quantity steppers, per-line removal, and a running subtotal, delivery, and total — all without leaving the menu.",
      },
      {
        title: "Live order tracking",
        body: "An order code returns a four-stage timeline: received, in the kitchen, out for delivery, delivered.",
      },
      {
        title: "Promotions that the owner controls",
        body: "A rotating offer ticker, coupon codes, and a meal-deal bundle, all editable from the back office with usage tracked per coupon.",
      },
      {
        title: "Shift dashboard",
        body: "Live order count, out-for-delivery, today/week/month revenue, a revenue-and-orders chart, and an order-status breakdown on one screen.",
      },
    ],
    decisions: [
      {
        title: "Zone first, menu second",
        body: "Address validation is the first interaction rather than the last, which is where a marketplace checkout usually puts it — and where it usually loses the order.",
      },
      {
        title: "Appetite is the hero",
        body: "Food photography is given the full width of the card and the hero, because in this category the image is the product page. The rest of the interface stays out of its way.",
      },
      {
        title: "The owner edits the shop, not the code",
        body: "Menu, prices, meal deals, coupons, hero banners, announcements, and hours are all data. A Friday price change is an admin login, not a developer ticket.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Cart & checkout", "Order tracking", "Admin dashboard"],
    lighthouse: {
      performance: 96,
      accessibility: 100,
      bestPractices: 100,
      seo: 100,
    },
    fieldMetrics: [
      { label: "Largest paint", value: "1.3s", note: "LCP, desktop" },
      { label: "Layout shift", value: "0.003", note: "CLS, desktop" },
    ],
    metricsMethod:
      "Lighthouse 12.8.2, desktop preset, run against the live demo on 28 August 2026. Each category is the median of three runs, because a single desktop run swings by ten points or more depending on how warm the CDN edge is. Re-runnable by anyone — the URL is public.",
    liveDemoUrl: "https://pizza.matterpixel.com",
    admin: {
      url: "https://pizza.matterpixel.com/admin",
      user: "admin",
      pass: "admin",
      note: "Demo credentials — the panel is wired to the same data the storefront reads.",
    },
    cover: "/projects/lcinco-pizza/hero.webp",
    mobile: "/projects/lcinco-pizza/mobile.webp",
    gallery: [
      {
        src: "/projects/lcinco-pizza/menu.webp",
        caption: "The menu — diet filters, per-pizza sizing, and prices that update in place.",
      },
      {
        src: "/projects/lcinco-pizza/cart.webp",
        caption: "Slide-out cart with quantity steppers and a running total, opened over the menu.",
      },
      {
        src: "/projects/lcinco-pizza/tracking.webp",
        caption: "Order tracking — a real demo code returns the four-stage delivery timeline.",
      },
      {
        src: "/projects/lcinco-pizza/admin.webp",
        url: "https://pizza.matterpixel.com/admin",
        caption: "Shift dashboard — live orders, revenue by period, and order-status breakdown.",
      },
    ],
    relatedServiceSlugs: ["web-app-development", "seo-growth", "ai-product-photography"],
  },
  {
    slug: "scentora",
    name: "Scentora",
    medium: "website",
    category: "Luxury Fragrance · eCommerce",
    sector: "eCommerce",
    accent: "blue",
    oneLiner: "A luxury fragrance maison that sells scent you cannot smell.",
    summary:
      "A full storefront for a niche perfume house — collection browsing, scent-led product pages, cart, and an AI concierge. Built dark, slow-burning, and still first-paint fast.",
    brief:
      "Build the storefront a niche perfume house would need on day one: a catalogue that reads like an editorial, product pages that sell a scent through language and imagery instead of specs, and a back office the owner can run without a developer.",
    problem:
      "Fragrance is the hardest thing to sell online — the product cannot be sampled, so the entire purchase rests on how the page makes someone feel. Luxury brands answer that with heavy imagery and video, and then pay for it: hero media that takes seconds to paint, product grids that stutter, and a checkout that feels cheaper than the bottle. The atmosphere and the speed are treated as a trade-off.",
    solution:
      "Scentora treats the mood as the product and the performance as non-negotiable. Every fragrance is shot on the same near-black set so the grid reads as one collection; product pages lead with a written scent story and note structure rather than a spec table; and an AI concierge sits in the corner for the questions a first-time buyer actually asks — what suits me, what is on sale, where is my order. The catalogue, pricing, stock, coupons, and homepage content are all editable from the admin panel.",
    features: [
      {
        title: "Faceted collection browsing",
        body: "Ten fragrances filtered by collection, concentration, audience, and fragrance family, with sorting — all client-side, so filtering never costs a page load.",
      },
      {
        title: "Scent-led product pages",
        body: "Size variants with their own pricing, a written scent story, note breakdown, and trust row (shipping threshold, authenticity, returns) on every product.",
      },
      {
        title: "AI shopping concierge",
        body: "An in-page assistant with suggested openers for the three questions a fragrance buyer asks first — what do you offer, what is on sale, where is my order.",
      },
      {
        title: "Cart, wishlist, and account",
        body: "Persistent cart, wishlist, and sign-in, so a browsing session survives a closed tab.",
      },
      {
        title: "Owner-run back office",
        body: "Products, stock, orders, coupons, revenue, homepage content, and promotional bars are all editable from the admin panel — no deploy needed to change a price.",
      },
      {
        title: "Low-stock and order status",
        body: "The dashboard surfaces pending orders and low or out-of-stock sizes on load, rather than burying them in a report.",
      },
    ],
    decisions: [
      {
        title: "Dark set, one light direction",
        body: "Every product image uses the same black ground and warm key light, so a grid of ten different bottles still reads as one house rather than ten suppliers.",
      },
      {
        title: "Imagery budgeted, not uncapped",
        body: "The whole homepage — hero, ten product shots, and the collection rail — lands in about 1.2 MB, which is why the largest element paints in well under a second on desktop.",
      },
      {
        title: "Commerce data behind an interface",
        body: "Catalogue, cart, and order flows read through one data layer, so swapping the demo store for Shopify, Medusa, or a custom backend is an adapter change rather than a rebuild.",
      },
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "AI assistant", "Admin dashboard"],
    lighthouse: {
      performance: 99,
      accessibility: 90,
      bestPractices: 96,
      seo: 100,
    },
    fieldMetrics: [
      { label: "Largest paint", value: "0.8s", note: "LCP, desktop" },
      { label: "Layout shift", value: "0", note: "CLS, desktop" },
    ],
    metricsMethod:
      "Lighthouse 12.8.2, desktop preset, run against the live demo on 28 August 2026. Each category is the median of three runs, because a single desktop run swings by ten points or more depending on how warm the CDN edge is. Re-runnable by anyone — the URL is public.",
    liveDemoUrl: "https://scentora.matterpixel.com",
    admin: {
      url: "https://scentora.matterpixel.com/admin",
      user: "adminview",
      pass: "adminview",
      note: "Read-only demo view — explore freely, saving is disabled.",
    },
    cover: "/projects/scentora/hero.webp",
    mobile: "/projects/scentora/mobile.webp",
    gallery: [
      {
        src: "/projects/scentora/shop.webp",
        caption: "Collection view — filtering by collection, concentration, audience, and fragrance family.",
      },
      {
        src: "/projects/scentora/product.webp",
        caption: "Product page — size variants with their own pricing, scent story, and trust row.",
      },
      {
        src: "/projects/scentora/assistant.webp",
        caption: "The AI concierge, opened over the homepage with its suggested first questions.",
      },
      {
        src: "/projects/scentora/admin.webp",
        url: "https://scentora.matterpixel.com/admin",
        caption: "Admin dashboard — revenue, order queue, and low-stock alerts on one screen.",
      },
    ],
    relatedServiceSlugs: ["web-app-development", "ai-product-photography", "ai-automation"],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function projectsByMedium(medium: Medium | "all") {
  return medium === "all" ? projects : projects.filter((p) => p.medium === medium);
}
