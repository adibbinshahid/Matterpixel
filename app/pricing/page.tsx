import type { Metadata } from "next";
import { EngagementModels } from "@/components/EngagementModels";
import { PricingConfigurator } from "@/components/PricingConfigurator";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Fixed-scope projects, dedicated teams, or ongoing support and growth retainers — pick the engagement model that fits your scope, timeline, and team.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PricingConfigurator />
      <EngagementModels />
    </>
  );
}
