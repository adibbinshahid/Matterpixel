/**
 * Services — overview tiles + full detail pages. Edit here to update
 * deliverables, FAQ, or which demo builds a service links to.
 */

export type Service = {
  slug: string;
  id: string;
  title: string;
  shortDesc: string;
  heroClaim: string;
  intro: string;
  deliverables: string[];
  processNote: string;
  faq: { q: string; a: string }[];
  metaKeyword: string;
};

export const services: Service[] = [
  {
    slug: "web-app-development",
    id: "01",
    title: "Web & App Development",
    shortDesc:
      "Fast, resilient products built on modern frameworks — shipped clean and built to scale.",
    heroClaim: "Web and app development that ships fast and stays fast.",
    intro:
      "We build production Next.js/React applications engineered for Core Web Vitals from day one — not retrofitted after launch. Typed, componentized, and documented, so your team (or ours) can keep building on it.",
    deliverables: [
      "Next.js (App Router) or React application, fully typed",
      "Component library matched to your design system",
      "CI-ready codebase with lint/typecheck passing",
      "Performance budget held to 90+ mobile PageSpeed",
      "Handoff documentation and README",
    ],
    processNote:
      "We scope in a fixed quote before writing code, so there's no scope creep mid-build.",
    faq: [
      {
        q: "What's the typical timeline?",
        a: "A focused marketing site runs 2–4 weeks; a fuller product build runs 6–10 weeks depending on scope. We'll give you a real range after a discovery call, not a placeholder estimate.",
      },
      {
        q: "Do you work with an existing design, or design too?",
        a: "Both. We can build from your Figma files, or handle design and development together — the latter is usually faster since there's no handoff gap.",
      },
      {
        q: "What's the pricing model?",
        a: "Fixed quote per project after scoping, not open-ended hourly billing. You know the number before we start.",
      },
      {
        q: "Who actually writes the code?",
        a: "The founder, senior-led — no junior bench learning on your project.",
      },
    ],
    metaKeyword: "web development agency",
  },
  {
    slug: "product-design",
    id: "02",
    title: "UI/UX & Product Design",
    shortDesc: "Interfaces engineered around real user behavior, not trend-chasing.",
    heroClaim: "Product design that holds up under real use, not just in a mockup.",
    intro:
      "Design work grounded in hierarchy, accessibility, and how people actually behave — not the latest Dribbble trend. Every screen is designed knowing exactly how it will be built, so nothing gets lost in handoff.",
    deliverables: [
      "Full UI kit / design system in Figma",
      "Responsive layouts for every breakpoint",
      "Interaction and motion specs",
      "Accessibility review (contrast, focus states, keyboard flow)",
      "Dev-ready handoff (or straight into our own build)",
    ],
    processNote: "Design and engineering live under one roof here, so nothing gets lost between them.",
    faq: [
      {
        q: "Do you design in Figma?",
        a: "Yes — full design systems, componentized and ready for engineering handoff.",
      },
      {
        q: "Can you redesign an existing product?",
        a: "Yes. We start with an audit of what's working and what isn't before touching a single screen.",
      },
      {
        q: "Is accessibility part of the design process or an add-on?",
        a: "Built in from the first wireframe — contrast, focus order, and keyboard flow are checked at design time, not patched after launch.",
      },
    ],
    metaKeyword: "product design agency",
  },
  {
    slug: "branding-identity",
    id: "03",
    title: "Branding & Identity",
    shortDesc: "Systems that hold up across every surface, from favicon to billboard.",
    heroClaim: "Brand identity systems built to survive contact with the real world.",
    intro:
      "A logo isn't a brand. We build full identity systems — color, type, voice, and application rules — designed to hold up whether it's on a favicon or a billboard.",
    deliverables: [
      "Logo + mark, with usage guidelines",
      "Color system (sRGB + wide-gamut where relevant)",
      "Typography scale and voice guidelines",
      "Application examples across real surfaces",
      "Brand guide document",
    ],
    processNote: "We design identity systems the same way we design software — as a system, not a one-off asset.",
    faq: [
      {
        q: "Do you design logos only, or full brand systems?",
        a: "Full systems. A standalone logo without color, type, and usage rules doesn't survive real-world application.",
      },
      {
        q: "Can this pair with a web build?",
        a: "It's strongest when it does — the brand system directly informs the design tokens we ship into the actual site or product.",
      },
    ],
    metaKeyword: "branding and identity design",
  },
  {
    slug: "ai-product-photography",
    id: "04",
    title: "AI Image / Product Photography",
    shortDesc: "Studio-grade product visuals generated and refined at speed.",
    heroClaim: "Studio-quality product photography, without the studio.",
    intro:
      "Production AI image workflows for product photography — refined by hand, not raw AI output. This is a service the founder has run as a Fiverr Top Rated Seller, now offered direct.",
    deliverables: [
      "Studio-style product shots on any background/context",
      "Consistent lighting and angle across a full catalog",
      "Multiple formats sized for web, ads, and marketplaces",
      "Hand-refined output — not unedited AI generations",
    ],
    processNote: "You send real product photos or specs; we return studio-grade visuals, refined by hand.",
    faq: [
      {
        q: "Is this fully AI-generated, or edited by a person?",
        a: "AI-assisted, hand-refined. Every image goes through manual review and correction before delivery.",
      },
      {
        q: "How fast is turnaround?",
        a: "Typically days, not weeks — that speed is the entire point of the workflow.",
      },
      {
        q: "Do you need physical product samples?",
        a: "Not always — for many products we can work from reference photos or existing catalog images.",
      },
    ],
    metaKeyword: "AI product photography service",
  },
  {
    slug: "ai-video",
    id: "05",
    title: "AI Video",
    shortDesc: "Motion content produced in days, not weeks — without the crew.",
    heroClaim: "AI-produced video content, without the production crew.",
    intro:
      "Short-form and product motion content built with modern AI video tooling — a fast, affordable alternative to a full shoot, for brands that need content velocity.",
    deliverables: [
      "Product and brand motion clips, sized for social/ads",
      "Script and storyboard support",
      "Multiple cuts/aspect ratios per concept",
      "Hand-directed output — not raw AI generation",
    ],
    processNote: "Best suited for social, ads, and product marketing where speed matters more than a full crew.",
    faq: [
      {
        q: "What kind of video is this best for?",
        a: "Short-form product and brand content for social and ads — not long-form narrative film.",
      },
      {
        q: "How does pricing compare to a traditional shoot?",
        a: "Meaningfully lower, and turnaround is measured in days rather than the weeks a full production requires.",
      },
    ],
    metaKeyword: "AI video production service",
  },
  {
    slug: "seo-growth",
    id: "06",
    title: "SEO & Growth",
    shortDesc: "Technical SEO and growth loops that compound, not decay.",
    heroClaim: "Technical SEO built into the build, not bolted on after.",
    intro:
      "Sites we build are structured for search from the first commit — semantic HTML, fast Core Web Vitals, clean internal linking, and structured data. We also run technical SEO audits and growth strategy for existing sites.",
    deliverables: [
      "Technical SEO audit (Core Web Vitals, crawlability, structured data)",
      "On-page optimization and internal linking strategy",
      "Structured data (JSON-LD) implementation",
      "Content/blog structure for organic growth",
    ],
    processNote: "This is the same discipline behind this very site's structure — it's not theoretical.",
    faq: [
      {
        q: "Do you guarantee rankings?",
        a: "No one honestly can. We guarantee the technical fundamentals — speed, structure, crawlability — that rankings depend on.",
      },
      {
        q: "Can you audit a site we didn't build?",
        a: "Yes — technical SEO audits work on any codebase.",
      },
    ],
    metaKeyword: "technical SEO agency",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
