"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import type { Service } from "@/content/services";
import { ComparisonCard } from "./ComparisonCard";

export function Hero({ service }: { service: Service }) {
  return (
    <section className="relative overflow-hidden px-6 pb-12 pt-28 sm:px-8 lg:px-12">
      <div className="relative z-10 mx-auto max-w-[1400px]">
        <Reveal>
          <Link
            href="/services"
            className="group mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors duration-300 hover:text-blue"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Services
          </Link>
          <p className="label-eyebrow mb-4 flex items-center gap-2">
            [ {service.id} ] {service.title}
            <span className="h-px w-5 bg-blue" />
            <span className="h-1 w-1 rounded-full bg-magenta" />
          </p>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
          <Reveal delay={0.05}>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {service.heroClaim}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">{service.intro}</p>
            <Link href="/contact?tab=booking" className="btn-brand group mt-8">
              Get a Free Audit
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <p className="mt-4 text-sm text-ink-soft">{service.processNote}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <ComparisonCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
