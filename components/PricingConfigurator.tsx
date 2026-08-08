"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import {
  ArrowRight,
  Bot,
  Camera,
  Check,
  Clapperboard,
  Clock,
  Code2,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { GiantHeading } from "@/components/GiantHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { EASE } from "@/lib/utils";
import {
  pricingBaselineDeliverables,
  pricingBenefits,
  pricingDefaultScale,
  pricingDefaultSelection,
  pricingIntro,
  pricingScales,
  pricingServices,
  type PricingScaleId,
  type PricingServiceId,
} from "@/content/pricing";

const ICON_BY_ID: Record<PricingServiceId, LucideIcon> = {
  "web-app-development": Code2,
  "ai-automation": Bot,
  "branding-identity": Sparkles,
  "ai-product-photography": Camera,
  "ai-video": Clapperboard,
  "seo-digital-marketing": TrendingUp,
};

/** Rounds a whole-dollar estimate to the nearest $10 — keeps the number
 * looking like a real quote rather than a raw sum with odd digits. */
function roundPrice(n: number) {
  return Math.round(n / 10) * 10;
}

function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 140, damping: 22, mass: 0.6 });
  const display = useTransform(spring, (v) => format(Math.round(v)));

  motionValue.set(value);

  return <motion.span>{display}</motion.span>;
}

