import type { Service } from "@/content/services";
import { Hero } from "./Hero";
import { FeatureList } from "./FeatureList";
import { SelectedWork } from "./SelectedWork";
import { TechStack } from "./TechStack";
import { WebDevFAQ } from "./WebDevFAQ";
import { FinalCTA } from "./FinalCTA";

/**
 * The Web & App Development detail page: a compact, list-and-table
 * breakdown of the service rather than an interactive demo. The us-vs-
 * typical comparison lives in the hero as a compact card, not its own
 * section. Only wired in for the `web-app-development` slug — see
 * app/services/[slug]/page.tsx. Every other service keeps the original
 * generic template untouched.
 *
 * Section rhythm: paper → dark → paper → dark → paper → blue.
 */
export function WebDevServicePage({ service }: { service: Service }) {
  return (
    <>
      <Hero service={service} />
      <FeatureList service={service} />
      <TechStack service={service} />
      <SelectedWork />
      <WebDevFAQ service={service} />
      <FinalCTA />
    </>
  );
}
