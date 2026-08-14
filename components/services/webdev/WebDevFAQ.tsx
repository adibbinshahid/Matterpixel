"use client";

import * as RadixAccordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";
import type { Service } from "@/content/services";
import { EASE_CSS } from "@/lib/utils";

export function WebDevFAQ({ service }: { service: Service }) {
  return (
    <section className="border-t border-line px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="label-eyebrow mb-4">faq</p>
          <h2 className="mb-8 max-w-2xl">
            <GiantHeading lines={["Questions worth asking", "before you buy this."]} maxFontSize={44} />
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <RadixAccordion.Root type="single" collapsible className="divide-y divide-line border-y border-line">
            {service.faq.map((item, i) => (
              <RadixAccordion.Item key={i} value={`item-${i}`}>
                <RadixAccordion.Header>
                  <RadixAccordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-ink transition-colors hover:text-blue">
                    {item.q}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-ink-soft transition-transform duration-300 group-data-[state=open]:rotate-180"
                      style={{ transitionTimingFunction: EASE_CSS }}
                    />
                  </RadixAccordion.Trigger>
                </RadixAccordion.Header>
                <RadixAccordion.Content className="overflow-hidden pb-6 text-sm text-ink-soft data-[state=closed]:animate-none data-[state=open]:animate-none">
                  <p className="max-w-2xl leading-relaxed">{item.a}</p>
                </RadixAccordion.Content>
              </RadixAccordion.Item>
            ))}
          </RadixAccordion.Root>
        </Reveal>
      </div>
    </section>
  );
}
