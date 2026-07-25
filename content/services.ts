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
  /** Optional extra breakdown sections — services that omit a field just
   * skip rendering that block on the detail page. */
  capabilities?: string[];
  performance?: string[];
  integrations?: string[];
  deployment?: string[];
  ongoingSupport?: string[];
  idealFor?: string[];
  fileDeliverables?: string[];
  addOns?: string[];
  frequentlyRequested?: string[];
  whyChooseUs?: string[];
  proofNote?: string;
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
      "Modern websites and web applications engineered for speed, scalability, and long-term maintainability.",
    heroClaim: "Web and app development that ships fast and stays fast.",
    intro:
      "We build modern websites and web applications that are fast, scalable, and easy to maintain. Using Next.js and React, every project is engineered for performance, accessibility, and long-term growth, not just launch day.",
    deliverables: [
      "Next.js (App Router) or React application",
      "TypeScript-based, scalable codebase",
      "Responsive implementation across all devices",
      "Reusable component library aligned with your design system",
      "SEO and Core Web Vitals best practices",
      "CMS integration (where required)",
      "API integrations and third-party services",
      "CI-ready codebase with linting and type checks",
      "Documentation and deployment handoff",
    ],
    capabilities: [
      "Marketing websites",
      "SaaS platforms",
      "Dashboards & internal tools",
      "Landing pages",
      "E-commerce storefronts",
      "Web applications",
      "AI-powered interfaces",
      "Progressive Web Apps (PWA)",
    ],
    performance: [
      "Core Web Vitals optimization",
      "Accessibility (WCAG best practices)",
      "Technical SEO implementation",
    ],
    integrations: [
      "Headless CMS (Sanity, Contentful, Strapi, etc.)",
      "Payment gateways (Stripe, SSLCommerz, etc.)",
      "Authentication",
      "CRM integrations",
      "Analytics (GA4, PostHog, Plausible)",
    ],
    deployment: ["Vercel deployment", "Cloudflare configuration", "Custom domain setup", "SSL configuration"],
    ongoingSupport: ["Maintenance", "Feature development", "Performance monitoring", "Bug fixes"],
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
    shortDesc: "Interfaces designed around user behavior, balancing clarity, usability, and business goals.",
    heroClaim: "Product design that works beautifully because it works logically.",
    intro:
      "We design interfaces that are intuitive, accessible, and engineered around real user behavior. Every screen balances business goals, usability, and technical feasibility, ensuring the final product looks exceptional and builds exactly as intended.",
    deliverables: [
      "UX research and user flow mapping",
      "Wireframes and high-fidelity UI in Figma",
      "Design systems and reusable component libraries",
      "Responsive layouts for every breakpoint",
      "Interactive prototypes and motion specifications",
      "Accessibility review (WCAG best practices)",
      "Developer-ready handoff or direct implementation by our team",
    ],
    capabilities: [
      "Information Architecture",
      "User Journey Mapping",
      "Design Audit",
      "Dashboard & SaaS Design",
      "Mobile App Design (iOS & Android)",
      "Landing Page Optimization",
      "Micro-interactions",
      "Design QA after development",
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
    shortDesc: "Brand systems that create memorable experiences across every platform and customer interaction.",
    heroClaim: "Brand identity systems designed to stay consistent everywhere they appear.",
    intro:
      "A brand is more than a logo. We create complete identity systems that define how your business looks, sounds, and behaves across every customer touchpoint, ensuring consistency from digital products to physical experiences.",
    deliverables: [
      "Logo system (primary, secondary, symbol, favicon)",
      "Color palette with usage specifications",
      "Typography system and hierarchy",
      "Brand voice and messaging principles",
      "Iconography and graphic elements",
      "Brand application across digital and print",
      "Brand guidelines document",
      "Asset export package",
    ],
    processNote:
      "Every identity is designed as a scalable system rather than a standalone logo. From typography and color to spacing and application rules, every decision is documented so your brand remains recognizable and consistent across websites, products, packaging, social media, presentations, and print.",
    idealFor: [
      "Startups launching a new brand",
      "Companies going through a rebrand",
      "SaaS and technology products",
      "Consumer brands",
      "Service businesses",
      "Personal brands",
    ],
    fileDeliverables: [
      "Figma source files",
      "Vector logo files (SVG, PDF, EPS, AI)",
      "PNG exports",
      "Color and typography specifications",
      "Brand Guidelines PDF",
      "Social media assets (optional)",
    ],
    addOns: [
      "Naming",
      "Tagline development",
      "Brand strategy workshop",
      "Presentation template",
      "Business card & stationery",
      "Social media kit",
      "Website design",
      "Brand launch assets",
    ],
    frequentlyRequested: [
      "New brand identity",
      "Brand refresh",
      "Logo redesign",
      "Visual identity systems",
      "Design systems for growing companies",
      "Startup brand packages",
    ],
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
    shortDesc: "AI-powered product imagery with studio-quality results, delivered in a fraction of the time.",
    heroClaim: "Studio-quality product photography, without the studio.",
    intro:
      "Create premium product visuals without expensive photoshoots or long production timelines. Our AI-assisted workflow combines advanced generation with meticulous manual refinement, delivering images that are polished, consistent, and ready for commercial use.",
    deliverables: [
      "Studio-style product photography on any background",
      "Lifestyle and contextual product scenes",
      "Consistent lighting, shadows, and perspective",
      "Multiple angles and compositions",
      "Marketplace, website, and social media formats",
      "High-resolution commercial-ready exports",
      "Hand-refined images, never raw AI generations",
    ],
    idealFor: [
      "E-commerce brands",
      "FMCG products",
      "Cosmetics & skincare",
      "Fashion & accessories",
      "Amazon and marketplace sellers",
      "Startups launching new products",
    ],
    fileDeliverables: [
      "High-resolution PNG/JPG exports",
      "Optimized versions for web and social",
      "Transparent-background product images (if required)",
      "Lifestyle marketing visuals",
      "Multiple aspect ratios for advertising platforms",
    ],
    whyChooseUs: [
      "Faster than traditional studio photography",
      "No studio rental or production logistics",
      "Consistent visuals across an entire product catalog",
      "Easy to update for campaigns and seasonal promotions",
      "Optimized for websites, marketplaces, and digital advertising",
    ],
    processNote:
      "Every image begins with an AI-assisted production workflow and is then refined manually for realism, lighting, composition, and brand consistency. The result is commercial-quality imagery that looks intentional rather than obviously AI-generated.",
    proofNote:
      "This workflow has been refined through hundreds of commercial projects delivered as a Fiverr Top Rated Seller, and is now available directly through Matterpixel.",
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
    shortDesc: "Cinematic AI videos that help brands communicate faster, better, and at scale.",
    heroClaim: "AI-powered video production, without the production crew.",
    intro:
      "Create high-quality marketing videos in days instead of weeks. Our AI-assisted production workflow combines scripting, motion design, and manual direction to produce polished videos that are ready for campaigns, social media, and product launches.",
    deliverables: [
      "Product showcase videos",
      "Social media short-form content",
      "AI avatars and voiceovers (optional)",
      "Script and storyboard development",
      "Motion graphics and text animation",
      "Multiple aspect ratios for every platform",
      "Hand-directed editing and refinement",
      "Commercial-ready exports",
    ],
    idealFor: [
      "Product launches",
      "Social media campaigns",
      "E-commerce brands",
      "SaaS demonstrations",
      "Brand storytelling",
      "Paid advertising",
    ],
    fileDeliverables: [
      "Export in any aspect ratio",
      "Platform-optimized versions",
      "Caption-ready files",
      "Thumbnail frames",
      "Source project (where applicable)",
    ],
    whyChooseUs: [
      "Launch campaigns faster",
      "Eliminate costly production logistics",
      "Create more content with the same budget",
      "Maintain visual consistency across campaigns",
      "Scale content production as your brand grows",
    ],
    processNote:
      "Every video begins with concept development and AI-assisted production, then undergoes manual refinement for pacing, storytelling, transitions, sound, and visual consistency. The result is content that feels intentional and brand-ready rather than obviously AI-generated.",
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
    title: "SEO & Digital Marketing",
    shortDesc:
      "Search-first strategies that improve discoverability, attract qualified traffic, and support sustainable growth.",
    heroClaim: "Digital growth driven by strategy, search, and performance marketing.",
    intro:
      "Growing online takes more than great design. We help brands attract, engage, and convert through technical SEO, content strategy, social media, paid advertising, and data-driven marketing campaigns, all aligned around measurable business outcomes.",
    deliverables: [
      "Technical SEO audit and optimization",
      "On-page SEO and keyword strategy",
      "Google Ads and Meta Ads campaign management",
      "Social media strategy and content creation",
      "Social media post design and scheduling",
      "Content planning and copywriting",
      "Analytics, conversion tracking, and reporting",
      "Landing page optimization",
      "Email marketing campaigns",
      "Monthly growth strategy and performance reviews",
    ],
    idealFor: [
      "Businesses launching a new brand",
      "Companies looking to increase online visibility",
      "E-commerce stores",
      "Service-based businesses",
      "SaaS startups",
      "Brands scaling paid and organic marketing",
    ],
    fileDeliverables: [
      "SEO implementation roadmap",
      "Monthly performance reports",
      "Content calendar",
      "Social media creative assets",
      "Ad creatives and campaign setup",
      "Keyword research and competitor analysis",
      "Conversion tracking configuration",
      "Growth recommendations",
    ],
    whyChooseUs: [
      "One partner for SEO, content, social media, and paid advertising",
      "Data-driven decisions backed by analytics",
      "Consistent brand messaging across every channel",
      "Campaigns optimized for measurable business growth",
      "Clear reporting with actionable insights",
    ],
    processNote:
      "Every growth strategy starts with understanding your business goals, audience, and competitive landscape. From technical SEO and content creation to social media management and paid advertising, we focus on building a sustainable marketing system that attracts the right audience and converts them into customers.",
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
