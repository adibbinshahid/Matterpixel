import { Check, X } from "lucide-react";

const ROWS = [
  { label: "Who codes", us: "Senior devs", them: "Junior devs" },
  { label: "Pricing", us: "Fixed quote", them: "Hourly, open-ended" },
  { label: "Scope", us: "Locked upfront", them: "Creeps mid-build" },
  { label: "Stack", us: "Next.js / React", them: "Legacy / templated" },
  { label: "Web Vitals", us: "Built in", them: "If requested" },
  { label: "After launch", us: "One partner", them: "Vendor per task" },
] as const;

/** Compact, colorful us-vs-them card — the hero's attention-grabbing
 * anchor on desktop, replacing the empty right column. */
export function ComparisonCard() {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border-2 border-blue bg-paper shadow-lifted">
      <div className="flex items-center justify-between bg-blue px-4 py-2.5">
        <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-white">Why us?</span>
      </div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th className="w-[34%] py-2 pl-4 pr-2 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-ink/40">
              &nbsp;
            </th>
            <th className="py-2 pr-2 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-blue">
              Matterpixel
            </th>
            <th className="py-2 pr-4 text-[0.625rem] font-bold uppercase tracking-[0.06em] text-magenta/70">
              Typical
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {ROWS.map((row) => (
            <tr key={row.label}>
              <td className="py-2 pl-4 pr-2 align-middle text-xs font-semibold text-ink">{row.label}</td>
              <td className="py-2 pr-2 align-middle">
                <div className="flex items-center gap-1 text-xs text-ink">
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue" />
                  <span>{row.us}</span>
                </div>
              </td>
              <td className="py-2 pr-4 align-middle">
                <div className="flex items-center gap-1 text-xs text-ink-soft/70">
                  <X className="h-3.5 w-3.5 shrink-0 text-magenta/60" />
                  <span>{row.them}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
