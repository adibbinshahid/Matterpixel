"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { EASE } from "@/lib/utils";

const EASE_CSS = `cubic-bezier(${EASE.join(",")})`;

/** Radix Accordion restyled to brand — accessible (keyboard, ARIA) FAQ list. */
export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <RadixAccordion.Root type="single" collapsible className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <RadixAccordion.Item key={i} value={`item-${i}`}>
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="group flex w-full items-center justify-between gap-4 py-6 text-left text-lg font-semibold text-ink transition-colors hover:text-blue">
              {item.q}
              <ChevronDown
                className="h-5 w-5 shrink-0 text-ink-soft transition-transform duration-300 group-data-[state=open]:rotate-180"
                style={{ transitionTimingFunction: EASE_CSS }}
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="overflow-hidden pb-6 text-ink-soft data-[state=closed]:animate-none data-[state=open]:animate-none">
            <p className="max-w-2xl leading-relaxed">{item.a}</p>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
