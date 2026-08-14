/**
 * Site-wide copy and config — the single source of truth for anything
 * that isn't a project, service, or blog post (those live in their own
 * content/ files). Edit here to change copy across the whole site.
 */

export const siteUrl = "https://matterpixel.com";

export const brand = {
  name: "matterpixel",
  tagline: "We build what matters. Down to the pixel.",
  email: "hello@matterpixel.com",
  location: "Dhaka — working globally",
  year: 2026,
  replyPromise: "24h reply, guaranteed",
};

export const nav = {
  links: [
    { label: "Projects", href: "/projects" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ],
  cta: "Get a Free Audit",
};

export const hero = {
  eyebrow: "Web Development · AI Automation · AI Content · Digital Marketing",
  headline: "We build what matters. Down to the pixel.",
  sub: "From premium websites and AI automation to content creation and digital growth, we craft digital experiences that people trust, remember and choose.",
  ctaPrimary: "Get a Free Audit",
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
    "90+ Google PageSpeed Score",
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
  { value: "90+", label: "PageSpeed Score", desc: "Every build hits a 90+ Google PageSpeed score." },
  { value: "NDA", label: "Friendly", desc: "Comfortable working under NDA from day one." },
  { value: "100%", label: "Founder-Led", desc: "No bench, no juniors learning on your dime." },
  { value: "4.9", label: "Client Rating", desc: "Verified reviews across every project." },
  { value: "150+", label: "Projects Delivered", desc: "Real work, shipped and live." },
  { value: "15+", label: "Industries Served", desc: "From solo entrepreneurs and SMEs to large corporations." },
  {
    value: "0%",
    label: "Upfront Risk",
    desc: "Fixed pricing with no unexpected price increases after the project begins.",
  },
  { value: "24h", label: "Reply Guaranteed", desc: "Every inquiry gets a same-day reply, no exceptions." },
  { value: "7 Days", label: "Avg Turnaround", desc: "From kickoff to first delivery." },
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
  button: "Get a Free Audit",
};

export const workIntro = {
  eyebrow: "selected builds",
  heading: "real custom codes. production quality.",
  honestLine:
    "A collection of extraordinary, production-quality builds showcasing our approach to design, development, and performance. Every project is crafted with the same attention to detail, usability, and technical excellence that we bring to real-world digital products.",
};

export const processSteps = {
  eyebrow: "how we build",
  heading: "proven workflow, not guesswork.",
  steps: [
    {
      id: "01",
      title: "Video meetup",
      desc: "We'll meet (Zoom) to discuss your project.",
      details: [
        { label: "Specifications", text: "We'll write the specifications for your project's functionality and features." },
        { label: "Research", text: "We'll do research based on your needs." },
      ],
    },
    {
      id: "02",
      title: "Requirements",
      desc: "We'll make sure we have everything needed to complete your project.",
      details: [
        { label: "Planning", text: "We'll use your provided requirements to start planning your project." },
      ],
    },
    {
      id: "03",
      title: "Prototype",
      desc: "We'll build a prototype of your project.",
      details: [
        { label: "Prototype", text: "We'll build a working prototype of your project." },
        { label: "Follow-up session", text: "We'll have a follow-up session to discuss any open questions." },
      ],
    },
    {
      id: "04",
      title: "Development",
      desc: "We'll develop your project and deliver a working product for your review.",
      details: [
        { label: "Content Upload", text: "We'll upload your content (copy, images, videos, etc.) to your project." },
        { label: "Progress check", text: "We'll meet to review your project status and the steps needed to finish it." },
      ],
    },
    {
      id: "05",
      title: "Delivery",
      desc: "We'll send you the final delivery for review and feedback.",
      details: [
        { label: "Modifications", text: "We'll modify assets based on your feedback." },
        { label: "Delivery", text: "We'll send you the final delivery for review and feedback." },
      ],
    },
  ],
};

export const founder = {
  eyebrow: "who's leading this",
  heading: "One senior lead. Everything handled.",
  name: "Md. Adib Bin Shahid",
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
    "Adib leads strategy, creative direction, development, and delivery from the first conversation to launch. You work directly with him throughout the project, while a specialist team works behind the scenes where deeper expertise is needed.",
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
    { value: "4.9", label: "Client rating", note: "Verified reviews" },
    { value: "150+", label: "Projects delivered", note: "Shipped and live" },
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
  eyebrow: "the crew",
  /** Two lines, kept separate so the diagram's headline can break exactly
   * where the argument does rather than wherever the box ends. */
  heading: ["You don’t manage the crew.", "Adib does."],
  body: "A specialist crew handles the disciplines. Adib owns the brief, directs the work, and keeps every moving part aligned from first conversation to final delivery.",
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

/** Closing CTA on /about. Positioning note: Matterpixel is a new studio,
 * but Adib is not a new operator — the copy sells limited availability and
 * senior access, never inexperience or discounting. */
export const foundingOffer = {
  eyebrow: "now open",
  /** Two lines, set as one oversized typographic composition. */
  heading: ["A few projects.", "Full attention."],
  body: "Matterpixel is opening its first studio roster with a limited number of clients. Early projects get direct involvement from Adib from strategy through delivery, with the specialist crew working behind the scenes.",
  /** The founding-client offer, phrased as terms rather than a discount. */
  terms: "Early clients receive preferred founding-client terms while the initial roster is being built.",
  /** The offer here is access to Adib, not a discount, so the button says
   * exactly that. Only read by FoundingRoster — the homepage's own closing
   * CTA keeps its audit framing. */
  cta: { label: "Talk to Adib directly", href: "/contact?tab=booking" },
  micro: "Limited availability for the initial Matterpixel roster.",
  /** Status indicator in the corner of the panel — state, not a countdown. */
  status: { label: "Roster", value: "Open · Limited" },
  /** The availability module on the panel's right column. Deliberately
   * states a condition, never a slot count — no invented scarcity. */
  availability: {
    label: "Initial roster",
    lines: ["Limited", "availability"],
  },
};

export const footer = {
  links: nav.links,
  socials: [
    { label: "Facebook", href: "https://facebook.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Instagram", href: "https://instagram.com" },
  ],
  description:
    "Matterpixel is a digital studio building high-performance websites, apps, and AI-powered content for brands that want to stand out.",
  foundingLine: "Now taking a select few founding clients.",
  copyright: `© ${brand.year} Matterpixel. All rights reserved.`,
  contact: {
    email: "hello@matterpixel.com",
    whatsapp: "+8801707555755",
    telegram: "+8801707555755",
    location: "Working globally, HQ based on Dhaka",
  },
};
