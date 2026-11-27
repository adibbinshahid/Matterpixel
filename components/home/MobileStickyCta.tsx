"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SiWhatsapp } from "react-icons/si";
import { CtaLink } from "@/components/CtaLink";
import { siteGreeting, whatsappHref } from "@/content/siteConfig";

/** Pages that are themselves the conversion surface: a pinned "Book a call"
 * bar over the booking form would only cover the form. */
const SKIP = ["/contact"];

/**
 * Phones only (<768px), every page: a slim bar pinned to the bottom of the
 * screen with the primary CTA and a one-tap WhatsApp line to Adib. It
 * arrives on the visitor's first scroll and then stays — through the
 * footer too (which pads its foot so the bar never covers it) — stepping
 * aside only while a field has focus (the keyboard is up).
 * Sits above the home indicator via `safe-area-inset-bottom`.
 *
 * Fixed and transform-only, so showing or hiding it never moves the page.
 * While hidden it's inert: out of the tab order and the accessibility tree.
 */
export function MobileStickyCta() {
  const pathname = usePathname();
  const [pastFirstScreen, setPastFirstScreen] = useState(false);
  const [typing, setTyping] = useState(false);
  const skip = SKIP.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (skip) return;
    setPastFirstScreen(false);
    // Arrives with the first scroll, not after a screenful: the action is
    // always one thumb away.
    const onScroll = () => setPastFirstScreen(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // A focused field means the keyboard is up: the bar would ride on top
    // of it and cover what's being typed.
    const isField = (el: Element | null) =>
      !!el && (el.matches("input, textarea, select") || (el as HTMLElement).isContentEditable);
    const onFocus = () => setTyping(isField(document.activeElement));
    const onBlur = () => requestAnimationFrame(onFocus);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onBlur);
    };
  }, [pathname, skip]);

  if (skip) return null;
  const shown = pastFirstScreen && !typing;

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`mobile-sticky-cta fixed inset-x-0 bottom-0 z-40 flex items-center gap-2.5 border-t border-white/10 bg-[#0b0c0e]/85 px-4 pt-2.5 backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <CtaLink section="sticky-mobile" cta="book" className="min-w-0 flex-1" />
      <a
        href={whatsappHref(siteGreeting(pathname))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Adib"
        // WhatsApp's own mark: white glyph on its green disc, so it reads
        // as WhatsApp at a glance.
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_20px_-8px_rgba(37,211,102,0.7)] transition-[scale,background-color] duration-150 active:scale-95 active:bg-[#1ebe5b]"
      >
        <SiWhatsapp className="h-6 w-6 text-white" aria-hidden="true" />
      </a>
    </div>
  );
}
