import type { Metadata } from "next";
import { ContactSplit } from "@/components/ContactSplit";
import { buildInquiryPrefill } from "@/content/packages";
import { cleanSrc } from "@/lib/analytics";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get a fixed quote or book a free 30-minute audit call. NDA-friendly, founder-led, and we reply within 12 hours.",
  path: "/contact",
  eyebrow: "Start a project",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; package?: string; stack?: string; details?: string; src?: string }>;
}) {
  const { tab, package: packageSlug, stack, details, src } = await searchParams;
  // Links from the service finder arrive with what the visitor already
  // chose; it lands in the inquiry's project details.
  const prefill = buildInquiryPrefill({ packageSlug, stack, details });
  return <ContactSplit initialTab={tab} prefill={prefill} src={cleanSrc(src)} />;
}
