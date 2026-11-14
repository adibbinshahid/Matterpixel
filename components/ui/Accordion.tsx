"use client";

import { useEffect, useState } from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { EASE } from "@/lib/utils";

const EASE_CSS = `cubic-bezier(${EASE.join(",")})`;

/**
 * Radix Accordion restyled to brand — accessible (keyboard, ARIA) FAQ list.
 * No reserved height: a click-driven shift doesn't count toward CLS, and
 * Lenis's autoResize picks up the new page height on its own.
 */
export function Accordion({
  items,
  compact = false,
  columns = 1,
  defaultOpen = false,
  closedOnPhones = false,
}: {
  items: { q: string; a: string }[];
  /** Tighter rows (16px, 1rem question type) for dense lists. */
  compact?: boolean;
  /** 2: two independent columns from md up — first half left, second half right. */
  columns?: 1 | 2;
  /** Every answer starts open; each still collapses on its own. */
  defaultOpen?: boolean;
  /** With `defaultOpen`: below 768px every answer starts closed instead. */
  closedOnPhones?: boolean;
}) {
  const twoCol = columns === 2;
  const rowPad = compact ? "py-4" : "py-6";
  const ansPad = compact ? "pb-4" : "pb-6";
  const allOpen = items.map((_, i) => `item-${i}`);
  // Controlled only so a phone can close everything after mount; the
  // server HTML (and so every crawler) still carries each answer open.
  const [open, setOpen] = useState<string[]>(defaultOpen ? allOpen : []);
  useEffect(() => {
    if (defaultOpen && closedOnPhones && window.matchMedia("(max-width: 767px)").matches) setOpen([]);
  }, [defaultOpen, closedOnPhones]);
  const rootProps = defaultOpen
    ? { type: "multiple" as const, value: open, onValueChange: setOpen }
    : { type: "single" as const, collapsible: true };

  const renderItem = (item: { q: string; a: string }, i: number) => (
    <RadixAccordion.Item key={i} value={`item-${i}`}>
      <RadixAccordion.Header>
        <RadixAccordion.Trigger
          className={`group flex w-full items-center justify-between gap-4 ${rowPad} text-left ${compact ? "text-base" : "text-lg"} font-semibold text-ink transition-colors hover:text-blue`}
        >
          {item.q}
          <ChevronDown
            className="h-5 w-5 shrink-0 text-ink-soft transition-transform duration-300 group-data-[state=open]:rotate-180"
            style={{ transitionTimingFunction: EASE_CSS }}
          />
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      {/* Kept mounted (hidden when closed) so an answer is never removed
          from the page, only collapsed. */}
      <RadixAccordion.Content
        forceMount
        className={`overflow-hidden ${ansPad} text-ink-soft data-[state=closed]:hidden data-[state=closed]:animate-none data-[state=open]:animate-none`}
      >
        <p className="max-w-2xl leading-relaxed">{item.a}</p>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );

  return (
    <div className="relative">
      <RadixAccordion.Root
        {...rootProps}
        className={twoCol ? "grid items-start md:grid-cols-2 md:gap-x-10" : "divide-y divide-line border-y border-line"}
      >
        {twoCol
          ? // Two independent stacks (first half left, second half right):
            // an open answer only pushes down its own column.
            [items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))].map((col, c) => (
              <div
                key={c}
                className={`divide-y divide-line border-b border-line ${c === 0 ? "border-t" : "md:border-t"}`}
              >
                {col.map((item, k) => renderItem(item, c === 0 ? k : k + Math.ceil(items.length / 2)))}
              </div>
            ))
          : items.map((item, i) => renderItem(item, i))}
      </RadixAccordion.Root>
    </div>
  );
}
