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
 *
 * The AI lanes cannot be verified by clicking a URL, so rules 2-3 have no
 * grip on them. These three carry the same weight instead:
 *
 *  6. `sourceNote` states what the piece was generated FROM — the reference
 *     photo, the product shot, the storyboard. Generated work with no
 *     stated input is indistinguishable from a stock library, and the whole
 *     reason to publish it is that it isn't one.
 *  7. `toolchain` names the actual models and tools, at the version we ran.
 *     "AI" is not a toolchain.
 *  8. `specs` are counts, resolutions and turnarounds we actually delivered
 *     — never a rate card and never a rounded-up "up to". A number here is
 *     a number a client can hold us to.
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

/**
 * Fields every project carries, whatever medium it is. Anything a card, a
 * hero, or a schema.org block needs unconditionally lives here — if it is
 * optional for one lane it belongs in that lane's own type instead.
 */
type BaseProject = {
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
  /** The self-set brief this piece answers. Never phrased as client work. */
  brief: string;
  /** The industry problem, stated as observed reality, not as a client quote. */
  problem: string;
  /** What was made in response, in production terms. */
  solution: string;
  /** Decisions worth stating to a buyer who wants to know how, not just what. */
  decisions: { title: string; body: string }[];
  /** Card/hero still. For a film this is the poster frame, so a card that
   * never plays (reduced motion, no autoplay, a slow connection) is still a
   * real frame of the actual piece and not a placeholder.
   *
   * There used to be a `coverFull` beside it — the tall full-page capture
   * the grid card panned on hover — dropped with the pan itself; see
   * WorkGrid's ProjectCard for why the pan went. */
  cover: string;
  relatedServiceSlugs: string[];
};

/**
 * A shipped website. The whole credibility argument is "open it yourself":
 * live URL, open admin, and a Lighthouse row we ran and will show the
 * method for.
 */
export type WebsiteProject = BaseProject & {
  medium: "website";
  /** Clickable-verifiable features. Every one exists on the live demo. */
  features: { title: string; body: string }[];
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
  mobile: string;
  /** `url` overrides the address shown in the frame — set it when the shot
   * is not of the storefront (the admin capture, for one). */
  gallery: { src: string; caption: string; url?: string }[];
};

/** One still or one clip in a media project's set. */
export type MediaAsset = {
  kind: "image" | "video";
  /** `/projects/<slug>/...` — webp for stills, mp4 for clips. */
  src: string;
  /** Video only, and required for one: the frame shown before playback and
   * whenever motion is off. A clip with no poster is a black box on a
   * reduced-motion machine. */
  poster?: string;
  /** Describes what is actually in the frame — honesty rule 4, unchanged. */
  caption: string;
  /** CSS aspect-ratio for the tile, e.g. "4 / 5", "16 / 9". Media sets are
   * mixed-ratio by nature, so each asset carries its own instead of the
   * grid forcing one crop on all of them. */
  aspect: string;
  /** Video only, "0:12" — printed on the tile so the length is known
   * before anyone commits to watching. */
  duration?: string;
};

/**
 * Generated imagery or film. There is no URL to open and no Lighthouse row
 * to run, so the proof is a different shape (honesty rules 6-8): what went
 * in, what made it, and what came out, all stated.
 */
export type MediaProject = BaseProject & {
  medium: "ai-image" | "ai-video";
  /** What was actually delivered — replaces the Lighthouse block as the
   * card's proof strip, so keep it to four short label/value pairs. */
  specs: { label: string; value: string }[];
  /** Models and tools that produced it — honesty rule 7. The `techStack`
   * analogue, named for what it is. */
  toolchain: string[];
  /** Honesty rule 6: the input the set was generated from, stated plainly
   * ("one client-supplied phone photo of the bottle"). Generated work with
   * no stated input is indistinguishable from a stock library. */
  sourceNote: string;
  /** What is in the set, in delivery terms. The `features` analogue. */
  deliverables: { title: string; body: string }[];
  /** The set itself. Item 0 leads the case study. */
  media: MediaAsset[];
  /** Optional link to the concept build this was produced for, when it was
   * made for one of ours — the only "go and check" a media piece has. */
  madeFor?: { label: string; href: string };
};

