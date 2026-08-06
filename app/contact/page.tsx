import type { Metadata } from "next";
import { ContactSplit } from "@/components/ContactSplit";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project or book a free 15-minute intro call. NDA-friendly, fixed quotes, senior-led, 24h reply.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <ContactSplit initialTab={tab} />;
}