function ServiceCard({
  id,
  title,
  desc,
  Icon,
  selected,
  onToggle,
}: {
  id: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <RevealItem>
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        aria-labelledby={`${id}-title`}
        onClick={onToggle}
        className="hover-lift group relative flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-colors duration-300"
        style={{
          borderColor: selected ? "var(--blue)" : "var(--line)",
          background: selected ? "rgba(44, 75, 255, 0.05)" : "var(--paper-2)",
        }}
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300"
          style={{
            borderColor: selected ? "var(--blue)" : "var(--line)",
            background: selected ? "var(--blue)" : "var(--paper)",
            color: selected ? "#fff" : "var(--ink-soft)",
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </span>

        <span className="flex-1">
          <span id={`${id}-title`} className="block text-[0.95rem] font-semibold tracking-tight text-ink">
            {title}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{desc}</span>
        </span>

        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300"
          style={{
            borderColor: selected ? "var(--blue)" : "var(--line)",
            background: selected ? "var(--blue)" : "transparent",
          }}
        >
          <Check
            className="h-3.5 w-3.5 text-white transition-transform duration-300"
            strokeWidth={3}
            style={{ transform: selected ? "scale(1)" : "scale(0)" }}
            aria-hidden="true"
          />
        </span>
      </button>
    </RevealItem>
  );
}

function ScaleCard({
  title,
  tagline,
  selected,
  onSelect,
}: {
  title: string;
  tagline: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <RevealItem>
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className="hover-lift relative w-full rounded-2xl border px-5 py-4 text-left transition-colors duration-300"
        style={{
          borderColor: selected ? "var(--blue)" : "var(--line)",
          background: selected ? "var(--blue)" : "var(--paper-2)",
          boxShadow: selected ? "var(--shadow-lifted)" : "var(--shadow-resting)",
        }}
      >
        <span
          className="block text-[0.95rem] font-semibold tracking-tight transition-colors duration-300"
          style={{ color: selected ? "#fff" : "var(--ink)" }}
        >
          {title}
        </span>
        <span
          className="mt-1 block text-sm leading-relaxed transition-colors duration-300"
          style={{ color: selected ? "rgba(255,255,255,0.78)" : "var(--ink-soft)" }}
        >
          {tagline}
        </span>
      </button>
    </RevealItem>
  );
}

export function PricingConfigurator() {
  const [selectedServices, setSelectedServices] = useState<PricingServiceId[]>(pricingDefaultSelection);
  const [scale, setScale] = useState<PricingScaleId>(pricingDefaultScale);

  function toggleService(id: PricingServiceId) {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  const activeScale = pricingScales.find((s) => s.id === scale)!;

  const { price, weeksLow, weeksHigh, deliverables } = useMemo(() => {
    const active = pricingServices.filter((s) => selectedServices.includes(s.id));
    const rawPrice = active.reduce((sum, s) => sum + s.price, 0) * activeScale.priceMultiplier;
    const rawWeeks = active.reduce((sum, s) => sum + s.weeks, 0) * activeScale.weeksMultiplier;
    const weeks = Math.max(1, Math.round(rawWeeks));

    const items = new Set<string>();
    active.forEach((s) => s.deliverables.forEach((d) => items.add(d)));
    if (active.length > 0) pricingBaselineDeliverables.forEach((d) => items.add(d));

    return {
      price: roundPrice(rawPrice),
      weeksLow: Math.max(1, weeks - 1),
      weeksHigh: weeks + 1,
      deliverables: Array.from(items),
    };
  }, [selectedServices, activeScale]);

  const hasSelection = selectedServices.length > 0;

  return (
    <section className="relative px-6 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 lg:pb-32 lg:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="mb-4 font-semibold uppercase tracking-[0.12em] text-blue" style={{ fontSize: "0.8rem" }}>
            {pricingIntro.eyebrow}
          </p>
          <h1>
            <GiantHeading lines={[pricingIntro.heading]} maxFontSize={72} />
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{pricingIntro.sub}</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-14">
          {/* Left: configuration panel */}
          <div>
            <RevealGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2" stagger={0.06}>
              {pricingServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  desc={service.desc}
                  Icon={ICON_BY_ID[service.id]}
                  selected={selectedServices.includes(service.id)}
                  onToggle={() => toggleService(service.id)}
                />
              ))}
            </RevealGroup>

            <Reveal className="mt-12">
              <h3 className="text-h3 text-ink">Project Scale</h3>
            </Reveal>
            <RevealGroup className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3" stagger={0.06}>
              {pricingScales.map((tier) => (
                <ScaleCard
                  key={tier.id}
                  title={tier.title}
                  tagline={tier.tagline}
                  selected={scale === tier.id}
                  onSelect={() => setScale(tier.id)}
                />
              ))}
            </RevealGroup>
          </div>

          {/* Right: live estimate card — floats/sticks alongside the panel */}
          <div className="lg:sticky lg:top-28">
            <Reveal delay={0.1}>
              <div
                className="relative overflow-hidden rounded-[28px] border bg-paper p-8"
                style={{ borderColor: "var(--line)", boxShadow: "var(--shadow-lifted), 0 40px 80px -32px rgba(22,22,28,0.16)" }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-[0.08]"
                  style={{ background: "var(--blue)", filter: "blur(40px)" }}
                />

                <p className="label-eyebrow">Estimated Investment</p>
                <p className="mt-2 text-5xl font-extrabold tracking-tight text-ink">
                  {hasSelection ? (
                    <AnimatedNumber value={price} format={(n) => `$${n.toLocaleString()}`} />
                  ) : (
                    "$0"
                  )}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-ink-soft">
                  <Clock className="h-4 w-4 text-blue" strokeWidth={1.75} aria-hidden="true" />
                  Estimated Timeline
                  <span className="font-semibold text-ink">
                    {hasSelection ? (
                      <>
                        <AnimatedNumber value={weeksLow} format={(n) => `${n}`} />–
                        <AnimatedNumber value={weeksHigh} format={(n) => `${n}`} /> Weeks
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>

                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--line)" }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">Selected Services</p>
                  <ul className="mt-3 space-y-2">
                    <AnimatePresence initial={false} mode="popLayout">
                      {hasSelection ? (
                        pricingServices
                          .filter((s) => selectedServices.includes(s.id))
                          .map((s) => (
                            <motion.li
                              key={s.id}
                              layout
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: EASE }}
                              className="flex items-center gap-2 text-sm text-ink"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                              {s.title}
                            </motion.li>
                          ))
                      ) : (
                        <motion.li
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-ink-soft"
                        >
                          Select a service to get started.
                        </motion.li>
                      )}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--line)" }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">Included Deliverables</p>
                  <ul className="mt-3 grid grid-cols-1 gap-2">
                    <AnimatePresence initial={false}>
                      {deliverables.map((d) => (
                        <motion.li
                          key={d}
                          layout
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="flex items-center gap-2 text-sm text-ink-soft"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0 text-blue" strokeWidth={2.5} aria-hidden="true" />
                          {d}
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--line)" }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">Project Benefits</p>
                  <ul className="mt-3 space-y-2">
                    {pricingBenefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-ink-soft">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue" strokeWidth={1.75} aria-hidden="true" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    href="/contact"
                    className="hover-lift inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition-colors"
                  >
                    Start Your Project
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/contact"
                    className="hover-lift inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold text-ink transition-colors"
                    style={{ borderColor: "var(--line)" }}
                  >
                    Request Custom Proposal
                  </Link>
                </div>

                <p className="mt-6 text-center text-xs leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">Need something unique?</span> We&apos;ll prepare a custom
                  proposal tailored to your business goals within 24 hours.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
