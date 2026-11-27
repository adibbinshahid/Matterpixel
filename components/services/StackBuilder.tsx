"use client";

import { useEffect, useRef, useState } from "react";
import {
  AppWindow,
  Bot,
  CalendarCheck,
  Check,
  ChevronUp,
  Clapperboard,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Palette,
  SquareKanban,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { CtaLink } from "@/components/CtaLink";
import { BRAND_BLUE, BRAND_MAGENTA, prefersReducedMotion } from "@/lib/pixels";
import {
  BUNDLE_NOTE,
  estimateStack,
  formatEstimate,
  formatItemPrice,
  parseStack,
  stackItems,
  usd,
  type StackIcon,
} from "@/content/packages";

const ICONS: Record<StackIcon, LucideIcon> = {
  website: Globe,
  webapp: AppWindow,
  chatbot: Bot,
  whatsapp: MessageCircle,
  crm: SquareKanban,
  booking: CalendarCheck,
  software: LayoutDashboard,
  branding: Palette,
  visuals: Clapperboard,
  seo: TrendingUp,
  care: LifeBuoy,
};

const PARAM = "stack";

/**
 * Selection lives in the URL (`?stack=website,crm`) so a stack can be
 * shared or bookmarked. Read once on mount — the pages that render this
 * are static, so the server never sees the query — then mirrored back
 * with `replaceState` on every change, which neither scrolls nor adds a
 * history entry per click.
 */
function useStackParam() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const fromUrl = parseStack(new URLSearchParams(window.location.search).get(PARAM));
    if (fromUrl.length) setIds(fromUrl);
  }, []);

  const update = (next: string[]) => {
    const ordered = parseStack(next.join(","));
    setIds(ordered);
    // Built by hand so the commas stay literal (`?stack=website,crm`)
    // instead of URLSearchParams' `%2C` — ids are plain slugs.
    const params = new URLSearchParams(window.location.search);
    params.delete(PARAM);
    const rest = params.toString();
    const stack = ordered.length ? `${PARAM}=${ordered.join(",")}` : "";
    const query = [rest, stack].filter(Boolean).join("&");
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
    );
  };

  return [ids, update] as const;
}

