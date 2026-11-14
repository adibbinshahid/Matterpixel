export const engagementModelsIntro = {
  eyebrow: "Flexible engagement models",
  heading: "Choose the way we build together.",
  highlight: "we build together.",
  body: "Pick the model that fits your scope, timeline, and budget. Every engagement is scoped individually after a call.",
};

/**
 * The three models in commitment order — the order the spectrum on the
 * homepage draws them in (one project → ongoing → embedded). `anchor` is
 * the price set large on the spectrum and `anchorNote` the line under it;
 * both restate the pricing facts already agreed for each model, nothing
 * new. Growth Partner has no published price, so it anchors on its terms.
 */
export const engagementModels = [
  {
    stage: "One project",
    tag: "Best starting point",
    title: "Fixed-Scope Project",
    desc: "Best for well-defined projects with a clear scope, timeline, and agreed deliverables — web, AI, brand, or content.",
    features: ["Defined milestones and sign-off points", "Fixed quote upfront with no surprises", "Strategy, build, QA, and delivery included"],
    anchor: "From $300",
    anchorNote: "Founding-client pricing for our first 10 projects. Websites from $700.",
    featured: true,
  },
  {
    stage: "Ongoing",
    tag: "Best for ongoing needs",
    title: "Support and Growth",
    desc: "Keep what we've built fast, secure, and improving with an ongoing retainer covering maintenance, content, or growth.",
    features: ["Updates and monitoring on a set cadence", "Priority turnaround on requests", "Flexible scope across services, not locked to one"],
    anchor: "$149/mo",
    anchorNote: "First 6 months free with any build.",
    featured: false,
  },
  {
    stage: "Embedded",
    tag: "Best for long-term work",
    title: "Growth Partner",
    desc: "Ongoing builds across web, apps, software and AI, with capacity reserved for you every month.",
    features: ["Monthly engagement, scales up or down", "Priority turnaround", "Dedicated monthly capacity"],
    anchor: "Monthly",
    anchorNote: "Scoped to your roadmap, scales up or down.",
    featured: false,
  },
] as const;
