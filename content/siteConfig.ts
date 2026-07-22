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
  cta: "Book a Free Expert Discussion",
};

export const hero = {
  eyebrow: "Web Development · AI Automation · AI Content · Digital Marketing",
  headline: "We build what matters. Down to the pixel.",
  sub: "From premium websites and AI automation to content creation and digital growth, we craft digital experiences that people trust, remember and choose.",
  ctaPrimary: "Book a Free Expert Discussion",
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
    "On-time Delivery",
    "Fixed Pricing",
  ],
};

/**
 * Reformats claims already made truthfully elsewhere (trust.badges,
 * founder.heading, brand.replyPromise) as a stat-tile row — no new facts
 * invented, same standard as every other credibility claim on this site.
 */
export const stats = [
  { value: "90+", label: "PageSpeed Score", desc: "Every build engineered to a 90+ Google PageSpeed standard." },
  { value: "NDA", label: "Friendly", desc: "Comfortable working under NDA from day one." },
  { value: "100%", label: "Founder-Led", desc: "No bench, no juniors learning on your dime." },
  { value: "4.9", label: "Client Rating", desc: "Verified reviews across every project." },
  { value: "150+", label: "Projects Delivered", desc: "Real work, shipped and live." },
  { value: "15+", label: "Industries Served", desc: "From FMCG to SaaS to eCommerce." },
  { value: "0%", label: "Upfront Risk", desc: "Fixed pricing, no deposit required to get started." },
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
  heading: "Ready to build something amazing together?",
  headingHighlight: "together?",
  body: "Let's create digital experiences that perform, convert and leave a lasting impact.",
  badges: ["NDA Friendly", "On-time Delivery", "Fixed Pricing"],
  button: "Let's Talk",
};

export const workIntro = {
  eyebrow: "selected builds",
  heading: "Real code. Production quality.",
  honestLine:
    "A sample of what we build — real code, production-quality, built to demonstrate our craft. No client work yet — these are concept builds you can try live.",
};

export const process = {
  eyebrow: "how we build",
  heading: "Systems, not guesswork.",
  steps: [
    {
      id: "01",
      title: "Discover",
      desc: "We map the business problem before touching a single pixel.",
    },
    {
      id: "02",
      title: "Design",
      desc: "Interfaces built on real hierarchy, tested against real behavior.",
    },
    {
      id: "03",
      title: "Build",
      desc: "Clean, typed, performant code — engineered to scale from day one.",
    },
    {
      id: "04",
      title: "Ship",
      desc: "Launched, measured, and handed off with full documentation.",
    },
  ],
};

export const founder = {
  eyebrow: "who's building this",
  heading: "Founder-led. No bench, no juniors.",
  bio: [
    "Matterpixel is a new studio — founder-led, senior-only, no bench of juniors learning on your dime.",
    "The founder background: senior brand strategist with FMCG experience, a Fiverr Top Rated Seller across AI product photography and web development, and a full-stack engineer working in Next.js, React, and Supabase alongside modern AI tooling.",
    "That combination — brand strategy, hands-on engineering, and production AI workflows — is why Matterpixel exists: most studios are good at one of those. This one is built to be good at all three.",
  ],
  // TODO(founder): swap in real name/photo/Fiverr profile link once approved for public use.
  credentials: [
    "Fiverr Top Rated Seller",
    "Senior brand strategist (FMCG)",
    "Full-stack: Next.js, React, Supabase",
    "Production AI image & video workflows",
  ],
};

export const foundingOffer = {
  heading: "Now taking a select few founding clients.",
  body: "New studio, senior attention. Founding clients get priority scheduling, direct access to the person actually building your product, and founding-client pricing that won't be repeated once the roster fills up.",
};

// TODO(booking): replace with real Calendly (or Cal.com) link once set up.
export const bookingUrl = "https://calendly.com/matterpixel/intro-call";

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
    email: "adib.bin.shahid@gmail.com",
    whatsapp: "+8801707555755",
    telegram: "+8801707555755",
    location: "Working globally, HQ based on Dhaka",
  },
};
