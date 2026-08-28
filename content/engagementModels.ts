export const engagementModelsIntro = {
  eyebrow: "flexible engagement models",
  heading: "choose the way we build together.",
  highlight: "we build together.",
  body: "Pick the model that fits your scope, timeline, and team. Every engagement is scoped individually after a call.",
};

/**
 * `imagePosition` is the `background-position` for the card photo. The photos
 * are landscape and the card is portrait, so `cover` scales them to the card's
 * height and crops roughly half the width away — which slice you get is worth
 * choosing per card rather than always taking the middle. Only the horizontal
 * half of the value does anything at these ratios: there is no vertical
 * overflow to slide through.
 */
export const engagementModels = [
  {
    tag: "Best for ongoing needs",
    title: "Support and Growth",
    desc: "Keep what we've built fast, secure, and improving with an ongoing retainer covering maintenance, content, or growth.",
    features: ["Updates and monitoring on a set cadence", "Priority turnaround on requests", "Flexible scope across services, not locked to one"],
    cta: "Explore Details",
    featured: false,
    image: "/engagement-models/support-and-growth.webp",
    imagePosition: "40% center",
  },
  {
    tag: "Most popular",
    title: "Fixed-Scope Project",
    desc: "Best for well-defined projects with a clear scope, timeline, and agreed deliverables — web, AI, brand, or content.",
    features: ["Defined milestones and sign-off points", "Fixed quote upfront with no surprises", "Strategy, build, QA, and delivery included"],
    cta: "Explore Details",
    featured: true,
    image: "/engagement-models/fixed-scope-project.webp",
    imagePosition: "45% center",
  },
  {
    tag: "Best for long-term work",
    title: "Dedicated Team",
    desc: "A team embedded in your business for evolving, longer-term work across development, AI, content, and growth.",
    features: ["Monthly engagement, scales up or down", "Design, development, AI, and QA in one team", "Direct Slack or Teams access to your assigned team"],
    cta: "Explore Details",
    featured: false,
    image: "/engagement-models/dedicated-team.webp",
    imagePosition: "58% center",
  },
] as const;
