import type { Metadata } from "next";
import { GlobeHero } from "@/components/GlobeHero";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project or book a free 15-minute intro call. NDA-friendly, fixed quotes, senior-led, 24h reply.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <GlobeHero />;
}