export type Project = WebsiteProject | MediaProject;

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
  /* ── AI lanes ───────────────────────────────────────────────────────
   * Rules 6-8 apply to everything below. Both entries ship with PLACEHOLDER
   * captures under /public/projects/<slug>/ — every file there is a
   * generated grey card that says so. Swap the files, then rewrite the copy
   * to match what is actually in them; the captions are the part that goes
   * stale silently. */
  {
    slug: "scentora-campaign",
    name: "Scentora Campaign Stills",
    medium: "ai-image",
    category: "Luxury Fragrance · Campaign Imagery",
    sector: "Beauty",
    accent: "blue",
    oneLiner: "A full campaign set for a fragrance house, generated from one bottle render.",
    summary:
      "Hero, editorial, and catalogue stills for the Scentora concept store — one product form, six environments, one consistent light. Shot count that would need a studio day, produced in an afternoon.",
    brief:
      "Produce the campaign imagery the Scentora storefront needs to open: a hero still that carries the whole page, editorial frames for the collection story, and clean catalogue cut-outs — all recognisably the same bottle, under the same light, across every crop the site asks for.",
    problem:
      "A new fragrance brand needs a campaign before it has revenue to pay for one. A studio day with a product photographer, a stylist, and a retoucher runs into four figures and returns a handful of usable frames, weeks later — and the moment the site needs a different crop or a different season, the whole cost repeats. Most brands settle for stock, and stock is why every small fragrance site looks like every other one.",
    solution:
      "Built a single reference of the bottle, locked the lighting and lens as a reusable base, then generated each environment against it — so the glass, the cap, and the label read identically from a 4:5 editorial crop to a square catalogue tile. Retouched by hand where generation is weak: label type, the meniscus, and the cast shadow's contact edge.",
    sourceNote:
      "Generated from one 3D bottle render and a written light plan. No stock plates, no photographed source, no client product in the frame — Scentora is our own concept brand, so the bottle is ours too.",
    specs: [
      { label: "Finals", value: "18" },
      { label: "Longest edge", value: "4096px" },
      { label: "Turnaround", value: "1 day" },
      { label: "Revisions", value: "2 rounds" },
    ],
    toolchain: ["Flux 1.1 Pro", "ComfyUI", "Photoshop (label + contact shadow)", "Topaz Gigapixel 7"],
    deliverables: [
      {
        title: "One hero, three crops",
        body: "The same frame delivered at 16:9, 4:5, and 1:1 — generated wide and recomposed, not cropped down from one master and left with the bottle off-centre.",
      },
      {
        title: "Consistent product form",
        body: "Cap proportions, shoulder curve, and label position hold across every still in the set. This is the part generated imagery usually fails at, and the reason a locked reference comes before any prompt.",
      },
      {
        title: "Catalogue cut-outs",
        body: "Transparent-background PNGs of the bottle alone, for product tiles and email — the frames a storefront actually runs out of first.",
      },
      {
        title: "Hand-retouched type",
        body: "Every label is composited from real vector artwork. Generated lettering is legible-looking rather than legible, and it does not survive a zoom.",
      },
    ],
    decisions: [
      {
        title: "Reference first, prompt second",
        body: "The base render is built and approved before a single generation runs. Prompting a product from scratch each time is what produces eighteen slightly different bottles — the failure that makes a set unusable as a set.",
      },
      {
        title: "One light plan across the set",
        body: "Key from camera-left, a hard rim for the glass edge, and a single practical for the ground reflection — written down, then applied to every environment. Consistent light is what makes six frames read as one campaign instead of six experiments.",
      },
      {
        title: "Retouch where generation is weak",
        body: "Type, contact shadows, and liquid surfaces get composited by hand. Knowing which 5% to do manually is most of the difference between generated imagery that ships and generated imagery that gets noticed.",
      },
    ],
    madeFor: { label: "Scentora — the storefront these were made for", href: "/projects/scentora" },
    cover: "/projects/scentora-campaign/cover.webp",
    media: [
      {
        kind: "image",
        src: "/projects/scentora-campaign/hero.webp",
        caption: "PLACEHOLDER — hero still. Replace with the campaign hero, then rewrite this caption to describe the frame.",
        aspect: "16 / 9",
      },
      {
        kind: "image",
        src: "/projects/scentora-campaign/editorial-01.webp",
        caption: "PLACEHOLDER — editorial 4:5 frame.",
        aspect: "4 / 5",
      },
      {
        kind: "image",
        src: "/projects/scentora-campaign/editorial-02.webp",
        caption: "PLACEHOLDER — editorial 4:5 frame, second environment.",
        aspect: "4 / 5",
      },
      {
        kind: "image",
        src: "/projects/scentora-campaign/catalogue.webp",
        caption: "PLACEHOLDER — square catalogue tile.",
        aspect: "1 / 1",
      },
    ],
    relatedServiceSlugs: ["ai-product-photography", "branding-identity", "web-app-development"],
  },
  {
    slug: "lcinco-launch-film",
    name: "L'Cinco Launch Film",
    medium: "ai-video",
    category: "Restaurant · Launch Film",
    sector: "Hospitality",
    accent: "magenta",
    oneLiner: "A thirty-second opening film for a pizzeria that never had to close for a shoot.",
    summary:
      "One hero film plus vertical and square cutdowns for the L'Cinco concept launch. Generated, graded, and cut to a licensed track — no crew, no closed dining room, no permit.",
    brief:
      "Produce the launch film the L'Cinco site opens on, and the social cutdowns that run beside it: enough atmosphere to make an empty new dining room feel like a full one, at a length nobody scrubs past, in the three aspect ratios a launch actually needs.",
    problem:
      "A restaurant's launch video is a shoot: a closed dining room, a crew, a food stylist, and a day of lost covers — before the edit. Most independents skip it entirely and open with a slideshow of phone photos, which is why the category's sites all feel the same. The ones who do shoot get one 16:9 master and then crop it square, badly, for everything else.",
    solution:
      "Storyboarded the thirty seconds first, generated each shot to that board rather than fishing for usable output, then cut and graded the whole thing as one film. Vertical and square are recomposed from wider generations, not cropped — every cutdown is framed for its own ratio.",
    sourceNote:
      "Generated from a written shot list and two reference frames of the L'Cinco interior we designed for the concept build. No filmed footage, no stock clips, no real venue — L'Cinco is our own concept brand.",
    specs: [
      { label: "Runtime", value: "0:30" },
      { label: "Master", value: "4K · 24fps" },
      { label: "Cutdowns", value: "9:16 · 1:1" },
      { label: "Turnaround", value: "3 days" },
    ],
    toolchain: ["Kling 2.1 Master", "Runway Gen-4 (inserts)", "DaVinci Resolve 19", "Topaz Video AI"],
    deliverables: [
      {
        title: "One 30s hero master",
        body: "4K, 24fps, graded, with the licensed track cut to picture. The file that plays on the site's opening fold.",
      },
      {
        title: "Vertical and square cutdowns",
        body: "9:16 and 1:1 recomposed from wider generations — reframed shot by shot, not centre-cropped from the master.",
      },
      {
        title: "Muted-first framing",
        body: "The film reads with sound off: no dialogue, no audio-dependent beats, and the one text card lands on a held frame. Autoplay is muted, so a film that needs sound is a film nobody watched.",
      },
      {
        title: "Web-weight encodes",
        body: "H.264 and WebM under 5MB for the hero, with a poster frame — the version that plays on a phone on cellular, which is the only version that matters.",
      },
    ],
    decisions: [
      {
        title: "Storyboard before generation",
        body: "Every shot is drawn and timed first. Generating without a board means paying for a hundred clips to find eight, and the eight still do not cut together.",
      },
      {
        title: "Grade as one film, not per clip",
        body: "Shots come out of different models with different colour behaviour. A single grade pass over the assembled cut is what makes them read as one camera in one room.",
      },
      {
        title: "Short shots hide the tell",
        body: "Generated motion falls apart on long holds — hands, steam, and faces drift. Cutting on the beat at 1-2 seconds keeps every shot inside its model's honest range.",
      },
    ],
    madeFor: { label: "L'Cinco Pizza — the site this film opens", href: "/projects/lcinco-pizza" },
    cover: "/projects/lcinco-launch-film/cover.webp",
    media: [
      {
        kind: "video",
        src: "/projects/lcinco-launch-film/film.mp4",
        poster: "/projects/lcinco-launch-film/film-poster.webp",
        caption: "PLACEHOLDER — 30s hero film. Replace with the real master, then rewrite this caption.",
        aspect: "16 / 9",
        duration: "0:30",
      },
      {
        kind: "video",
        src: "/projects/lcinco-launch-film/cut-vertical.mp4",
        poster: "/projects/lcinco-launch-film/cut-vertical-poster.webp",
        caption: "PLACEHOLDER — 9:16 cutdown.",
        aspect: "9 / 16",
        duration: "0:15",
      },
      {
        kind: "video",
        src: "/projects/lcinco-launch-film/cut-square.mp4",
        poster: "/projects/lcinco-launch-film/cut-square-poster.webp",
        caption: "PLACEHOLDER — 1:1 cutdown.",
        aspect: "1 / 1",
        duration: "0:15",
      },
      {
        kind: "image",
        src: "/projects/lcinco-launch-film/board.webp",
        caption: "PLACEHOLDER — the storyboard the film was generated against.",
        aspect: "16 / 9",
      },
    ],
    relatedServiceSlugs: ["ai-video", "branding-identity", "seo-growth"],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function projectsByMedium(medium: Medium | "all") {
  return medium === "all" ? projects : projects.filter((p) => p.medium === medium);
}

/** Narrowing guards. Every consumer that touches `lighthouse`, `liveDemoUrl`
 * or `media` goes through one of these — that is the whole point of the
 * union: a website-only field can no longer be read off an AI entry without
 * the compiler saying so. */
export const isWebsiteProject = (p: Project): p is WebsiteProject => p.medium === "website";
export const isMediaProject = (p: Project): p is MediaProject => p.medium !== "website";

/** The measured lane. `/projects` derives its whole proof strip from this
 * and never from `projects`, or an AI still would count as a "live build"
 * and drag a NaN through the Lighthouse range beside it. */
export const websiteProjects = projects.filter(isWebsiteProject);
export const mediaProjects = projects.filter(isMediaProject);
