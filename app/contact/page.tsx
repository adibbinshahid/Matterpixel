import type { Metadata } from "next";
import { ContactSplit } from "@/components/ContactSplit";
import { buildInquiryPrefill } from "@/content/packages";
import { cleanSrc } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project or book a free 30-minute strategy call. NDA-friendly, fixed quotes, founder-led. We reply within 12 hours.",
  alternates: { canonical: "/contact" },
};

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
