/**
 * The service finder (components/services/ServiceFinder.tsx): problem-led
 * packages, the build-your-own stack, and the pure helpers that price a
 * stack. The helpers live here, not in a component, because the contact
 * page runs the same maths on the server to pre-fill the inquiry from
 * `?stack=` — one source, so the quote a visitor saw is the quote we get.
 *
 * Prices must match the pitch deck and content/services.ts. Before/after
 * stats are typical outcomes for the package, shown under a "Typical"
 * label — they are not results from a named client.
 */

/** A number that counts up on reveal. `decimals` keeps 6.2 from rendering
 * as 6 mid-count; `unit` sits beside it, `label` under it. */
export type Stat = { value: number; decimals?: number; unit: string; label: string };

import { BUDGET_OPTIONS, isServiceSlug, serviceLabel, type PROJECT_TYPE_OPTIONS, type ServiceSlug } from "@/lib/schema";

type ProjectType = (typeof PROJECT_TYPE_OPTIONS)[number];

export type ProblemPackage = {
  slug: string;
  /** The chip — the visitor's own words. */
  problem: string;
  name: string;
  headline: string;
  /** Stat tiles, or the before/after image for the visuals package. */
  beforeAfter:
    | { kind: "stats"; before: Stat; after: Stat }
    | { kind: "image"; src: string; alt: string; before: string; after: string };
  items: string[];
  timeline: string;
  priceFrom: number;
  /** Answers the inquiry's "what do you need" question for a visitor who
   * arrives from this package, so that step is skipped. */
  projectTypes: ProjectType[];
  /** Proof card. The project is resolved on the server (name, cover,
   * measured Lighthouse score) so this file never hand-writes a score.
   * Omitted when no published build actually shows this package's work —
   * `noProofNote` then says so plainly instead of borrowing a build. */
  proof?: { projectSlug: string; label?: string };
  noProofNote?: string;
};

export const problemPackages: ProblemPackage[] = [
  {
    slug: "fast-site",
    problem: "My site is slow or looks dated",
    name: "Fast Site",
    headline: "A site that loads in under a second and sells.",
    beforeAfter: {
      kind: "stats",
      before: { value: 6.2, decimals: 1, unit: "s", label: "load time" },
      after: { value: 0.8, decimals: 1, unit: "s", label: "load time" },
    },
    items: [
      "Custom design",
      "Mobile-first build",
      "90+ PageSpeed minimum",
      "Basic SEO setup",
      "6 months free support",
    ],
    timeline: "7–14 days",
    priceFrom: 700,
    projectTypes: ["New website"],
    proof: { projectSlug: "shopsphere" },
  },
  {
    slug: "lead-engine",
    problem: "Leads wait hours for a reply",
    name: "Lead Engine",
    headline: "Every lead answered in seconds, booked automatically.",
    beforeAfter: {
      kind: "stats",
      before: { value: 4, unit: "h", label: "to reply" },
      after: { value: 30, unit: "s", label: "to reply" },
    },
    items: [
      "Fast Site included",
      "AI chat + WhatsApp replies",
      "Booking + reminders",
      "CRM pipeline",
      "Automatic follow-ups",
    ],
    timeline: "14–21 days",
    priceFrom: 1200,
    projectTypes: ["New website", "AI automation"],
    proof: { projectSlug: "mindwell" },
  },
  {
    slug: "ops-automation",
    problem: "My team drowns in manual work",
    name: "Ops Automation",
    headline: "Stop copy-paste. Let workflows run the busywork.",
    beforeAfter: {
      kind: "stats",
      before: { value: 10, unit: "h/week", label: "manual work" },
      after: { value: 1, unit: "h/week", label: "manual work" },
    },
    items: [
      "Process mapping",
      "n8n + AI workflows",
      "Connects Sheets, CRM and store",
      "Invoices and reports on autopilot",
      "You own every workflow",
    ],
    timeline: "7–14 days",
    priceFrom: 500,
    projectTypes: ["AI automation"],
    noProofNote:
      "No public automation build yet: workflows run inside a business's own tools. On the free audit call we map yours and show where the hours go.",
  },
  {
    slug: "brand-visuals",
    problem: "My brand looks like everyone else",
    name: "AI Product Visuals",
    headline: "Look premium without a photoshoot.",
    beforeAfter: {
      kind: "image",
      src: "/projects/ai-product-photography/03.webp",
      alt: "A face-cream jar photographed on a table, beside the campaign visual made from it.",
      before: "Phone photo",
      after: "Campaign visual",
    },
    items: [
      "AI product visuals",
      "Video ads",
      "Social kit",
      "Usage rights included",
      "Full brand identity as an add-on",
    ],
    timeline: "5–10 days",
    priceFrom: 300,
    projectTypes: ["AI visuals & video"],
    proof: { projectSlug: "ai-product-photography", label: "AI visuals gallery" },
  },
];

export function getProblemPackage(slug: string | undefined) {
  return problemPackages.find((p) => p.slug === slug);
}

/* ── Build your own stack ────────────────────────────────────────────── */

