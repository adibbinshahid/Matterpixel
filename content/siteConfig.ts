/**
 * Site-wide copy and config — the single source of truth for anything
 * that isn't a project, service, or blog post (those live in their own
 * content/ files). Edit here to change copy across the whole site.
 */

/** The canonical origin. Production serves www (the apex 308-redirects to
 * it), so canonicals, the sitemap and share URLs must all name www —
 * pointing them at the apex would canonicalise every page to a redirect. */
export const siteUrl = "https://www.matterpixel.com";

/** The one WhatsApp number every WhatsApp link on the site dials. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP
  ? `+${process.env.NEXT_PUBLIC_WHATSAPP.replace(/[^\d]/g, "")}`
  : "+8801707555755";

/** The inbox quick questions go to. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "adib@matterpixel.com";

export const brand = {
  name: "matterpixel",
  tagline: "We build what matters. Down to the pixel.",
  email: "hello@matterpixel.com",
  location: "Dhaka — working globally",
  year: 2026,
  replyPromise: "We reply within 12 hours.",
  founder: "Adib Bin Shahid",
};

/** wa.me link, optionally with a pre-typed first message. */
export function whatsappHref(text?: string): string {
  const digits = WHATSAPP_NUMBER.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** The opener for a WhatsApp chat started from a page on this site, so Adib
 * sees where the visitor was when they reached out. */
export function siteGreeting(path: string): string {
  return `Hi Adib, I found you via matterpixel.com${path}`;
}

/** The blanks an agency fills in — shared by the WhatsApp and email links
 * so both channels ask for the same four facts. */
const PARTNER_TEMPLATE =
  "Agency:\nWebsite:\nServices needed:\nProjects per month:\n\n(via matterpixel.com/#white-label)";

/**
 * Every conversion CTA on the site. Two labels only — a visitor either
 * books the free audit call or asks for a fixed quote. Booking opens the
 * Cal.com popup (components/CalLink, link in lib/cal); the quote lands on
 * the /contact form. Components read the label from here; never hard-code
 * it.
 *
 * The booking label is the one standard wording everywhere, founder
 * sections included — never reword it per section. `partner` is the
 * agency strip's direct line: no form, straight to WhatsApp or email.
 */
export const ctas = {
  book: {
    label: "Book a free audit call",
    /** The contact hub's audit tab. CTAs open Cal.com instead (CtaLink). */
    href: "/contact?tab=booking",
  },
  quote: {
    label: "Get a fixed quote",
    href: "/contact?tab=inquiry",
  },
  partner: {
    whatsapp: {
      label: "WhatsApp Adib",
      href: whatsappHref(`Hi Adib, I run an agency and want to discuss white-label work.\n\n${PARTNER_TEMPLATE}`),
    },
    email: {
      label: "Email Adib",
      href: `mailto:${brand.email}?subject=${encodeURIComponent("Agency partnership: [agency name]")}&body=${encodeURIComponent(PARTNER_TEMPLATE)}`,
    },
  },
} as const;

export type CtaKind = "book" | "quote";

/** A CTA's href with extra query params appended (a package, a stack, a
 * brief). Empty values are dropped. */
export function ctaHref(kind: CtaKind, params?: Record<string, string | undefined>): string {
  const url = new URLSearchParams(ctas[kind].href.split("?")[1]);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.set(key, value);
  }
  return `/contact?${url.toString()}`;
}