function StackCard({
  id,
  selected,
  onToggle,
}: {
  id: string;
  selected: boolean;
  onToggle: (from: HTMLElement) => void;
}) {
  const item = stackItems.find((i) => i.id === id)!;
  const Icon = ICONS[item.icon];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => onToggle(e.currentTarget)}
      className={`group relative flex h-full w-full flex-col rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow,scale] duration-300 active:scale-[0.98] sm:p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
        selected
          ? "border-blue bg-blue/[0.06] shadow-[0_0_0_1px_var(--blue),0_14px_32px_-18px_rgba(44,75,255,0.6)]"
          : "border-line bg-white hover:border-blue/50"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 sm:h-10 sm:w-10 ${
            selected ? "bg-blue text-white" : "bg-blue/10 text-blue"
          }`}
        >
          <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-300 ${
            selected ? "border-blue bg-blue text-white" : "border-line text-transparent"
          }`}
          aria-hidden="true"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </span>
      <span className="mt-3 text-[0.9375rem] font-bold leading-tight tracking-tight text-ink sm:mt-4 sm:text-base">{item.name}</span>
      <span className="mt-1 flex-1 text-[0.8125rem] leading-snug text-ink-soft sm:text-sm">{item.benefit}</span>
      <span className="mt-3 font-avenir text-sm font-extrabold text-blue sm:mt-4">
        {formatItemPrice(item)}
        {item.monthly && <span className="block font-sans text-xs font-semibold text-ink-soft sm:ml-1 sm:inline">· {item.monthly.note}</span>}
      </span>
    </button>
  );
}

const TWEEN_MS = 450;

/** Eases the displayed total from its last value to the new one, so the
 * range visibly climbs as pieces are added. Rounded to $10 while moving. */
function useTweenedRange(min: number, max: number) {
  const [shown, setShown] = useState({ min, max });
  const from = useRef({ min, max });

  useEffect(() => {
    const start = { ...from.current };
    if (prefersReducedMotion() || (start.min === min && start.max === max)) {
      from.current = { min, max };
      setShown({ min, max });
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / TWEEN_MS));
      const e = 1 - Math.pow(1 - p, 3);
      const cur = {
        min: p < 1 ? Math.round((start.min + (min - start.min) * e) / 10) * 10 : min,
        max: p < 1 ? Math.round((start.max + (max - start.max) * e) / 10) * 10 : max,
      };
      from.current = cur;
      setShown(cur);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [min, max]);

  return shown;
}

/**
 * The selected card throws a handful of brand pixel blocks into the
 * summary: the piece visibly joins the stack. Fixed-position squares on a
 * throwaway layer, animated with the Web Animations API on transform and
 * opacity only, removed when they land. Skipped under reduced motion.
 */
function flyPixels(from: HTMLElement, to: HTMLElement | null) {
  if (!to || prefersReducedMotion()) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:60;";
  document.body.appendChild(layer);
  const tx = b.left + Math.min(b.width, 160) * 0.5;
  const ty = b.top + b.height * 0.5;
  let longest = 0;
  for (let i = 0; i < 10; i++) {
    const size = 6 + (i % 3) * 3;
    const sx = a.left + a.width * (0.2 + Math.random() * 0.6);
    const sy = a.top + a.height * (0.25 + Math.random() * 0.5);
    const block = document.createElement("span");
    block.style.cssText = `position:absolute;left:${sx}px;top:${sy}px;width:${size}px;height:${size}px;background:${
      i % 2 ? BRAND_MAGENTA : BRAND_BLUE
    };`;
    layer.appendChild(block);
    const dx = tx - sx;
    const dy = ty - sy;
    const lift = -60 - Math.random() * 80;
    const duration = 520 + Math.random() * 180;
    const delay = i * 22;
    longest = Math.max(longest, duration + delay);
    block.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.45}px,${dy * 0.45 + lift}px) scale(1.15)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px,${dy}px) scale(0.4)`, opacity: 0 },
      ],
      { duration, delay, easing: "cubic-bezier(0.45,0,0.2,1)", fill: "both" },
    );
  }
  window.setTimeout(() => layer.remove(), longest + 50);
}

/**
 * Part 2: build-your-own stack. Cards toggle; the summary prices the
 * selection live with the same `estimateStack` the contact page uses to
 * pre-fill the inquiry. Desktop: sticky sidebar. Mobile: a bottom sheet
 * pinned to the viewport while this block is on screen (plain
 * `position: sticky`, so it settles into place at the end of the block
 * rather than following the visitor down the page).
 */
