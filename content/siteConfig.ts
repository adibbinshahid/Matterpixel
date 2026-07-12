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
  eyebrow: "Websites · AI Automations · Designs · Apps",
  sub: "We build high-converting websites, design, and content engineered for speed and built to stand out!",
  ctaPrimary: "Book a Free Expert Discussion",
};

export const servicesIntro = {
  eyebrow: "what we do",
  heading: "End-to-end digital, engineered for growth.",
  headingHighlight: "growth",
  engagementNote:
    "Every engagement runs senior-led with fixed quotes and a clear process — no juniors, no scope surprises.",
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

export const cta = {
  heading: "Got something that matters? Let's build it.",
  email: brand.email,
  location: brand.location,
};

export const contactReassurance = [
  "NDA-friendly",
  "Fixed quotes",
  "Senior-led",
  brand.replyPromise,
];

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
