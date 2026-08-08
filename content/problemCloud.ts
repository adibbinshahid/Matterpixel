/**
 * Problem Cloud — homepage section between Stats and ServicesFold. Every
 * phrase a visitor might silently be thinking about their own business.
 * Grouped by visual weight (`size`, four tiers M-XXL — the S/XS tiers
 * were dropped for breathing room, too dense at six); `interleave()`
 * below spreads the tiers evenly through the render order so same-size
 * phrases don't clump together, rather than leaving them in big runs.
 */

export const problemCloudIntro = {
  eyebrow: "PROBLEMS WE SOLVE",
  heading: "which one is holding your business back?",
};

export type ProblemSize = "m" | "l" | "xl" | "xxl";
export type ProblemWord = { text: string; size: ProblemSize };

const XXL = ["Your Website Isn't Converting", "No Traffic. No Leads."];

const XL = [
  "Manual Work Everywhere",
  "Customers Can't Find You Online",
  "Your Brand Looks Like Everyone Else",
  "Creating Content Takes Too Long",
];

const L = [
  "Slow Website",
  "Poor Mobile Experience",
  "Weak SEO",
  "Disconnected Tools",
  "Outdated Website",
  "Weak Branding",
  "Low Conversion Rate",
  "Hard to Update Website",
  "No Marketing Strategy",
];

const M = [
  "Poor Product Visuals",
  "Content Bottleneck",
  "Visitors Leave Before They Buy",
  "Website Doesn't Scale",
  "No Automation",
  "Inconsistent Brand",
  "Manual Reporting",
  "Weak User Experience",
  "Low Search Rankings",
];

/** Distributes each tier's words evenly across the combined output by
 * fractional position (`i / count`), so a short list (XXL) and a long
 * one (XS) interleave proportionally instead of the short one being
 * front-loaded or bunched. */
function interleave(tiers: { words: string[]; size: ProblemSize }[]): ProblemWord[] {
  const slots: { pos: number; word: ProblemWord }[] = [];
  for (const { words, size } of tiers) {
    words.forEach((text, i) => {
      slots.push({ pos: (i + 0.5) / words.length, word: { text, size } });
    });
  }
  slots.sort((a, b) => a.pos - b.pos);
  return slots.map((s) => s.word);
}

export const problemWords: ProblemWord[] = interleave([
  { words: XXL, size: "xxl" },
  { words: XL, size: "xl" },
  { words: L, size: "l" },
  { words: M, size: "m" },
]);
