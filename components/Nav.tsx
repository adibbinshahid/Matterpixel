"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { nav } from "@/content/siteConfig";
import { EASE } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Apple "Liquid Glass" bevel — bright top rim, soft inner bottom shadow
 * (the convex lens edge), and an outer lift so it reads as a raised pane
 * rather than a flat tint. Shared by nav hover/active states. Values come
 * from the --glass-* tokens (app/globals.css). */
const GLASS_PILL = "rounded-full bg-[var(--glass-bg)] shadow-[var(--glass-shadow)] backdrop-blur-lg backdrop-saturate-200";
const GLASS_PILL_HOVER =
  "hover:rounded-full hover:bg-[var(--glass-bg)] hover:shadow-[var(--glass-shadow)] hover:backdrop-blur-lg hover:backdrop-saturate-200";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Starts false to match the server-rendered markup exactly (no
  // `document` at SSR time) — the IntersectionObserver effect below
  // corrects it client-side right after mount, before the visitor has a
  // realistic chance to see the brief pre-correction frame.
  const [overDarkHero, setOverDarkHero] = useState(false);
  // Separate from overDarkHero above — that one's about nav text/logo
  // *color* (is the backdrop dark), this one's about whether the *nav's
  // own CTA duplicate* should show. They're related but not the same
  // moment: the hero can still be dark and on-screen well after its own
  // "Book a Free Expert Discussion" button has scrolled past, and that's
  // the point the nav's copy should take over — not "the whole hero is
  // gone." Starts false to match SSR, same reasoning as overDarkHero.
  const [heroCtaVisible, setHeroCtaVisible] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // No capsule at the very top of the page — it fades in only once the
  // visitor has scrolled a deliberate amount (not the first few px of
  // wheel/trackpad drift), so the glass pane reads as a real response to
  // scrolling rather than something that was always almost there.
  const SCROLL_THRESHOLD = 120;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Whether whatever currently sits behind the (still-transparent) nav is
  // dark — any section that needs this marks itself with
  // `data-nav-scrim="light"` (see Hero.tsx). rootMargin shrinks the
  // observed root to a thin band at the very top of the viewport, roughly
  // where the nav itself sits, so this reflects what's directly behind the
  // bar rather than the whole page's scroll position.
  useEffect(() => {
    const target = document.querySelector('[data-nav-scrim="light"]');
    if (!target) {
      setOverDarkHero(false);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setOverDarkHero(entry.isIntersecting), {
      rootMargin: "0px 0px -90% 0px",
      threshold: 0,
    });
    io.observe(target);
    return () => io.disconnect();
  }, [pathname]);

  // Whether the hero's own primary CTA (see Hero.tsx's
  // `data-nav-cta-anchor`) is currently on screen at all — plain full-
  // viewport intersection, no rootMargin shrinking, so this flips the
  // instant that specific button scrolls out of view, regardless of how
  // much of the rest of the hero is still visible above it.
  useEffect(() => {
    const target = document.querySelector("[data-nav-cta-anchor]");
    if (!target) {
      setHeroCtaVisible(false);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setHeroCtaVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(target);
    return () => io.disconnect();
  }, [pathname]);

  // Only matters while the capsule itself is invisible — once it's
  // present, its own opaque/blurred background already guarantees contrast
  // regardless of what's underneath.
  const lightNav = overDarkHero && !scrolled;
  // The nav's CTA duplicate hides only while the hero's own is reachable
  // on screen; as soon as that scrolls away, the nav's takes over —
  // independent of overDarkHero/lightNav above.
  const hideNavCta = heroCtaVisible;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
      <nav className="relative mx-auto flex h-[4.992rem] w-full max-w-[1400px] items-center justify-between overflow-visible rounded-full px-6 sm:px-8">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border shadow-[var(--glass-shadow-strong)] backdrop-blur-[20px] backdrop-saturate-150"
          style={{ borderColor: "var(--glass-border-strong)", background: "var(--glass-bg-strong)" }}
          initial={false}
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        />

        <Link href="/" className="relative flex items-center">
          <Logo forceLight={lightNav} priority imgId="nav-logo-mark" imgClassName="h-[3.84rem] w-auto" />
        </Link>

        <ul className="relative hidden items-center gap-5 lg:flex">
          {nav.links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li
                key={l.href}
                className={`relative origin-center transition-transform duration-300 ${active ? "scale-110" : ""}`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className={`absolute inset-0 ${GLASS_PILL}`}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
                <Link
                  href={l.href}
                  className={`font-avenir relative inline-block rounded-full px-4 py-2 text-sm uppercase transition-colors duration-300 ${
                    active
                      ? "text-magenta"
                      : lightNav
                        ? "text-[#f5f3ee]/85 hover:text-[#f5f3ee]"
                        : `text-ink-soft hover:text-ink ${GLASS_PILL_HOVER}`
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="relative flex items-center gap-3">
          <div className="relative hidden lg:block">
            {/* Hidden over the hero itself (duplicate of the hero's own
               primary CTA), shown everywhere else — but always mounted at
               its full size, so neither this nor its neighbors (toggle,
               hamburger) ever shift position. What changes is purely
               visual: the site's signature pixel-mosaic resolve (see
               PixelResolve.tsx) plays the button in/out instead of a plain
               fade, so appearing/disappearing reads as an intentional
               brand moment, not a layout pop. */}
            <motion.div
              animate={{ filter: hideNavCta ? "blur(6px)" : "blur(0px)", opacity: hideNavCta ? 0 : 1 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Link
                href="/contact#email"
                aria-hidden={hideNavCta}
                tabIndex={hideNavCta ? -1 : undefined}
                className={`hover-lift font-avenir group inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-5 py-2.5 text-sm text-paper animate-gradient-shift ${hideNavCta ? "pointer-events-none" : ""}`}
              >
                {nav.cta}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
            {/* Keyed on hideNavCta so each flip mounts a fresh instance —
               a one-shot pop-in/dissolve-out, not a steady-state layer, so
               it always settles back to fully invisible instead of sitting
               there as a permanent pixelated placeholder. */}
            <motion.div
              key={hideNavCta ? "hide" : "show"}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, var(--blue) 25%, transparent 25%, transparent 75%, var(--blue) 75%), linear-gradient(45deg, var(--magenta) 25%, transparent 25%, transparent 75%, var(--magenta) 75%)",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 4px 4px",
              }}
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{ opacity: [0, 0.95, 0], scale: [1.3, 1, 1.25] }}
              transition={{ duration: 0.55, times: [0, 0.35, 1], ease: EASE }}
            />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="hover-lift flex h-11 w-11 items-center justify-center rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue text-paper animate-gradient-shift lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] bg-paper"
          initial={{ clipPath: "circle(0% at 92% 5%)" }}
          animate={{ clipPath: "circle(150% at 92% 5%)" }}
          exit={{ clipPath: "circle(0% at 92% 5%)" }}
          transition={{ duration: 0.6, ease: EASE }}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="flex items-center justify-between px-6 py-6">
            <Logo imgClassName="h-[4.8rem] w-auto" />
            <button
              type="button"
              onClick={onClose}
              className="hover-lift flex h-11 w-11 items-center justify-center rounded-full border border-line"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="flex flex-col gap-2 px-6 py-8">
            {nav.links.map((l, i) => (
              <motion.li
                key={l.href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: EASE }}
              >
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="hover-lift font-avenir block origin-left py-3 text-4xl tracking-tight text-ink"
                >
                  {l.label}
                </Link>
              </motion.li>
            ))}
            <motion.li
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + nav.links.length * 0.06, ease: EASE }}
              className="pt-6"
            >
              <Link
                href="/contact#email"
                onClick={onClose}
                className="hover-lift font-avenir inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-5 py-3 text-sm text-paper animate-gradient-shift"
              >
                {nav.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.li>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