export type StackIcon =
  | "website"
  | "webapp"
  | "chatbot"
  | "whatsapp"
  | "crm"
  | "booking"
  | "software"
  | "branding"
  | "visuals"
  | "seo"
  | "care";

export type StackItem = {
  id: string;
  icon: StackIcon;
  name: string;
  benefit: string;
  /** One-off price range in USD. Omitted for custom-quoted items. */
  price?: { min: number; max: number };
  /** Custom-quoted: adds "+ custom quote" to the total instead of a range. */
  custom?: boolean;
  /** Recurring item — shown beside the one-off total, never summed into it. */
  monthly?: { price: number; note: string };
  /** Typical delivery window in days. Planning estimates for the timeline
   * line, not commitments — the quote fixes the real date. */
  days?: { min: number; max: number };
  /** The inquiry project type this item answers. Omitted for the care
   * plan, which is an add-on rather than a project. */
  projectType?: ProjectType;
};

export const stackItems: StackItem[] = [
  {
    id: "website",
    projectType: "New website",
    icon: "website",
    name: "Website",
    benefit: "Fast, mobile-first site built to convert.",
    price: { min: 700, max: 1500 },
    days: { min: 7, max: 14 },
  },
  {
    id: "web-app",
    projectType: "Web app",
    icon: "webapp",
    name: "Web app",
    benefit: "Logins, dashboards and workflows, built custom.",
    price: { min: 700, max: 3000 },
    days: { min: 21, max: 42 },
  },
  {
    id: "ai-chatbot",
    projectType: "AI automation",
    icon: "chatbot",
    name: "AI chatbot",
    benefit: "Answers customers 24/7, trained on your business.",
    price: { min: 300, max: 600 },
    days: { min: 5, max: 10 },
  },
  {
    id: "whatsapp",
    projectType: "AI automation",
    icon: "whatsapp",
    name: "WhatsApp automation",
    benefit: "Auto-replies, order updates and reminders.",
    price: { min: 300, max: 700 },
    days: { min: 5, max: 10 },
  },
  {
    id: "crm",
    projectType: "AI automation",
    icon: "crm",
    name: "CRM & pipeline",
    benefit: "Every lead tracked from first message to sale.",
    price: { min: 400, max: 900 },
    days: { min: 7, max: 14 },
  },
  {
    id: "booking",
    projectType: "AI automation",
    icon: "booking",
    name: "Booking system",
    benefit: "Online booking with automatic reminders.",
    price: { min: 300, max: 600 },
    days: { min: 5, max: 10 },
  },
  {
    id: "business-software",
    projectType: "Business software",
    icon: "software",
    name: "Business software",
    benefit: "ERPs, internal tools and portals, scoped to you.",
    custom: true,
    days: { min: 21, max: 45 },
  },
  {
    id: "branding",
    projectType: "Branding & identity",
    icon: "branding",
    name: "Branding",
    benefit: "Logo, colour and type that set you apart.",
    price: { min: 600, max: 1200 },
    days: { min: 7, max: 14 },
  },
  {
    id: "ai-visuals",
    projectType: "AI visuals & video",
    icon: "visuals",
    name: "AI visuals & video",
    benefit: "Campaign-grade product imagery and video ads.",
    price: { min: 300, max: 800 },
    days: { min: 5, max: 10 },
  },
  {
    id: "seo",
    projectType: "SEO & marketing",
    icon: "seo",
    name: "SEO setup",
    benefit: "Technical SEO so customers can find you.",
    price: { min: 600, max: 1200 },
    days: { min: 7, max: 14 },
  },
  {
    id: "care-plan",
    icon: "care",
    name: "Support and Growth",
    benefit: "Updates, monitoring and fixes every month.",
    monthly: { price: 149, note: "first 6 months free" },
  },
];

/** Bundles of this many one-off items or more get the bundle discount and
 * the timeline buffer. */
export const BUNDLE_THRESHOLD = 3;
export const BUNDLE_NOTE = "Bundles of 3+ get 10% off";
/** The bundle discount, applied to the estimate itself so the range a
 * visitor sees is the range they will be quoted. */
const BUNDLE_DISCOUNT = 0.1;
const roundTo10 = (n: number) => Math.round(n / 10) * 10;
/** Parallel work still needs integration time once a stack gets wide. */
const BUNDLE_TIMELINE_BUFFER = 1.2;

export type StackEstimate = {
  items: StackItem[];
  min: number;
  max: number;
  custom: boolean;
  monthly: StackItem[];
  /** null when nothing selected carries a delivery window. */
  days: { min: number; max: number } | null;
  bundle: boolean;
};

/** Parses `?stack=a,b,c`, dropping unknown and duplicate ids, and keeps
 * catalogue order so the same selection always reads the same way. */
export function parseStack(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const wanted = new Set(raw.split(",").map((s) => s.trim()));
  return stackItems.filter((i) => wanted.has(i.id)).map((i) => i.id);
}

