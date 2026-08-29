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
 *  7. No model, app or vendor is named anywhere in this file. What a set
 *     was made WITH is not the claim; what it was made FROM and what came
 *     out of it are, and those are rules 6 and 8.
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
 * in and what came out, both stated exactly.
 */
export type MediaProject = BaseProject & {
  medium: "ai-image" | "ai-video";
  /** What was actually delivered — replaces the Lighthouse block as the
   * card's proof strip, so keep it to four short label/value pairs. */
  specs: { label: string; value: string }[];
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
   * Honesty rules 6-8 apply to everything below.
   *
   * Nothing below names the model that produced it. That is deliberate and
   * it is the one place these entries stop short of the websites' standard:
   * a Lighthouse score is re-runnable, a tool name is not something a
   * visitor can check anyway, and naming it invites the reader to grade the
   * vendor instead of the work. What went IN and what came OUT still have
   * to be stated exactly — those are the claims a client can hold us to.
   *
   * `specs` on the seven image sets are a fixed four — outputs, ratios,
   * resolution, variations — so a visitor comparing two cards is comparing
   * the same four things. Three of them are measured off the source masters;
   * `Variations` is the studio's own generate-then-select ratio and is the
   * one number in this file that no file can prove, so it is stated as the
   * constant it is rather than dressed up per project. If that ratio ever
   * changes, it changes here in seven places and nowhere else.
   *
   * The other `specs` are measured off the delivered files (see the source masters in
   * brand/projects-source/, which is where the untouched originals live —
   * they are deliberately outside public/ so 370MB of PNG never ships). The
   * web exports are capped at 1600px on the long edge and never upscaled:
   * a 1024px master stays 1024px here, because a spec row that claims a
   * resolution the file does not have is the same lie as a hand-written
   * Lighthouse score.
   *
   * Captions describe what is actually in the frame — rule 4, and the line
   * most likely to rot silently when assets are swapped.
   */
  {
    slug: "ai-product-photography",
    name: "Product Photography Set",
    medium: "ai-image",
    category: "Retail · Product & Campaign Imagery",
    sector: "Retail",
    accent: "blue",
    oneLiner: "Fifteen finished product frames, eight of them built from a plain phone photograph.",
    summary:
      "Skincare, supplements, electronics, kitchen and fine jewellery — campaign-grade stills with the unretouched reference left visible in the frame. The before is in the picture, so the claim checks itself.",
    brief:
      "Answer the objection every small brand raises about generated imagery — 'it will not look like my product' — by taking a real, badly-lit reference photograph and carrying it through to a finished campaign frame without swapping the product for a prettier one.",
    problem:
      "A product shoot is the first cost a new brand cannot justify and the first thing buyers judge them on. The usual escape routes are worse than the problem: a phone photo on a white sheet, or a stock image of something that is not the product. Both tell a customer the brand could not afford to care.",
    solution:
      "Locked the product form from the supplied reference first, then generated the environment, the light and the layout around it. Where the frame is a conversion, the reference is kept in the composition as the BEFORE panel — the input stays visible instead of being described in a caption nobody can verify.",
    sourceNote:
      "Eight of the fifteen started from a supplied product photograph, and that photograph is still in the frame as the BEFORE panel — nothing is hidden about where the finished frame came from. The rest are prompt-only.",
    specs: [
      {
        label: "Outputs",
        value: "15",
      },
      {
        label: "Ratios",
        value: "3:2 · 1:1 +2",
      },
      {
        label: "Resolution",
        value: "up to 2K",
      },
      {
        label: "Variations",
        value: "8",
      },
    ],
    deliverables: [
      {
        title: "Before/after conversions",
        body: "Eight frames where the supplied reference and the finished campaign sit in one composition. A buyer can compare them without taking our word for the input.",
      },
      {
        title: "Campaign layouts, not just stills",
        body: "Headline, benefit icons and product lockup composed in the frame — the format a brand actually posts, rather than a bare product on a gradient.",
      },
      {
        title: "Jewellery lit for metal",
        body: "Seven frames where the subject is gold and stone. These are the hardest thing in the set to fake, because a wrong specular ruins the material instantly.",
      },
      {
        title: "Square and landscape masters",
        body: "Every piece delivered at the ratio it was composed for, so nothing is centre-cropped into a feed.",
      },
    ],
    decisions: [
      {
        title: "Lock the product before the scene",
        body: "The reference is matched first and the environment built around it. Prompting product and scene together is what produces a beautiful frame of the wrong bottle.",
      },
      {
        title: "Keep the before in the frame",
        body: "A conversion that hides its input is indistinguishable from a stock photo with a caption. Leaving the reference in the composition is the cheapest honest proof available.",
      },
      {
        title: "Type is composed, not generated",
        body: "Headlines and benefit text are laid in as real type. Generated lettering reads as legible until anyone zooms.",
      },
    ],
    cover: "/projects/ai-product-photography/01.webp",
    media: [
      {
        kind: "image",
        src: "/projects/ai-product-photography/01.webp",
        caption: "Vitamin C serum suspended in amber bubbles.",
        aspect: "1536 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/02.webp",
        caption: "Three-panel cola build: the plain reference bottle, the styled splash, the finished label.",
        aspect: "1600 / 959",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/03.webp",
        caption: "Before/after — a face-cream jar shot on a table, beside the campaign it became.",
        aspect: "1536 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/04.webp",
        caption: "Before/after — a tube of face wash, and the layout built from it.",
        aspect: "1536 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/05.webp",
        caption: "Before/after — a supplement bottle, and the gym campaign it became.",
        aspect: "1536 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/06.webp",
        caption: "Before/after — a laptop on a desk, and the finished laptop ad.",
        aspect: "1600 / 853",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/07.webp",
        caption: "Gold necklace on satin, lit for the metal rather than the stones.",
        aspect: "1273 / 1274",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/08.webp",
        caption: "Before/after — a phone held in a dim room, and the finished handset ad.",
        aspect: "1536 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/09.webp",
        caption: "Before/after — a hand-blender set on a counter, and the kitchen campaign.",
        aspect: "1536 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/10.webp",
        caption: "Two gold rings on dark stone with dried branches.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/11.webp",
        caption: "A diamond ring set into pale flowers.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/12.webp",
        caption: "A pendant on stacked stones, peach ground.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/13.webp",
        caption: "Pendant and hoop earrings on a stone dish.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/14.webp",
        caption: "A solitaire on dark marble, in mist.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-product-photography/15.webp",
        caption: "Before/after — the same face-cream jar, taken to a second campaign.",
        aspect: "1600 / 961",
      },
    ],
    relatedServiceSlugs: ["ai-product-photography", "branding-identity", "web-app-development"],
  },
  {
    slug: "ai-social-posts",
    name: "Campaign Post Sets",
    medium: "ai-image",
    category: "FMCG · Social Campaigns",
    sector: "FMCG",
    accent: "magenta",
    oneLiner: "Two complete campaigns — an energy drink and a serum — eleven posts that hold one look each.",
    summary:
      "Turbo runs loud, red and athletic across five posts. Roseluxe runs soft and pink across six. The point is not one good frame; it is that a whole grid looks like it came from one brand.",
    brief:
      "Build two social campaigns end to end, in opposite registers, and hold each one's product form, palette and typographic system across every post — the thing a single generated image never proves.",
    problem:
      "Generated imagery is judged one frame at a time and sold one frame at a time, which hides its real weakness. Posted as a grid, the same product changes shape between images, the palette drifts, and the account stops looking like a brand and starts looking like a prompt history.",
    solution:
      "Fixed each campaign's can or bottle as a reference before any layout work, wrote the palette and type treatment down, then generated every post against both. Turbo carries a red-and-black system with the same benefit icons in every frame; Roseluxe carries a pink system from the packshot through to the ingredient breakdown.",
    sourceNote:
      "Prompt-only, with each campaign's product form locked from the first approved frame and carried forward. Both brands are ours — Turbo and Roseluxe are invented for this set, not client property.",
    specs: [
      {
        label: "Outputs",
        value: "11",
      },
      {
        label: "Ratios",
        value: "1:1",
      },
      {
        label: "Resolution",
        value: "1K",
      },
      {
        label: "Variations",
        value: "8",
      },
    ],
    deliverables: [
      {
        title: "Two consistent systems",
        body: "Five Turbo posts and six Roseluxe posts, each holding one palette, one product form and one type treatment across the whole set.",
      },
      {
        title: "Range within a system",
        body: "Roseluxe runs from a bare podium shot to a dense ingredient breakdown. A campaign needs both, and both have to look like the same brand.",
      },
      {
        title: "Benefit iconography",
        body: "The same four icons in the same order across the Turbo posts — the part of a system that fails first when frames are generated independently.",
      },
      {
        title: "Feed-ready squares",
        body: "Composed at 1:1 rather than cropped to it, so nothing important sits under a thumbnail's edge.",
      },
    ],
    decisions: [
      {
        title: "Design the system, then the posts",
        body: "Palette, type and product form are settled on frame one. Every later post is generated against that, not against the prompt that made the last one.",
      },
      {
        title: "Two registers, deliberately",
        body: "A loud campaign and a quiet one prove the method rather than the taste. One set of pretty pink frames would only prove that pink is easy.",
      },
      {
        title: "Density is part of the range",
        body: "The ingredient breakdown is the least beautiful post in the set and the most useful one — brands need the explaining post as much as the hero.",
      },
    ],
    cover: "/projects/ai-social-posts/01.webp",
    media: [
      {
        kind: "image",
        src: "/projects/ai-social-posts/01.webp",
        caption: "Turbo — two athletes mid-shout, the can held between them.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/02.webp",
        caption: "Turbo — 'Energy to outperform', stadium pitch at night.",
        aspect: "1536 / 1536",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/03.webp",
        caption: "Turbo — 'Maximum energy, zero limits', benefit icons stacked down the side.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/04.webp",
        caption: "Turbo — 'No limits, just results.'",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/05.webp",
        caption: "Turbo — the motorsport cut: 'Champions aren't born. They're fueled.'",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/06.webp",
        caption: "Roseluxe — the bottle among roses and rose quartz.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/07.webp",
        caption: "Roseluxe — bottle on a marble podium with a mirror behind it.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/08.webp",
        caption: "Roseluxe — application shot, benefit chips laid down the right edge.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/09.webp",
        caption: "Roseluxe — the full ingredient and benefit breakdown, the densest layout in the set.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/10.webp",
        caption: "Roseluxe — 'Pure rose. Visible radiance.', the minimal end of the same system.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-social-posts/11.webp",
        caption: "Roseluxe — 'Your daily dose of radiance', held to camera.",
        aspect: "1254 / 1254",
      },
    ],
    relatedServiceSlugs: ["ai-product-photography", "branding-identity", "seo-growth"],
  },
  {
    slug: "ai-product-films",
    name: "Product Films",
    medium: "ai-video",
    category: "Retail · Product Motion",
    sector: "Retail",
    accent: "blue",
    oneLiner: "Seven ten-second product films — the moves a rig, a track and a smoke machine would cost a day to shoot.",
    summary:
      "Dolly, orbit, rack focus and light-trail passes across perfume, cans, a car, a sneaker and a snack pack. Ten seconds each, web-weight, poster-framed.",
    brief:
      "Produce the short product motion a storefront and a paid social buy both need — an orbit, a push-in, a hero move — at the length a feed actually plays, and prove the camera moves are controllable rather than whatever the model felt like doing.",
    problem:
      "Product motion is where small brands stop. A ten-second orbit needs a motion-control rig, a lighting grid and a stage day; the alternative is a still with a slow zoom applied in the edit, which every viewer reads instantly as a still with a zoom applied.",
    solution:
      "Wrote one camera instruction per shot and generated against it, rather than fishing for usable motion. Each film holds a single move for its full length, so the shot cuts into an edit as a real coverage angle instead of an effect.",
    sourceNote:
      "Generated from a written camera instruction per shot, so every move on screen was asked for rather than found. No filmed footage. Products are unbranded stand-ins; one bottle still reads TEST.",
    specs: [
      {
        label: "Films",
        value: "7",
      },
      {
        label: "Runtime",
        value: "0:10 each",
      },
      {
        label: "Master",
        value: "720p · 24fps",
      },
      {
        label: "Ratio",
        value: "16:9",
      },
    ],
    deliverables: [
      {
        title: "One camera move per film",
        body: "Dolly, orbit, fast rotation, zoom in, zoom out — each held for the full ten seconds so it can be cut as coverage rather than dropped in as a transition.",
      },
      {
        title: "Materials that are hard to fake",
        body: "Glass, chrome, wet asphalt, foil and fried texture. These are the surfaces that expose a weak model within a second.",
      },
      {
        title: "Poster frame per film",
        body: "Every clip ships with a still, so a grid of them reads as a set before anything plays and still reads as one where motion is switched off.",
      },
      {
        title: "Web-weight encodes",
        body: "Under 1.2MB per film at 720p, fast-start. The version that plays on cellular is the only version that matters.",
      },
    ],
    decisions: [
      {
        title: "Write the move, then generate",
        body: "One instruction per shot. Generating without one means paying for a hundred clips to find seven, and the seven still do not cut together.",
      },
      {
        title: "Ten seconds, not thirty",
        body: "Generated motion degrades on long holds. Ten seconds is inside the model's honest range and is also the length a feed will actually play.",
      },
      {
        title: "Unbranded stand-ins",
        body: "No real product marks in the frame. A portfolio piece that borrows a brand's trade dress is a legal problem wearing a showreel.",
      },
    ],
    cover: "/projects/ai-product-films/03-poster.webp",
    media: [
      {
        kind: "video",
        src: "/projects/ai-product-films/01.mp4",
        poster: "/projects/ai-product-films/01-poster.webp",
        caption: "A bottle on wet stone with lavender and charcoal, fog rolling through behind it.",
        aspect: "16 / 9",
        duration: "0:10",
      },
      {
        kind: "video",
        src: "/projects/ai-product-films/02.mp4",
        poster: "/projects/ai-product-films/02-poster.webp",
        caption: "Dolly around a red sports car on a neon-wet street.",
        aspect: "16 / 9",
        duration: "0:10",
      },
      {
        kind: "video",
        src: "/projects/ai-product-films/03.mp4",
        poster: "/projects/ai-product-films/03-poster.webp",
        caption: "Fast rotation past three cans under blinking neon tubes.",
        aspect: "16 / 9",
        duration: "0:10",
      },
      {
        kind: "video",
        src: "/projects/ai-product-films/04.mp4",
        poster: "/projects/ai-product-films/04-poster.webp",
        caption: "Zoom out from a dark bottle on a marble plinth, smoke crossing it. The label reads TEST — no brand was attached to this one.",
        aspect: "16 / 9",
        duration: "0:10",
      },
      {
        kind: "video",
        src: "/projects/ai-product-films/05.mp4",
        poster: "/projects/ai-product-films/05-poster.webp",
        caption: "Petals falling to the table around a rose-gold bottle.",
        aspect: "16 / 9",
        duration: "0:10",
      },
      {
        kind: "video",
        src: "/projects/ai-product-films/06.mp4",
        poster: "/projects/ai-product-films/06-poster.webp",
        caption: "Rotating pan on a sneaker throwing a light trail across a graffiti court.",
        aspect: "16 / 9",
        duration: "0:10",
      },
      {
        kind: "video",
        src: "/projects/ai-product-films/07.mp4",
        poster: "/projects/ai-product-films/07-poster.webp",
        caption: "Zoom in on a packet spilling crisps across a wooden table.",
        aspect: "16 / 9",
        duration: "0:10",
      },
    ],
    relatedServiceSlugs: ["ai-video", "ai-product-photography", "branding-identity"],
  },
  {
    slug: "ai-pov-reels",
    name: "POV History Reels",
    medium: "ai-video",
    category: "Social · Short-Form Film",
    sector: "Social",
    accent: "magenta",
    oneLiner: "Three thirty-second vertical reels that put a viewer inside a Bangladeshi room in 1952, 1971 and the '90s.",
    summary:
      "First-person, shot from the bed, captions burned in for a muted feed. Period rooms nobody can photograph any more, built as a repeatable format rather than three one-offs.",
    brief:
      "Build a short-form format that carries a piece of Bangladeshi history in thirty vertical seconds — first-person, no narrator, legible with the sound off — and make it repeatable enough that a fourth and fifth episode cost the same as the third.",
    problem:
      "Historical short-form is either archive footage nobody holds the rights to, or a reconstruction that needs a set, a costume budget and a location. So the format that would actually travel — a specific room, a specific morning, a specific year — is the one nobody can afford to make.",
    solution:
      "Fixed the point of view first: waking, from the bed, feet in frame. Every episode reuses that frame so the series reads as one format across three periods. Period detail lives in the room — a ceiling fan, a rifle, a packed school bag — rather than in a voiceover, and the caption does the narration for a muted feed.",
    sourceNote:
      "Generated from a written shot list, then cut, captioned and graded in edit. No filmed footage and no archive material. The 1952 episode carries the Think With AI channel mark it was published under.",
    specs: [
      {
        label: "Reels",
        value: "3",
      },
      {
        label: "Runtime",
        value: "0:30 each",
      },
      {
        label: "Master",
        value: "1080p vertical",
      },
      {
        label: "Ratio",
        value: "9:16",
      },
    ],
    deliverables: [
      {
        title: "One repeatable POV frame",
        body: "Every episode opens from the same position — waking, feet in shot. That is what makes three films a format instead of three experiments.",
      },
      {
        title: "Muted-first captions",
        body: "The whole story is carried by burned-in type. Vertical feeds autoplay silent, so a reel that needs sound is a reel nobody watched.",
      },
      {
        title: "Period detail in the room",
        body: "A ceiling fan and a calendar for 1952, a rifle and a bamboo shelter for 1971, a packed bag and a rain sky for the '90s. The date is established by the set, not announced.",
      },
      {
        title: "Vertical masters",
        body: "1080 x 1920 at source, delivered web-weight at 720 x 1280 under 4MB — the size that plays on a phone on cellular.",
      },
    ],
    decisions: [
      {
        title: "Fix the point of view first",
        body: "The frame is the format. Deciding it once and reusing it is what lets a fourth episode cost a fraction of the first.",
      },
      {
        title: "Let the room carry the date",
        body: "No narrator, no title card explaining the year. A viewer who reads the period off the objects is a viewer who stayed.",
      },
      {
        title: "Cut inside the model's honest range",
        body: "Short holds and cuts on the beat. Generated motion drifts on long takes, most visibly on hands and faces.",
      },
    ],
    cover: "/projects/ai-pov-reels/02-1971-poster.webp",
    media: [
      {
        kind: "video",
        src: "/projects/ai-pov-reels/01-1952.mp4",
        poster: "/projects/ai-pov-reels/01-1952-poster.webp",
        caption: "POV: waking up on 21 February 1952 — a room at dawn, shot from the bed. Carries the Think With AI channel mark.",
        aspect: "9 / 16",
        duration: "0:30",
      },
      {
        kind: "video",
        src: "/projects/ai-pov-reels/02-1971.mp4",
        poster: "/projects/ai-pov-reels/02-1971-poster.webp",
        caption: "POV: a freedom fighter's shelter in 1971, rifle and pack within reach.",
        aspect: "9 / 16",
        duration: "0:30",
      },
      {
        kind: "video",
        src: "/projects/ai-pov-reels/03-90s.mp4",
        poster: "/projects/ai-pov-reels/03-90s-poster.webp",
        caption: "POV: a '90s childhood morning — bag packed by the desk, and no school today.",
        aspect: "9 / 16",
        duration: "0:30",
      },
    ],
    relatedServiceSlugs: ["ai-video", "seo-growth", "branding-identity"],
  },
  {
    slug: "ai-food-photography",
    name: "Food & Beverage Set",
    medium: "ai-image",
    category: "Hospitality · Menu Photography",
    sector: "Hospitality",
    accent: "blue",
    oneLiner: "Twelve menu and campaign frames a restaurant would otherwise close a kitchen to shoot.",
    summary:
      "Soup, salmon, tacos, pizza, shrimp, coffee, three drinks and a milk splash — each lit for the dish rather than run through one filter. Steam, splash and crumb included.",
    brief:
      "Shoot a full menu's worth of hero imagery across hot food, fried food, plated seafood, coffee and cold drinks — the range a real hospitality client asks for in one go — and light each dish for what it is instead of applying one look to twelve plates.",
    problem:
      "Restaurant photography is a shoot day, a food stylist and a kitchen that cannot serve while it runs. Most independents settle for phone photos under service lighting, which makes good food look grey — and the delivery apps then crop them square anyway.",
    solution:
      "Treated each dish as its own lighting problem: hard side light for the fried pieces, soft top light for the soup, backlight through the juice glass. Steam, splash and falling garnish are generated as part of the frame rather than composited, which is where most food retouching fails.",
    sourceNote:
      "Prompt-only, generated from a written brief per dish. No photographed source and no client dish in any frame.",
    specs: [
      {
        label: "Outputs",
        value: "12",
      },
      {
        label: "Ratios",
        value: "16:9",
      },
      {
        label: "Resolution",
        value: "1K",
      },
      {
        label: "Variations",
        value: "8",
      },
    ],
    deliverables: [
      {
        title: "Range across a real menu",
        body: "Hot, fried, plated, baked, brewed and poured. A hospitality set that only shows plated mains is not a menu, it is a mood board.",
      },
      {
        title: "Motion in the frame",
        body: "Steam off the soup, spice in the air around the chicken, milk breaking around the strawberries. The frames that sell food are the ones with something happening in them.",
      },
      {
        title: "Lit per dish",
        body: "Every plate gets its own key. One look applied to twelve dishes is what makes a menu page read as clip art.",
      },
      {
        title: "Wide masters",
        body: "16:9 throughout, so the same frame serves a site hero and a menu header without a second crop.",
      },
    ],
    decisions: [
      {
        title: "Light the food, not the set",
        body: "Prop styling is cheap to generate and easy to overdo. Every frame here keeps the dish as the brightest thing in it.",
      },
      {
        title: "Generate the motion, do not composite it",
        body: "Steam and splash added afterwards sit on top of a picture. Generated as part of the frame they light the food and cast into it.",
      },
      {
        title: "No stock plating cliches",
        body: "No mint leaf on a burger, no unexplained flour cloud. The tells that mark a frame as generated are usually borrowed from stock, not invented by the model.",
      },
    ],
    cover: "/projects/ai-food-photography/06.webp",
    media: [
      {
        kind: "image",
        src: "/projects/ai-food-photography/01.webp",
        caption: "Two bowls of pumpkin soup with the steam still rising, lit dark.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/02.webp",
        caption: "A seared salmon fillet with rosemary on a matte black plate.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/03.webp",
        caption: "An Oreo milkshake on a red diner table, cookies stacked beside it.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/04.webp",
        caption: "A platter of tacos under candlelight.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/05.webp",
        caption: "Overhead pepperoni pizza on a scarred wooden table, dips and garnish laid in the round.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/06.webp",
        caption: "A fried chicken drumstick caught mid-air in a burst of spice.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/07.webp",
        caption: "A cappuccino with poured latte art on rough wood.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/08.webp",
        caption: "Grilled garlic shrimp with a dipping sauce, plated dark.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/09.webp",
        caption: "A mango smoothie in a mason jar beside a cut mango.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/10.webp",
        caption: "A glass of apple juice on a garden table with the sun behind it.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/11.webp",
        caption: "A bowl of steaming noodles with shrimp and vegetables.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-food-photography/12.webp",
        caption: "Strawberries dropping through a milk splash on flat pink.",
        aspect: "1456 / 816",
      },
    ],
    relatedServiceSlugs: ["ai-product-photography", "branding-identity", "web-app-development"],
  },
  {
    slug: "ai-influencer-personas",
    name: "Influencer Personas",
    medium: "ai-image",
    category: "Beauty · Brand Faces",
    sector: "Beauty",
    accent: "magenta",
    oneLiner: "One face, nine locations, and it stays the same face.",
    summary:
      "Consistent brand personas carried across rooftops, poolsides, gyms and restaurants, plus product-in-hand frames for the skincare sets. Character consistency is the whole exercise.",
    brief:
      "Build brand faces that survive a campaign: hold one person's features across a rooftop at golden hour, a hotel window, a gym, a beach and a restaurant, then put the product in their hand without the face changing on the frame that matters most.",
    problem:
      "A brand face is either an influencer on a rate card and a renegotiation every quarter, or a model with a shoot day and usage limits. Both mean a campaign's face can walk. And the generated alternative fails at exactly the point that matters: the same person, twice.",
    solution:
      "Locked each persona from an approved frame and generated every later scene against it, rather than re-describing the person each time. The contact sheets exist for the same reason: a persona is only proven when nine of its frames are looked at together, which is why they are delivered as sheets rather than as nine loose images.",
    sourceNote:
      "Prompt-only, with each persona locked from its first approved frame and carried forward. The people are generated and are not depictions of real individuals; the products they hold are our own invented brands.",
    specs: [
      {
        label: "Outputs",
        value: "6",
      },
      {
        label: "Ratios",
        value: "5:3 · 1:1",
      },
      {
        label: "Resolution",
        value: "up to 4K",
      },
      {
        label: "Variations",
        value: "8",
      },
    ],
    deliverables: [
      {
        title: "Consistent faces across scenes",
        body: "One persona carried through nine environments in a single sheet — the test a brand face has to pass before it is worth building a campaign on.",
      },
      {
        title: "Male and female personas",
        body: "Both built the same way, so the method is not a fluke of one prompt.",
      },
      {
        title: "Product-in-hand frames",
        body: "The persona holding the serum, at campaign quality. The frame a brand actually runs, and the one where a drifting face is most obvious.",
      },
      {
        title: "Contact sheets, not loose frames",
        body: "Delivered as sheets so consistency can be judged the way a client judges it: all at once.",
      },
    ],
    decisions: [
      {
        title: "Lock the persona, then move them",
        body: "Approve one frame, then generate every scene against it. Re-describing a person per prompt is how you get nine cousins.",
      },
      {
        title: "Judge consistency as a set",
        body: "A single frame proves nothing about a persona. The sheet is the deliverable because the sheet is where the failure would show.",
      },
      {
        title: "Generated people, stated plainly",
        body: "No real person is depicted or implied. A brand face with no rate card is only an advantage if nobody has to wonder whose face it is.",
      },
    ],
    cover: "/projects/ai-influencer-personas/01.webp",
    media: [
      {
        kind: "image",
        src: "/projects/ai-influencer-personas/01.webp",
        caption: "The persona holding the Roseluxe serum — the same product that runs through the social set.",
        aspect: "1254 / 1254",
      },
      {
        kind: "image",
        src: "/projects/ai-influencer-personas/02.webp",
        caption: "Nine scenes, one persona: rooftop, poolside, robe, evening dress, beach, cabin, restaurant. The face has to survive all nine.",
        aspect: "1600 / 966",
      },
      {
        kind: "image",
        src: "/projects/ai-influencer-personas/03.webp",
        caption: "A male persona across five scenes — beach, hotel window, gym, mirror, poolside.",
        aspect: "1600 / 966",
      },
      {
        kind: "image",
        src: "/projects/ai-influencer-personas/04.webp",
        caption: "The same persona in swimwear, in a robe at a vanity, and in three phone-mirror frames.",
        aspect: "1600 / 966",
      },
      {
        kind: "image",
        src: "/projects/ai-influencer-personas/05.webp",
        caption: "Several personas holding skincare, each in its own environment.",
        aspect: "1600 / 961",
      },
      {
        kind: "image",
        src: "/projects/ai-influencer-personas/06.webp",
        caption: "Mixed personas with jars and tubes across mountain, garden and city settings.",
        aspect: "1600 / 961",
      },
    ],
    relatedServiceSlugs: ["ai-product-photography", "branding-identity", "ai-video"],
  },
  {
    slug: "ai-interior-design",
    name: "Interior Boards",
    medium: "ai-image",
    category: "Interiors · Room Visualisation",
    sector: "Interiors",
    accent: "blue",
    oneLiner: "Eleven variations on one room, so a client can point at the one they mean.",
    summary:
      "The same bright, white-walled living room re-furnished eleven ways — sectional, wing chair, gallery wall, near-empty. A visual language for a conversation that usually happens in adjectives.",
    brief:
      "Give an interiors client something to point at. Take one room brief — white walls, high light, colour carried by furniture and art — and produce enough distinct variations that a preference can be identified by picking a frame rather than by describing a feeling.",
    problem:
      "Interior briefs are conducted in adjectives. 'Warm but minimal', 'colourful but not busy' — words that mean something different to everyone in the room, and which get expensive to disambiguate once furniture is being ordered. Mood boards of other people's rooms drag in the wrong architecture with the right sofa.",
    solution:
      "Held the architecture fixed — same white walls, same window light, same proportions — and varied only what a client actually chooses: seating, art, rug, palette and how full the room is. Because the shell never changes, the eleven frames are directly comparable, which is what makes picking one mean something.",
    sourceNote:
      "Prompt-only, generated from a single written room brief varied per frame. No photographed interior and no client property.",
    specs: [
      {
        label: "Outputs",
        value: "11",
      },
      {
        label: "Ratios",
        value: "16:9",
      },
      {
        label: "Resolution",
        value: "1K",
      },
      {
        label: "Variations",
        value: "8",
      },
    ],
    deliverables: [
      {
        title: "One shell, eleven treatments",
        body: "The architecture is constant across the set, so the differences between boards are all decisions a client can actually make.",
      },
      {
        title: "A fullness range",
        body: "From a near-empty sunlit room to a gallery wall with a full library. 'How much stuff' is the question clients answer most easily by pointing.",
      },
      {
        title: "Colour carried by objects",
        body: "White shell throughout, with every board's character coming from seating, rug and art — the elements that are still changeable late.",
      },
      {
        title: "Wide masters",
        body: "16:9 at 1456px, the ratio a presentation deck and a site both take without a re-crop.",
      },
    ],
    decisions: [
      {
        title: "Vary one axis at a time",
        body: "Change the shell and the boards stop being comparable. The constant room is what turns a set of pictures into a decision tool.",
      },
      {
        title: "Leave a frame blank",
        body: "One board deliberately hangs an empty frame. A client who notices it is a client telling you how finished they want the room to feel.",
      },
      {
        title: "Bright, not moody",
        body: "Dark interiors photograph well and brief badly — shadow hides exactly the furniture the client is being asked to choose.",
      },
    ],
    cover: "/projects/ai-interior-design/06.webp",
    media: [
      {
        kind: "image",
        src: "/projects/ai-interior-design/01.webp",
        caption: "Tan leather sofa, layered rugs, plants stacked into the window light.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/02.webp",
        caption: "Loft living room with a large abstract canvas and a striped runner.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/03.webp",
        caption: "White sofa flanked by two round swivel chairs, circle-motif canvas above.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/04.webp",
        caption: "Colour-block grid artwork over a low sofa, modular shelving to the right.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/05.webp",
        caption: "A shelf wall of glass vessels beside a cut-out colour-block wall piece.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/06.webp",
        caption: "Sectional sofa, paired abstract canvases, built-in library.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/07.webp",
        caption: "Open-plan room with a striped rug, floor cushions and full-height shelving.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/08.webp",
        caption: "Red lounge chair and ottoman against a painted-face canvas.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/09.webp",
        caption: "A near-empty sunlit room — sideboard, mustard chair, and the shadow of the window frame.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/10.webp",
        caption: "Yellow wing chair, white sofa, and a frame left deliberately blank.",
        aspect: "1456 / 816",
      },
      {
        kind: "image",
        src: "/projects/ai-interior-design/11.webp",
        caption: "Yellow sofa and pink pouffe under an orange colour-field canvas.",
        aspect: "1456 / 816",
      },
    ],
    relatedServiceSlugs: ["ai-product-photography", "branding-identity", "web-app-development"],
  },
  {
    slug: "ai-album-art",
    name: "Album Art Studies",
    medium: "ai-image",
    category: "Music · Cover Art",
    sector: "Music",
    accent: "magenta",
    oneLiner: "Nine covers that survive being two hundred pixels wide.",
    summary:
      "Silhouettes, double exposures, particle figures and one painted room — square, high-contrast, and legible at the size a streaming app actually shows them.",
    brief:
      "Design cover art for the size it is really seen at. A release is judged as a thumbnail in a queue, so produce nine covers that each hold one shape strong enough to read at 200px and still reward a full-size look.",
    problem:
      "Most independent cover art is designed at full size and dies in the feed: fine detail turns to mud, thin type disappears, and a busy illustration becomes a grey square between two competitors' bold ones. The brief is a thumbnail; the work is almost never done to it.",
    solution:
      "Built every cover on a single high-contrast silhouette or a single figure against a dark ground, then let the detail live inside that shape. A profile filled with a nebula reads as a face at any size; the nebula is the reward for looking closer.",
    sourceNote:
      "Prompt-only, generated from a written brief per cover. No photographed source, no sampled artwork, and no real artist or release attached to any cover.",
    specs: [
      {
        label: "Outputs",
        value: "9",
      },
      {
        label: "Ratios",
        value: "1:1 · 7:5",
      },
      {
        label: "Resolution",
        value: "1K",
      },
      {
        label: "Variations",
        value: "8",
      },
    ],
    deliverables: [
      {
        title: "Thumbnail-first compositions",
        body: "One dominant shape per cover, tested at the size a streaming queue renders it.",
      },
      {
        title: "Range of treatment",
        body: "Line illustration, double exposure, particle work, smoke and one painted interior — nine directions rather than nine passes at one.",
      },
      {
        title: "Square masters",
        body: "1:1 throughout except one deliberate landscape, so nothing has to be re-cropped into a player.",
      },
      {
        title: "High-contrast palettes",
        body: "Each cover built on a strong figure-ground split, which is what survives compression and a dark UI.",
      },
    ],
    decisions: [
      {
        title: "Design for the queue, not the print",
        body: "The cover is a thumbnail nine times out of ten. Anything that only works at full size is decoration.",
      },
      {
        title: "One shape, then detail inside it",
        body: "A silhouette carries at any scale. Filling it with a nebula or a forest gives the frame something to give back at full size.",
      },
      {
        title: "No lettering in the art",
        body: "Type is added over a cover, not generated into it. Generated lettering looks right until it is read.",
      },
    ],
    cover: "/projects/ai-album-art/08.webp",
    media: [
      {
        kind: "image",
        src: "/projects/ai-album-art/01.webp",
        caption: "Illustrated portrait with a rack of hardware and cabling growing out of the head.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-album-art/02.webp",
        caption: "A wireframe figure of neon filament drifting through a nebula.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-album-art/03.webp",
        caption: "Double exposure — a profile filled with a tree at sunset. The only landscape crop in the set.",
        aspect: "1312 / 928",
      },
      {
        kind: "image",
        src: "/projects/ai-album-art/04.webp",
        caption: "A face read out of violet smoke on black. Nothing in the frame is drawn as a face.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-album-art/05.webp",
        caption: "Painted interior: a silhouetted figure, a window, red spatter across the wall.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-album-art/06.webp",
        caption: "Profile silhouette filled with a starfield, split against a pale ground.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-album-art/07.webp",
        caption: "A dancer drawn entirely in light particles.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-album-art/08.webp",
        caption: "Profile silhouette holding a nebula and its planets.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-album-art/09.webp",
        caption: "Cartoon portrait of a boy in an astronaut helmet against a star field.",
        aspect: "1024 / 1024",
      },
    ],
    relatedServiceSlugs: ["branding-identity", "ai-product-photography", "seo-growth"],
  },
  {
    slug: "ai-tshirt-design",
    name: "T-Shirt Typography",
    medium: "ai-image",
    category: "Apparel · Print Design",
    sector: "Apparel",
    accent: "blue",
    oneLiner: "Seventeen print-ready typographic tees, and every word on them is legible.",
    summary:
      "Hand-lettered-looking slogan designs on light and dark grounds. Legible type is the one thing most image models cannot do, which is exactly what this set is for.",
    brief:
      "Produce a print-on-demand slogan range where the type itself is the product — seventeen designs across dark and light garments, each with a self-contained lockup that can go straight to a print file.",
    problem:
      "Slogan tees are the highest-volume, lowest-margin category in apparel, so design cost has to be near zero — and it is the one category generated imagery is famously bad at, because most models produce lettering that looks like words rather than words. A design with a misspelled centrepiece is unsellable.",
    solution:
      "Routed the set to a model built for typography rather than one adapted to it, and kept every design to a single centred lockup with a strict colour count. Both ground colours are covered so the range works on black and white garments without redrawing.",
    sourceNote:
      "Prompt-only. The lettering is model output, not type composited on afterwards — that is the point of the set. No sampled artwork and no licensed fonts embedded.",
    specs: [
      {
        label: "Outputs",
        value: "17",
      },
      {
        label: "Ratios",
        value: "1:1",
      },
      {
        label: "Resolution",
        value: "1K",
      },
      {
        label: "Variations",
        value: "8",
      },
    ],
    deliverables: [
      {
        title: "Legible generated lettering",
        body: "Every word in all seventeen designs reads correctly. This is the claim the set exists to make, and it is checkable by reading them.",
      },
      {
        title: "Both garment grounds",
        body: "Designs built for black and for white, including one line drawn twice — once per ground — rather than inverted and hoped for.",
      },
      {
        title: "Self-contained lockups",
        body: "Each design is a centred composition with its own decoration, so it drops onto a garment mockup without further layout.",
      },
      {
        title: "Tight colour counts",
        body: "Limited palettes per design, which is what keeps a screen print affordable rather than a four-colour process job.",
      },
    ],
    decisions: [
      {
        title: "Pick the model for the job",
        body: "Typography is a capability, not a prompt. The model that draws clean letterforms is not the one that plates food, and the set is routed to whichever one the job needs.",
      },
      {
        title: "One lockup per design",
        body: "Slogan tees fail when a composition needs a second focal point. Everything on the shirt belongs to one block.",
      },
      {
        title: "Draw the second colourway, do not invert it",
        body: "A design inverted for the other garment colour usually loses its outline logic. Both versions are generated as designs.",
      },
    ],
    cover: "/projects/ai-tshirt-design/15.webp",
    media: [
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/01.webp",
        caption: "'This Girl Can' — heavy display lettering on black.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/02.webp",
        caption: "'Don't judge me by my past, I don't live there anymore.'",
        aspect: "1201 / 1201",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/03.webp",
        caption: "'Sarcasm: just one of my many talents.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/04.webp",
        caption: "'One tequila, two tequila, three tequila, floor.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/05.webp",
        caption: "'Just here for the cake' — white ground, for light garments.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/06.webp",
        caption: "'I paused my game to be here.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/07.webp",
        caption: "'Yes, I'm cute... but I'm also psycho.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/08.webp",
        caption: "'I'm not shy, I just have no interest in talking to you.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/09.webp",
        caption: "'Promote what you love.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/10.webp",
        caption: "'Tacos made me do it' — white ground.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/11.webp",
        caption: "'Life is too short to worry about matching socks' — light colourway.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/12.webp",
        caption: "The same line redrawn for dark garments.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/13.webp",
        caption: "'I followed my heart, and it led me to the fridge.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/14.webp",
        caption: "'Believe in yourself.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/15.webp",
        caption: "'Live like there's no tomorrow' — the loudest treatment in the set.",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/16.webp",
        caption: "'Professional overthinker.'",
        aspect: "1024 / 1024",
      },
      {
        kind: "image",
        src: "/projects/ai-tshirt-design/17.webp",
        caption: "'Make it happen.'",
        aspect: "1024 / 1024",
      },
    ],
    relatedServiceSlugs: ["branding-identity", "ai-product-photography"],
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
/**
 * What the grid card needs, and nothing else.
 *
 * WorkGrid is a client component, so anything it imports is shipped to the
 * browser — and importing `projects` shipped the whole file: every brief,
 * every decision, every one of the ~90 media captions, none of which a card
 * renders. The page is the site's own performance argument, so it builds
 * this projection on the server and passes it down instead.
 *
 * Keep it a projection. The moment a field is added here "while we're at
 * it", the saving quietly goes back.
 */
export type WorkCard = {
  slug: string;
  name: string;
  medium: Medium;
  sector: string;
  accent: Project["accent"];
  oneLiner: string;
  cover: string;
  /** Websites only — the card's gauge block. */
  lighthouse?: LighthouseScores;
  liveDemoUrl?: string;
  /** Media only — the card's spec block and its "N stills" line. */
  specs?: { label: string; value: string }[];
  mediaCount?: number;
  /** Media only, and only when the set contains a clip: what the card plays
   * on hover. A stills-only set leaves this undefined and the card stays an
   * image, which is why it is the lead VIDEO rather than the lead asset. */
  leadVideo?: { src: string; poster?: string; duration?: string; caption: string };
};

export function toWorkCards(list: Project[]): WorkCard[] {
  return list.map((p) => {
    const base = {
      slug: p.slug,
      name: p.name,
      medium: p.medium,
      sector: p.sector,
      accent: p.accent,
      oneLiner: p.oneLiner,
      cover: p.cover,
    };
    if (p.medium === "website") {
      return { ...base, lighthouse: p.lighthouse, liveDemoUrl: p.liveDemoUrl };
    }
    const clip = p.media.find((m) => m.kind === "video");
    return {
      ...base,
      specs: p.specs,
      mediaCount: p.media.length,
      leadVideo: clip
        ? { src: clip.src, poster: clip.poster, duration: clip.duration, caption: clip.caption }
        : undefined,
    };
  });
}

export const websiteProjects = projects.filter(isWebsiteProject);
export const mediaProjects = projects.filter(isMediaProject);
