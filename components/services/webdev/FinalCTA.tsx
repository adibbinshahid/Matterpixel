"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";

export function FinalCTA() {
  return (
    <section className="panel-blue relative overflow-hidden border-t border-line px-6 py-16 sm:px-8 lg:px-12">
      <div className="relative mx-auto max-w-[1400px] text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl">
            <GiantHeading lines={["Got something", "worth building?"]} maxFontSize={56} />
          </h2>
          <Link href="/contact?tab=booking" className="btn-brand btn-on-brand on-blue group mt-10">
            Get a Free Audit
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
