/**
 * Services page — the credibility layer.
 *
 * FACTUAL RULE FOR THIS FILE (read before editing):
 * every value below is either (a) restated verbatim from an existing
 * truthful claim in siteConfig.ts / projects.ts, or (b) a positioning
 * statement that asserts no measurable fact. Nothing here introduces a new
 * number, client name, testimonial, or outcome.
 *
 * Specifically NOT here, and deliberately so:
 *  - named client brands. prd.md §142 lists Meril / Square Toiletries /
 *    LAFZ / kool / WhitePlus as *placeholder* logo-row copy ("use text/SVG
 *    placeholders labeled for real logos"), and prd.md §121 labels the
 *    "+42%" figure a "Sample claim". siteConfig.trust already records that
 *    Matterpixel has no client logos yet. Until a relationship is
 *    verifiable, this page proves itself with standards it can be held to
 *    instead of names it can't.
 *  - client-outcome percentages, for the same reason.
 */

/* ── §2 Trust: the standard ──────────────────────────────────────────────
   Replaces a logo wall. The evidence is the set of commitments a client
   can hold the studio to on day one — each one already stated in
   siteConfig.trust.badges or siteConfig.stats, restated here as a ledger
   row rather than a badge pill. */
export const standard = {
  eyebrow: "the standard",
  /** Split across two lines so the emphasis lands on the second. */
  heading: ["Built for brands", "with something to prove."],
  /** States plainly why there is no logo wall here. Honesty is the proof
   * signal — see siteConfig.trust's own note. */
  note: "No borrowed logos. No invented case studies. What follows is what you can hold us to before a single line of code is written.",
  /** Five commitments, each a `value` (the thing being promised) and a
   * `terms` line (what it actually obligates). Index numbers are part of
   * the composition, not decoration. */
  entries: [
    {
      id: "01",
      value: "90+ PageSpeed",
      terms: "Every build ships at a 90+ Google PageSpeed score, or it isn't finished.",
    },
    {
      id: "02",
      value: "Fixed quote",
      terms: "Scoped and priced before code. No surprise budget increase mid-build.",
    },
    {
      id: "03",
      value: "Top Rated Seller",
      terms: "Fiverr Top Rated Seller — a rating earned across delivered commercial work.",
    },
    {
      id: "04",
      value: "NDA friendly",
      terms: "Comfortable working under NDA from the first conversation onward.",
    },
    {
      id: "05",
      value: "24h reply",
      terms: "Every inquiry gets a same-day reply. No exceptions, no queue.",
    },
  ],
};

/* ── §3 Proof board ──────────────────────────────────────────────────────
   Numbers as architecture, not a stat-card row. Each figure below is
   lifted straight from siteConfig.stats — same value, same meaning.
   `scale` drives the typographic weight in the composition (1 = largest);
   `bleed` marks the two figures that run off the right edge. */
export const proofBoard = {
  eyebrow: "backed by results",
  heading: ["Built with intent.", "Backed by results."],
  body: "Every project starts with strategy, not templates, specifically based on your business problem — so what we ship actually moves the growth wheel for your business.",
  metrics: [
    {
      value: "7+",
      unit: "years",
      label: "Senior practice",
      note: "Craft compounded over time, not junior guesswork.",
      scale: 1,
      bleed: false,
    },
    {
      value: "150+",
      unit: "projects",
      label: "Delivered",
      note: "Real work, shipped and live.",
      scale: 1,
      bleed: true,
    },
    {
      value: "15+",
      unit: "industries",
      label: "Served",
      note: "Solo founders and SMEs through to large corporations.",
      scale: 2,
      bleed: false,
    },
    {
      value: "4.9",
      unit: "rating",
      label: "Verified reviews",
      note: "Across delivered commercial work.",
      scale: 2,
      bleed: false,
    },
    {
      value: "90+",
      unit: "pagespeed",
      label: "Guaranteed",
      note: "The performance floor every build has to clear.",
      scale: 3,
      bleed: false,
    },
    {
      value: "24h",
      unit: "reply",
      label: "Guaranteed",
      note: "Same-day, every inquiry.",
      scale: 3,
      bleed: false,
    },
  ],
};

/* ── §5 Founder ──────────────────────────────────────────────────────────
   Editorial composition, not a profile card. Every credential restates
   siteConfig.founder. */
export const founderEditorial = {
  /** Positions Adib as the person absorbing the project's stress, not just
   * "who does the work" — the point the section makes is that one senior
   * lead means nothing falls through, not merely who's on the roster. */
  eyebrow: "one lead, zero stress",
  /** Three lines, broken where the argument breaks. */
  heading: ["Built by someone", "who understands both", "the business and the pixels."],
  /** Typographic annotations scattered around the composition — the detail
   * that makes the section read as authored rather than templated. All
   * factual: location from brand.location. */
  annotations: [
    { label: "Base", value: "Dhaka — working globally" },
    { label: "Accountable to", value: "You, directly" },
  ],
  /** Two sentences, not four — same claim as siteConfig.founder.bio,
   * compressed to what fits the compact composition. */
  body: "Adib leads strategy, creative direction, development and delivery end to end, with a specialist crew behind him where deeper expertise is needed. No account managers — one person owns the direction and stays accountable for the result.",
  cta: { label: "Talk to Adib directly", href: "/contact?tab=booking" },
};

/* ── §6 Process ──────────────────────────────────────────────────────────
   The studio's actual operating sequence, at a higher altitude than the
   homepage's meeting-by-meeting version (siteConfig.processSteps) — same
   five beats, described as method rather than calendar. */
export const processMethod = {
  eyebrow: "how we build",
  heading: "proven workflow, not guesswork.",
  steps: [
    {
      id: "01",
      title: "Diagnose",
      desc: "Understand the business, the audience, and the actual problem.",
      detail:
        "Before scope, before design. We find what's costing you money or attention — and say so plainly if the thing you asked for isn't it.",
      output: "Problem statement",
    },
    {
      id: "02",
      title: "Define",
      desc: "Turn the problem into a clear product, creative and technical direction.",
      detail:
        "Scope, architecture and creative direction land together in one fixed quote, so there's nothing left to renegotiate mid-build.",
      output: "Fixed scope & quote",
    },
    {
      id: "03",
      title: "Prototype",
      desc: "Make the experience tangible before committing to production.",
      detail:
        "You react to a working thing, not a slide. Direction changes are cheap here and expensive later — which is exactly why this step exists.",
      output: "Working prototype",
    },
    {
      id: "04",
      title: "Build",
      desc: "Design, develop and integrate with production-level attention to detail.",
      detail:
        "Typed, componentized, accessible, and held to the 90+ PageSpeed floor throughout — not optimized as a cleanup pass at the end.",
      output: "Production build",
    },
    {
      id: "05",
      title: "Launch",
      desc: "Ship, test and refine.",
      detail:
        "Deployment, analytics and handoff documentation. Then we watch real usage and tighten what the data says needs tightening.",
      output: "Live, measured, documented",
    },
  ],
};
