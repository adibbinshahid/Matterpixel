import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Service } from "@/content/services";
import { ComparisonCard } from "./ComparisonCard";
import { CtaLink } from "@/components/CtaLink";
import { PageHero } from "@/components/PageHero";

export function Hero({ service }: { service: Service }) {
  return (
    <PageHero
      eyebrow={`${service.id} · ${service.title}`}
      lines={[service.heroClaim]}
      lede={service.intro}
      aside={<ComparisonCard />}
      tone="light"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <CtaLink section="hero" cta="book" />
        <CtaLink section="hero" cta="quote" params={{ service: "website" }} variant="text" className="text-ink" />
      </div>
      <p className="mt-4 text-sm text-ink-soft">{service.processNote}</p>
      <Link
        href="/services"
        className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors duration-300 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1" />
        All services
      </Link>
    </PageHero>
  );
}
