"use client";

import { usePathname } from "next/navigation";
import { Spotlight } from "@/components/ui/Spotlight";
import { siteGreeting, whatsappHref } from "@/content/siteConfig";

/** The footer's WhatsApp card. Client-side only for the path: the chat
 * opens pre-typed with the page the visitor was reading. */
export function WhatsAppSpotlight({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Spotlight href={whatsappHref(siteGreeting(pathname))} external>
      {children}
    </Spotlight>
  );
}