export function StackBuilder() {
  const [ids, setIds] = useStackParam();
  const [sheetOpen, setSheetOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const totalRef = useRef<HTMLParagraphElement>(null);
  const estimate = estimateStack(ids);
  const count = ids.length;
  const shown = useTweenedRange(estimate.min, estimate.max);

  const toggle = (id: string, from: HTMLElement) => {
    const adding = !ids.includes(id);
    setIds(adding ? [...ids, id] : ids.filter((x) => x !== id));
    if (adding) flyPixels(from, totalRef.current ?? asideRef.current);
  };

  const lineFor = (min: number, max: number) =>
    formatEstimate({ ...estimate, min, max }) ||
    estimate.monthly.map((m) => `${usd(m.monthly!.price)}/mo`).join(" + ") ||
    "—";
  const totalLine = lineFor(estimate.min, estimate.max);
  // "$1,400–3,000 + custom quote" → the range set large, the rider small.
  const [totalPrimary, totalSuffix] = lineFor(shown.min, shown.max).split(" + ");

  const details = (
    <>
      {count === 0 ? (
        <p className="text-sm text-ink-soft">Pick the pieces you need — the estimate builds as you go.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {estimate.items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink">{item.name}</span>
              <span className="shrink-0 font-semibold text-ink-soft">{formatItemPrice(item)}</span>
            </li>
          ))}
        </ul>
      )}
      <p
        className={`mt-4 rounded-xl px-3 py-2 text-xs font-semibold transition-colors duration-300 ${
          estimate.bundle ? "bg-magenta/15 text-magenta" : "bg-white/[0.06] text-ink-soft"
        }`}
      >
        {estimate.bundle ? `${BUNDLE_NOTE} — already applied above.` : `${BUNDLE_NOTE}.`}
      </p>
    </>
  );

  return (
    <div>
      <SectionHeading eyebrow="Need more than one?" title="Build your own stack." />

      <div className="mt-6 grid gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Two-up from the smallest phone: eleven full-width cards ran four
            screens long. */}
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-3" aria-label="Services to add to your stack">
          {stackItems.map((item) => (
            <li key={item.id} data-reveal="block">
              <StackCard id={item.id} selected={ids.includes(item.id)} onToggle={(from) => toggle(item.id, from)} />
            </li>
          ))}
        </ul>

        <aside
          ref={asideRef}
          data-reveal="block"
          aria-label="Your stack"
          className="panel-dark sticky bottom-[calc(var(--sticky-cta-h)+0.5rem)] z-20 -mx-2 rounded-[24px] p-4 sm:p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] sm:mx-0 lg:bottom-auto lg:top-28 lg:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                Your stack · {count} {count === 1 ? "item" : "items"}
              </p>
              {/* The visible total tweens between values; screen readers get
                  the settled figure once, from the polite live region. */}
              <p
                ref={totalRef}
                aria-hidden="true"
                className="mt-1 font-avenir text-xl font-extrabold leading-tight text-ink tabular-nums lg:text-2xl"
              >
                {totalPrimary}
                {totalSuffix && <span className="ml-1 text-sm font-bold text-ink-soft">+ {totalSuffix}</span>}
              </p>
              <p aria-live="polite" className="sr-only">
                {totalLine}
              </p>
              {/* Collapsed on phones: the sheet stays one row of total + CTA
                  so it never covers more than a sliver of the cards. */}
              <p className={`mt-1 text-xs text-ink-soft ${sheetOpen ? "" : "hidden"} lg:block`}>
                {estimate.days ? `Est. ${estimate.days.min}–${estimate.days.max} days` : "Estimated timeline appears here"}
                {estimate.monthly.map((m) => (
                  <span key={m.id} className="block">
                    + {m.name} {usd(m.monthly!.price)}/mo, {m.monthly!.note}
                  </span>
                ))}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen((o) => !o)}
              aria-expanded={sheetOpen}
              aria-controls="stack-details"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ink lg:hidden"
            >
              <ChevronUp
                className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${sheetOpen ? "" : "rotate-180"}`}
                aria-hidden="true"
              />
              <span className="sr-only">{sheetOpen ? "Hide" : "Show"} stack details</span>
            </button>
          </div>

          <div id="stack-details" className={`mt-4 border-t border-line pt-4 ${sheetOpen ? "block" : "hidden"} lg:block`}>
            {details}
          </div>

          <CtaLink section="stack"
            cta="quote"
            params={{ [PARAM]: ids.join(",") }}
            aria-disabled={count === 0}
            onClick={(e) => count === 0 && e.preventDefault()}
            className={`mt-3 w-full justify-center lg:mt-4 ${count === 0 ? "pointer-events-none opacity-50" : ""}`}
            tabIndex={count === 0 ? -1 : undefined}
          />
          {/* Phones: the collapsed sheet is just total + quote, so it covers
              as little of the cards as possible; the call link comes back
              when the sheet is opened. */}
          <CtaLink
            section="stack"
            cta="book"
            variant="text"
            className={`w-full justify-center text-sm text-ink ${sheetOpen ? "" : "max-lg:hidden"}`}
          />
        </aside>
      </div>
    </div>
  );
}
