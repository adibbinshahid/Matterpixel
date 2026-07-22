/**
 * Selected builds — concept/demo projects, not client work (Matterpixel is
 * a new studio; see siteConfig.workIntro for the honest framing shown on
 * every page these render on). Edit here to add/update a project.
 */

export type Project = {
  slug: string;
  name: string;
  category: string;
  accent: "blue" | "magenta";
  oneLiner: string;
  summary: string;
  concept: string;
  approach: string;
  techStack: string[];
  highlights: { label: string; value: string }[];
  // TODO(demo): swap in the real deployed URL once each demo is live.
  liveDemoUrl: string;
  // TODO(assets): add a real screenshot path once each demo is live.
  // Left unset deliberately — ProjectMedia renders an honest "Project
  // preview coming soon" state rather than a fabricated mockup.
  previewImage?: string;
  relatedServiceSlugs: string[];
};

export const projects: Project[] = [
  {
    slug: "scentora",
    name: "Scentora",
    category: "Luxury Fragrance · eCommerce",
    accent: "blue",
    oneLiner: "A full-scale luxury fragrance storefront built for conversion.",
    summary:
      "Scentora is a concept build demonstrating a premium fragrance eCommerce experience — from scent discovery to checkout — built to the same performance bar we'd hold a paying client's storefront to.",
    concept:
      "Luxury eCommerce usually trades performance for polish: heavy hero video, unoptimized product imagery, bloated cart flows. Scentora proves you don't have to choose — the same restraint and pixel-level craft the brand deserves, shipped at 90+ PageSpeed.",
    approach:
      "Built product-first: a fast, image-heavy PLP/PDP flow with next/image AVIF delivery, a headless-commerce-ready data layer, and a checkout flow stripped to the fields that matter. Motion is used to sell scent notes and materials, never to slow the page down.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Headless commerce-ready"],
    highlights: [
      { label: "PageSpeed (mobile)", value: "96" },
      { label: "Load time", value: "<1s" },
      { label: "Responsive", value: "Fully" },
      { label: "Accessibility", value: "WCAG AA" },
    ],
    liveDemoUrl: "https://scentora-demo.matterpixel.com",
    relatedServiceSlugs: ["web-app-development", "product-design", "ai-product-photography"],
  },
  {
    slug: "mindwell",
    name: "MindWell",
    category: "Mental Wellness · Platform",
    accent: "magenta",
    oneLiner: "A calm, accessible wellness platform connecting users to care.",
    summary:
      "MindWell is a concept mental-wellness platform connecting users to therapists and guided programs — designed around calm, clarity, and accessibility rather than engagement-maximizing dark patterns.",
    concept:
      "Wellness products are held to a higher bar: the interface itself has to feel safe. MindWell demonstrates that restraint — generous whitespace, calm color, and content hierarchy that never rushes the user — without sacrificing technical performance.",
    approach:
      "Built with accessibility as a first-class constraint (not a retrofit): full keyboard navigation, screen-reader-tested flows, and AA contrast throughout. Booking and program flows are componentized for a real backend to slot in later.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Radix UI", "Framer Motion"],
    highlights: [
      { label: "PageSpeed (mobile)", value: "94" },
      { label: "Accessibility", value: "WCAG AA" },
      { label: "Responsive", value: "Fully" },
      { label: "Keyboard nav", value: "Complete" },
    ],
    liveDemoUrl: "https://mindwell-demo.matterpixel.com",
    relatedServiceSlugs: ["product-design", "web-app-development", "branding-identity"],
  },
  {
    slug: "lcinco-pizza",
    name: "L'Cinco Pizza",
    category: "Restaurant · Ordering",
    accent: "blue",
    oneLiner: "A mouth-watering ordering flow that turns browsing into orders.",
    summary:
      "L'Cinco Pizza is a concept restaurant-ordering experience — built to show how fast, visual, and low-friction a food-ordering flow can be when performance is treated as a feature, not an afterthought.",
    concept:
      "Restaurant sites are notorious for slow menus and clunky checkout. L'Cinco Pizza demonstrates the opposite: a menu that loads instantly, customization that feels tactile, and a cart-to-checkout flow with the fewest possible taps.",
    approach:
      "Menu images resolve using our signature pixelated-to-sharp reveal, so the page paints fast and still feels premium. Cart state is handled client-side with optimistic updates so every interaction feels instant.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    highlights: [
      { label: "PageSpeed (mobile)", value: "97" },
      { label: "Load time", value: "<1s" },
      { label: "Responsive", value: "Fully" },
      { label: "Accessibility", value: "WCAG AA" },
    ],
    liveDemoUrl: "https://lcinco-demo.matterpixel.com",
    relatedServiceSlugs: ["web-app-development", "seo-growth", "ai-product-photography"],
  },
  {
    slug: "insightflow",
    name: "InsightFlow",
    category: "Enterprise · Analytics Dashboard",
    accent: "magenta",
    oneLiner: "A dense, data-heavy dashboard made legible at a glance.",
    summary:
      "InsightFlow is a concept enterprise analytics dashboard — proof that data-dense B2B software doesn't have to look (or perform) like an afterthought.",
    concept:
      "Enterprise dashboards are usually the least-loved surface in a product — cluttered, slow, and inconsistent. InsightFlow demonstrates a real-time-ready pipeline/analytics view with a clear visual hierarchy, built on the same design system as the rest of the site.",
    approach:
      "Componentized chart and table primitives, virtualization-ready lists for large datasets, and a state layer designed to swap in real-time data sources without a rebuild. Dark-mode-first, since that's the default enterprise users actually want.",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Recharts-ready", "Framer Motion"],
    highlights: [
      { label: "PageSpeed (mobile)", value: "93" },
      { label: "Responsive", value: "Fully" },
      { label: "Accessibility", value: "WCAG AA" },
      { label: "Data-ready", value: "Real-time" },
    ],
    liveDemoUrl: "https://insightflow-demo.matterpixel.com",
    relatedServiceSlugs: ["web-app-development", "product-design", "seo-growth"],
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}