export const nav = {
  links: [
    { label: "Projects", href: "/projects" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ],
};

export const hero = {
  eyebrow: "Websites & Apps · AI Automation · Business Software · Branding · AI Visuals · SEO",
  headline: "We Build Websites and AI systems that win customers and save hours.",
  sub: "Founder-led digital studio. Fixed prices. Fast delivery. You own everything we build.",
};

/**
 * Credibility strip beneath the hero. Every claim here must already be
 * truthfully stated elsewhere on the site (siteConfig/FeatureStrip/founder
 * credentials) — Matterpixel has no client logos or testimonials yet (see
 * workIntro.honestLine), so this leans on guarantees and the founder's
 * verifiable track record instead of fabricated social proof.
 */
export const trust = {
  eyebrow: "Built to a standard, not just a deadline",
  badges: [
    "Minimum 90+ PageSpeed Score",
    "Fiverr Top Rated Seller",
    "NDA Friendly",
    "No Surprise Budget Increase",
  ],
};

/**
 * Reformats claims already made truthfully elsewhere (trust.badges,
 * founder.heading, brand.replyPromise) as a stat-tile row — no new facts
 * invented, same standard as every other credibility claim on this site.
 */
export const stats = [
  { value: "90+", label: "PageSpeed Minimum", desc: "No build ships under a 90+ Google PageSpeed score." },
  { value: "NDA", label: "Friendly", desc: "Comfortable working under NDA from day one." },
  { value: "100%", label: "Founder-Led", desc: "No bench, no juniors learning on your dime." },
  { value: "4.9", label: "Adib’s Rating", desc: "Verified Fiverr reviews from Adib’s client work." },
  { value: "150+", label: "Projects by Adib", desc: "Delivered by Adib as a Fiverr Top Rated Seller." },
  {
    value: "Fixed",
    label: "Quote Upfront",
    desc: "Fixed pricing with no unexpected price increases after the project begins.",
  },
  { value: "12h", label: "Reply Time", desc: "Every inquiry gets a reply within 12 hours, 7 days a week." },
  { value: "7–14 Days", label: "Website Launch", desc: "A focused website, from kickoff to live." },
  { value: "7+", label: "Years Experience", desc: "Senior craft, not junior guesswork." },
];

export const servicesIntro = {
  eyebrow: "Services",
  headingLines: ["end-to-end pixel-perfect execution."],
  engagementNote:
    "We partner with ambitious brands to design, build and grow digital experiences that drive measurable results.",
};

export const servicesCta = {
  heading: "Built with intent. Backed by results.",
  headingHighlight: "results.",
  body: "Every project starts with strategy, not templates, specifically based on your business problem — so what we ship actually moves the growth wheel for your business.",
  badges: ["NDA Friendly", "On-time Delivery", "Fixed Pricing"],
};

export const workIntro = {
  eyebrow: "selected builds",
  conceptLine: "Concept builds made to show our standard, not client work.",
  honestLine:
    "Every build below is live. Open the site, sign in to the admin panel, run Lighthouse yourself. The same standard of design, code and performance goes into every client project.",
};

export const founder = {
  eyebrow: "who's leading this",
  heading: "One senior lead. Everything handled.",
  name: "Adib Bin Shahid",
  role: "Founder & Lead",
  /** Discipline line under the role — the four things he personally covers,
   * set apart from the title so the plate reads title-then-scope. */
  roleScope: "Strategy · Design · Development · AI",
  initials: "AS",
  /* TODO(founder): drop a real portrait at /public/founder.webp and set
     `photo` to it — the monogram plate in FounderFeature is the stand-in
     until then, and it swaps automatically once this is non-null. */
  photo: "/founder.webp" as string | null,
  /** Two declarative lines about what he does on your project. The proof
   * row and credentials below carry the evidence — the copy doesn't argue. */
  bio: [
    "Adib leads strategy, creative direction, development, and delivery from the first conversation to launch. You work directly with him throughout the project, with vetted specialists brought in where deeper expertise is needed.",
    "No layers of account managers. No disappearing into a large agency. One person owns the direction, keeps the work moving, and stays accountable for the result.",
  ],
  /** Label over the credential cards — the tenure claim is stated once here
   * so the four cards stay pure discipline names. */
  credentialsLead: "7+ years of experience",
  /** Four discipline claims, one per card. Kept as plain capability
   * statements — the proof row below carries the numbers. `icon` keys into
   * the lucide map in FounderFeature so each card reads as its own
   * discipline rather than four identical ticks. */
  credentials: [
    { label: "Brand & marketing leadership", icon: "brand" },
    { label: "Full-stack web development", icon: "code" },
    { label: "AI & workflow automation", icon: "ai" },
    { label: "Creative direction & visual design", icon: "design" },
  ] as const,
  /** Proof row beside the portrait. Every figure is an existing site claim
   * (see `stats` above) restated here — nothing new is asserted. */
  proof: [
    { value: "4.9", label: "Fiverr rating", note: "Verified reviews" },
    { value: "150+", label: "Projects delivered", note: "Adib’s Fiverr track record" },
    { value: "7+", label: "Years", note: "Senior-level practice" },
  ],
};

/** The crew beat — four specialist disciplines, framed by capability
 * rather than named headcount so the copy stays true as the roster flexes
 * per project. Adib is the constant; these are the hands.
 *
 * Shaped as the nodes of one thread (brief → lead → four lanes → result)
 * because CrewThread.tsx renders the operating model as a diagram, not a
 * card grid: every key below is a node or an edge label in that diagram.
 */
export const team = {
  eyebrow: "vetted specialists",
  /** Two lines, kept separate so the diagram's headline can break exactly
   * where the argument does rather than wherever the box ends. */
  heading: ["You don’t manage specialists.", "Adib does."],
  body: "Adib owns the brief, directs the work, and keeps every moving part aligned from first conversation to final delivery.",
  /** Entry node — the client's side of the thread. */
  brief: {
    label: "Your brief",
    note: "One conversation to start.",
  },
  /** Hub node. `duties` are what Adib holds, stated as four single words so
   * they read as a responsibility set rather than a service list. */
  lead: {
    name: "Adib",
    role: "Founder & Lead",
    duties: ["Brief", "Direction", "Review", "Accountability"],
  },
  /** The four specialist nodes. `verb` is the node's headline — one word
   * per discipline, so the row reads BUILD · GROW · CREATE · AUTOMATE at a
   * glance and the technical detail stays subordinate. `status` is the
   * present-participle state that makes each node read as running, not
   * listed. AI Automation is its own discipline and never folds into
   * AI Content. */
  roles: [
    {
      verb: "Build",
      title: "Engineering",
      desc: "Full-stack development",
      detail: "Next.js · React · Supabase",
      status: "Shipping",
    },
    {
      verb: "Grow",
      title: "Digital growth",
      desc: "SEO · Paid · Lifecycle",
      detail: "Strategy and performance",
      status: "Scaling",
    },
    {
      verb: "Create",
      title: "AI content",
      desc: "Product imagery · Video",
      detail: "AI production · Content systems",
      status: "Producing",
    },
    {
      verb: "Automate",
      title: "AI automation",
      desc: "AI workflows · Automation",
      detail: "Integrations · Process systems",
      status: "Streamlining",
    },
  ],
  /** Exit node — the single thing the four lanes converge into. The three
   * `marks` are the payoff, set as their own row inside the node. */
  result: {
    label: "The output",
    title: "One result",
    marks: ["Shipped", "Reviewed", "Accountable"],
  },
  /** Closing statement under the diagram — states the coordination model
   * the nodes can't state on their own. Two lines so the second can carry
   * the emphasis. */
  closing: ["Many specialists.", "One thread."],
  note: "You get one thread, one person answering, and one person accountable for the result.",
};

/** Closing beat on /about. Positioning note: Matterpixel is a new studio,
 * but Adib is not a new operator — the copy sells limited availability and
 * senior access, never inexperience or discounting. */
export const foundingOffer = {
  eyebrow: "now open",
  body: "Matterpixel is opening its first studio roster with a limited number of clients. Every project gets Adib directly, from strategy through delivery, built with vetted specialists where deeper expertise is needed.",
  /** The founding-client offer, phrased as terms rather than a discount. */
  terms: "Founding clients also get preferred terms while the initial roster is being built.",
  micro: "Limited availability for the initial Matterpixel roster.",
};

/** Agency / white-label strip above the homepage's closing CTA. */
export const whiteLabel = {
  eyebrow: "For agencies",
  heading: "Your trusted white-label development partner.",
  body: "We build websites, web apps and AI automations white-label: your brand, NDA, no client contact. Fixed prices, with a 10–20% retainer discount based on work volume.",
  bullets: ["Your brand, NDA, no client contact", "10–20% retainer discount by work volume", "We build while you sleep"],
};

/**
 * Homepage FAQ. Every answer restates a fact already confirmed elsewhere
 * (PRODUCT.md, engagement models, packages, lib/availability) or given by
 * Adib directly (payment terms and methods) — nothing here is new.
 */
export const faq = [
  {
    q: "Where are you based?",
    a: "Dhaka, Bangladesh (GMT+6), working with clients in Europe and the US. Calls are booked in your time zone, and the time difference means your project moves forward overnight.",
  },
  {
    q: "How does payment work?",
    a: "50% upfront to start, 50% on delivery. The price is a fixed quote agreed before any work begins, so it never moves mid-project. You can pay by bank transfer, Payoneer or PayPal.",
  },
  {
    q: "Who owns what you build?",
    a: "You do. Code, design files and content are handed over to you. No lock-in, and no ongoing fees to us unless you choose the Support and Growth plan.",
  },
  {
    q: "How fast do you reply?",
    a: "Within 12 hours, 7 days a week. You talk to Adib directly, never an account manager.",
  },
  {
    q: "What happens when I need changes after launch?",
    a: "Every build includes the Support and Growth plan free for the first 6 months: updates, monitoring and fixes. After that it is $149/month, and bigger new features get their own fixed quote.",
  },
  {
    q: "Do you work with agencies?",
    a: "Yes, white-label. We build websites, web apps and AI automations under your brand, under NDA, with no client contact. Ongoing partners get a 10–20% retainer discount based on monthly work volume.",
  },
];

export const footer = {
  links: nav.links,
  description:
    "Matterpixel is a founder-led digital studio building high-performance websites, apps, and AI systems for brands that want to stand out.",
  foundingLine: "Let’s build your next win together.",
  copyright: `© ${brand.year} Matterpixel. All rights reserved.`,
  contact: {
    email: "hello@matterpixel.com",
    whatsapp: WHATSAPP_NUMBER,
    // Username, not phone: t.me/+<number> only opens for people your
    // Telegram privacy settings let find you by number.
    telegram: "adibbinshahid",
    location: "Working globally, HQ based on Dhaka",
  },
};