export function estimateStack(ids: string[]): StackEstimate {
  const items = stackItems.filter((i) => ids.includes(i.id));
  const oneOff = items.filter((i) => !i.monthly);
  const bundle = oneOff.length >= BUNDLE_THRESHOLD;
  const timed = oneOff.filter((i) => i.days);
  let days: StackEstimate["days"] = null;
  if (timed.length) {
    const factor = bundle ? BUNDLE_TIMELINE_BUFFER : 1;
    days = {
      min: Math.ceil(Math.max(...timed.map((i) => i.days!.min)) * factor),
      max: Math.ceil(Math.max(...timed.map((i) => i.days!.max)) * factor),
    };
  }
  return {
    items,
    min: roundTo10(oneOff.reduce((sum, i) => sum + (i.price?.min ?? 0), 0) * (bundle ? 1 - BUNDLE_DISCOUNT : 1)),
    max: roundTo10(oneOff.reduce((sum, i) => sum + (i.price?.max ?? 0), 0) * (bundle ? 1 - BUNDLE_DISCOUNT : 1)),
    custom: oneOff.some((i) => i.custom),
    monthly: items.filter((i) => i.monthly),
    days,
    bundle,
  };
}

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** "$700–1,500", "Custom", or "$149/mo". */
export function formatItemPrice(item: StackItem) {
  if (item.monthly) return `${usd(item.monthly.price)}/mo`;
  if (item.custom || !item.price) return "Custom";
  return `${usd(item.price.min)}–${item.price.max.toLocaleString("en-US")}`;
}

/** "$1,300–2,700 + custom quote", or "Custom quote" for software alone. */
export function formatEstimate(e: StackEstimate) {
  const hasRange = e.max > 0;
  const range = hasRange ? `${usd(e.min)}–${e.max.toLocaleString("en-US")}` : "";
  if (e.custom) return hasRange ? `${range} + custom quote` : "Custom quote";
  return range;
}

/** The budget band a package's starting price falls in — so a visitor who
 * picked a package isn't asked a question the package already answers. */
export function budgetForPrice(price: number): (typeof BUDGET_OPTIONS)[number] {
  if (price < 500) return BUDGET_OPTIONS[0];
  if (price < 1500) return BUDGET_OPTIONS[1];
  if (price < 5000) return BUDGET_OPTIONS[2];
  return BUDGET_OPTIONS[3];
}

/** What a link to /contact already told us. Anything set here is pre-filled
 * on the inquiry form, and the steps it answers are skipped. */
export type InquiryPrefill = {
  /** "Your selection" card: a heading line, then detail lines. Sent with
   * the inquiry as one plain-text block. */
  selection?: string;
  service?: ServiceSlug;
  budget?: (typeof BUDGET_OPTIONS)[number];
  details?: string;
};

/** The quote form's service for a package's or stack item's kind of work. */
const SERVICE_FOR_PROJECT_TYPE: Record<ProjectType, ServiceSlug> = {
  "New website": "website",
  "Website redesign": "website",
  "Web app": "web-app",
  "Business software": "web-app",
  "AI automation": "ai-automation",
  "Branding & identity": "brand-visuals",
  "AI visuals & video": "brand-visuals",
  "SEO & marketing": "other",
  "Something else": "other",
};

/**
 * The inquiry pre-fill for /contact. Built from params only, on the server,
 * so a shared link carries the whole request. Text is capped at the
 * quote schema's limits (2000 for the selection, 3000 for details).
 */
export function buildInquiryPrefill(params: {
  packageSlug?: string;
  stack?: string;
  details?: string;
  service?: string;
}): InquiryPrefill | undefined {
  const prefill: InquiryPrefill = {};
  const selection: string[] = [];
  const types: ProjectType[] = [];

  const pkg = getProblemPackage(params.packageSlug);
  if (pkg) {
    selection.push(`${pkg.name} package`, `From ${usd(pkg.priceFrom)} · fixed quote · ${pkg.timeline}`);
    types.push(...pkg.projectTypes);
    prefill.budget = budgetForPrice(pkg.priceFrom);
  }

  const ids = parseStack(params.stack);
  if (ids.length) {
    const e = estimateStack(ids);
    const summary = [formatEstimate(e)];
    if (e.days) summary.push(`~${e.days.min}–${e.days.max} days`);
    if (e.bundle) summary.push(BUNDLE_NOTE.toLowerCase());
    if (!selection.length) selection.push("Your stack");
    selection.push(e.items.map((i) => i.name).join(", "), `Estimate: ${summary.filter(Boolean).join(" · ")}`);
    e.items.forEach((i) => i.projectType && types.push(i.projectType));
  }

  // An explicit `?service=` beats whatever a package or stack implies.
  const service = isServiceSlug(params.service) ? params.service : types[0] && SERVICE_FOR_PROJECT_TYPE[types[0]];
  if (service) {
    prefill.service = service;
    // A bare service link still gets the "Your selection" card, so the
    // skipped question stays visible and changeable.
    if (!selection.length) selection.push(serviceLabel(service));
  }

  if (selection.length) prefill.selection = selection.join("\n").slice(0, 2000);

  const details = params.details?.trim();
  if (details) prefill.details = details.slice(0, 3000);

  return Object.keys(prefill).length ? prefill : undefined;
}
