"use client";

import { useEffect, useState } from "react";
import { CtaLink } from "@/components/CtaLink";

/**
 * Phones only (<768px): a slim bar pinned to the bottom of the screen with
 * the primary CTA. It arrives once the hero (which carries the same action)
 * has scrolled away, and steps aside while the closing CTA or the footer's
 * contact block is on screen, so the action is never shown twice at once.
 * Sits above the home indicator via `safe-area-inset-bottom`.
 *
 * Fixed and transform-only, so showing or hiding it never moves the page.
 * While hidden it's inert: out of the tab order and the accessibility tree.
 */
export function MobileStickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [contactInView, setContactInView] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const contact = [
      document.getElementById("closing-title")?.closest("section"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => !!el);

    const heroIo = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting));
    if (hero) heroIo.observe(hero);

    const visible = new Set<Element>();
    const contactIo = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setContactInView(visible.size > 0);
    });
    contact.forEach((el) => contactIo.observe(el));

    return () => {
      heroIo.disconnect();
      contactIo.disconnect();
    };
  }, []);

  const shown = pastHero && !contactInView;

  return (
    <div
      aria-hidden={!shown}
      inert={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0c0e]/85 px-4 pt-2.5 backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <CtaLink section="sticky-mobile" cta="book" className="btn-block" />
    </div>
  );
}
