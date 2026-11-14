"use client";

import { useLayoutEffect, useRef, useState } from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { EASE } from "@/lib/utils";

const EASE_CSS = `cubic-bezier(${EASE.join(",")})`;

/**
 * Radix Accordion restyled to brand — accessible (keyboard, ARIA) FAQ list.
 *
 * `reserve`: the list keeps the height it would have with its longest
 * answer open, whatever is open, so expanding or collapsing a question
 * never moves anything below it. Measured from hidden copies of every
 * answer at the list's real width, and re-measured on resize.
 */
export function Accordion({
  items,
  reserve = false,
  compact = false,
  columns = 1,
}: {
  items: { q: string; a: string }[];
  reserve?: boolean;
  /** Tighter rows (16px, 1rem question type) for dense lists. */
  compact?: boolean;
  /** 2: two independent columns from md up — first half left, second half right. */
  columns?: 1 | 2;
}) {
  const twoCol = columns === 2;
  const rowPad = compact ? "py-4" : "py-6";
  const ansPad = compact ? "pb-4" : "pb-6";
  const rootRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const [minH, setMinH] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!reserve) return;
    const root = rootRef.current;
    const probe = probeRef.current;
    if (!root || !probe) return;
    const measure = () => {
      // Collapsed height of the list: every item minus any open answer.
      const open = root.querySelector<HTMLElement>("[data-state=open][role=region]");
      const collapsed = root.offsetHeight - (open?.offsetHeight ?? 0);
      const tallest = Math.max(0, ...[...probe.children].map((c) => (c as HTMLElement).offsetHeight));
      setMinH(collapsed + tallest);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(probe);
    return () => ro.disconnect();
  }, [reserve, items]);

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
      <RadixAccordion.Content
        className={`overflow-hidden ${ansPad} text-ink-soft data-[state=closed]:animate-none data-[state=open]:animate-none`}
      >
        <p className="max-w-2xl leading-relaxed">{item.a}</p>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );

  return (
    <div ref={rootRef} className="relative" style={reserve ? { minHeight: minH } : undefined}>
      {reserve && (
        <div
          ref={probeRef}
          aria-hidden="true"
          className={`pointer-events-none invisible absolute left-0 top-0 h-0 overflow-hidden ${
            twoCol ? "w-full md:w-[calc(50%-1.25rem)]" : "w-full"
          }`}
        >
          {items.map((item, i) => (
            <div key={i} className={`${ansPad} text-ink-soft`}>
              <p className="max-w-2xl leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      )}
      <RadixAccordion.Root
        type="single"
        collapsible
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
