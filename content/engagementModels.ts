export const engagementModelsIntro = {
  eyebrow: "flexible engagement models",
  heading: "choose the way we build together.",
  highlight: "we build together.",
  body: "Pick the model that fits your scope, timeline, and team. Every engagement is scoped individually after a call.",
};

export const engagementModels = [
  {
    tag: "Best for defined scope",
    title: "Fixed-Scope Project",
    desc: "Best for well-defined projects with a clear scope, timeline, and agreed deliverables — web, AI, brand, or content.",
    features: ["Defined milestones and sign-off points", "Fixed quote upfront with no surprises", "Strategy, build, QA, and delivery included"],
    cta: "Explore Plans",
    featured: false,
    image: "/WhoWeWorkFor/Digital First Businesses.webp",
  },
  {
    tag: "Most popular",
    title: "Dedicated Team",
    desc: "A team embedded in your business for evolving, longer-term work across development, AI, content, and growth.",
    features: ["Monthly engagement, scales up or down", "Design, development, AI, and QA in one team", "Direct Slack or Teams access to your assigned team"],
    cta: "Explore Plans",
    featured: true,
    image: "/WhoWeWorkFor/Digital First Businesses.webp",
  },
  {
    tag: "Best for ongoing needs",
    title: "Support and Growth",
    desc: "Keep what we've built fast, secure, and improving with an ongoing retainer covering maintenance, content, or growth.",
    features: ["Updates and monitoring on a set cadence", "Priority turnaround on requests", "Flexible scope across services, not locked to one"],
    cta: "Explore Plans",
    featured: false,
    image: "/WhoWeWorkFor/Digital First Businesses.webp",
  },
] as const;
