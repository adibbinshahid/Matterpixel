export const pricingIntro = {
  eyebrow: "project configurator",
  heading: "Build Your Solution",
  sub: "Choose the services you need and instantly see an estimated investment.",
};

export type PricingServiceId =
  | "web-app-development"
  | "ai-automation"
  | "branding-identity"
  | "ai-product-photography"
  | "ai-video"
  | "seo-digital-marketing";

export const pricingServices: {
  id: PricingServiceId;
  title: string;
  desc: string;
  price: number;
  weeks: number;
  deliverables: string[];
}[] = [
  {
    id: "web-app-development",
    title: "Web & App Development",
    desc: "Modern websites and web applications engineered for speed, scalability, and long-term maintainability.",
    price: 1200,
    weeks: 3,
    deliverables: ["Responsive Development", "Production-Ready Codebase"],
  },
  {
    id: "ai-automation",
    title: "AI Automation",
    desc: "Custom AI agents and workflow automation that cut manual work and connect your tools together.",
    price: 800,
    weeks: 2,
    deliverables: ["AI Workflow Automation"],
  },
  {
    id: "branding-identity",
    title: "Branding & Identity",
    desc: "Brand systems that create memorable experiences across every platform and customer interaction.",
    price: 700,
    weeks: 2,
    deliverables: ["Brand Identity System"],
  },
  {
    id: "ai-product-photography",
    title: "AI Image / Product Photography",
    desc: "AI-powered product imagery with studio-quality results, delivered in a fraction of the time.",
    price: 400,
    weeks: 1,
    deliverables: ["AI Product Photography"],
  },
  {
    id: "ai-video",
    title: "AI Video",
    desc: "Cinematic AI videos that help brands communicate faster, better, and at scale.",
    price: 550,
    weeks: 1,
    deliverables: ["AI Video Production"],
  },
  {
    id: "seo-digital-marketing",
    title: "SEO & Digital Marketing",
    desc: "Search-first strategies that improve discoverability, attract qualified traffic, and support sustainable growth.",
    price: 480,
    weeks: 1,
    deliverables: ["Technical SEO", "Growth Marketing Setup"],
  },
];

/** Included on top of whatever the selected services unlock, once at least
 * one service is selected — every engagement gets these regardless of scope. */
export const pricingBaselineDeliverables = ["Analytics Setup", "Performance Optimization"];

export type PricingScaleId = "starter" | "growth" | "scale";

export const pricingScales: {
  id: PricingScaleId;
  title: string;
  tagline: string;
  priceMultiplier: number;
  weeksMultiplier: number;
}[] = [
  { id: "starter", title: "Starter", tagline: "Launch your business.", priceMultiplier: 0.8, weeksMultiplier: 0.85 },
  { id: "growth", title: "Growth", tagline: "Generate more leads.", priceMultiplier: 1, weeksMultiplier: 1 },
  { id: "scale", title: "Scale", tagline: "Build a scalable digital platform.", priceMultiplier: 1.4, weeksMultiplier: 1.3 },
];

export const pricingBenefits = ["Dedicated Project Lead", "Growth-focused Strategy", "Future-ready Architecture"];

export const pricingDefaultSelection: PricingServiceId[] = [
  "web-app-development",
  "ai-automation",
  "seo-digital-marketing",
];
export const pricingDefaultScale: PricingScaleId = "growth";
