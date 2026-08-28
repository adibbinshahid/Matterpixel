"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
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
 * from the --nav-pill-* tokens (app/globals.css) — a light, translucent
 * pill against the dark bar; `nav-glass`/`nav-glass-hover` layer on the
 * top-shine/bottom-glow specular pseudo-elements (same technique as
 * .glass-card). Both rely on their usage site already being
 * `absolute`/`relative` (positioning context for the pseudo-elements),
 * not applying that themselves.
 */
const GLASS_PILL = "nav-glass rounded-full bg-[var(--nav-pill-bg)] shadow-[var(--nav-pill-shadow)]";
// nav-glass-hover (app/globals.css) handles its own :hover-gated ::before/
// ::after — Tailwind's `hover:` prefix can't apply to an arbitrary custom
// class name, only to Tailwind's own utilities, so the specular pseudo-
// elements' visibility is driven by a plain CSS :hover rule instead.
const GLASS_PILL_HOVER =
  "nav-glass-hover hover:rounded-full hover:bg-[var(--nav-pill-bg)] hover:shadow-[var(--nav-pill-shadow)]";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Whether whatever currently sits behind the (translucent) nav is dark —
  // any section that needs the bar to switch to its light-text/dark-glass
  // theme marks itself with `data-nav-scrim="light"` (see Hero.tsx,
  // ContactSplit.tsx). Starts false to match the server-rendered markup (no
  // `document` at SSR time); the IntersectionObserver effect below corrects
  // it client-side right after mount.
  const [overDarkHero, setOverDarkHero] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // The bar is present (dark glass) from the very top of the page — only
  // its density (background opacity/blur strength) steps up once the
  // visitor has scrolled a deliberate amount, for legibility over busy
  // content further down the page.
  const SCROLL_THRESHOLD = 120;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // rootMargin shrinks the observed root to a thin band at the very top of
  // the viewport, roughly where the nav itself sits, so this reflects what's
  // directly behind the bar rather than the whole page's scroll position.
  useEffect(() => {
    const targets = document.querySelectorAll('[data-nav-scrim="light"]');
    if (targets.length === 0) {
      setOverDarkHero(false);
      return;
    }
    // Multiple sections on one page (Hero, ServicesFold, ContactSplit) can
    // each carry this marker — a plain single-`querySelector` observer only
    // ever watched the first of them, so the nav silently went back to its
    // light theme over every dark section past the first. Tracks each
    // target's own intersecting state and ORs them together, so the bar
    // stays dark-themed if *any* marked section is behind it.
    const intersecting = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target);
          else intersecting.delete(entry.target);
        }
        setOverDarkHero(intersecting.size > 0);
      },
      { rootMargin: "0px 0px -90% 0px", threshold: 0 },
    );
    targets.forEach((target) => io.observe(target));
    return () => io.disconnect();
  }, [pathname]);

  const navTheme = overDarkHero ? "dark" : "light";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        data-nav-theme={navTheme}
        className="nav-bar relative flex h-16 w-full items-center justify-between px-4 transition-colors duration-500 sm:h-[4.992rem] sm:px-8"
      >
        {/* Apple-glass bar — genuinely translucent (real backdrop-filter,
           not the opaque --glass-bg-strong material used elsewhere): blur +
           saturate boost, true Apple vibrancy (not desaturated) on whatever
           scrolls underneath. Two axes of variation, both driven by the
           nav-bar/nav-pill/nav-text tokens (app/globals.css):
           `data-nav-theme` above swaps light-glass/dark-text vs
           dark-glass/light-text to match whatever's behind the bar, and
           `scrolled` below steps up density (bg opacity + blur strength)
           for legibility once the visitor's scrolled past the top. */}
        <div
          aria-hidden="true"
          className="nav-glass pointer-events-none absolute inset-0 border-b shadow-[var(--nav-bar-shadow)] transition-[background-color,backdrop-filter] duration-500"
          style={{
            borderColor: "var(--nav-bar-border)",
            background: scrolled ? "var(--nav-bar-bg-scrolled)" : "var(--nav-bar-bg)",
            backdropFilter: scrolled ? "var(--nav-bar-blur-scrolled)" : "var(--nav-bar-blur)",
            WebkitBackdropFilter: scrolled ? "var(--nav-bar-blur-scrolled)" : "var(--nav-bar-blur)",
          }}
        >
          <div className="nav-grain" />
        </div>

        <Link href="/" className="relative flex min-h-11 items-center">
          {/* The full-size lockup renders ~240px wide — 61% of a 393px phone
             viewport — inside a bar that also has to hold the menu button.
             The smaller height below `sm` (~156px wide) leaves the bar
             breathing room and lets it shrink to h-16 with it. */}
          <Logo forceLight={overDarkHero} priority imgId="nav-logo-mark" imgClassName="h-11 w-auto sm:h-[4.224rem]" />
        </Link>

        {/* Absolutely centered on the bar itself, not `justify-between`'s
           middle slot — that centers this *between* the logo and the
           CTA/hamburger group, which drift the links off-true-center
           whenever those two flanking groups aren't the same width (they
           aren't: the logo and the CTA+hamburger cluster are different
           sizes). This is centered independent of either. */}
        <ul className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 lg:flex">
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
                  className={`font-avenir relative inline-block rounded-full px-4 py-2 text-sm uppercase [text-shadow:var(--nav-text-shadow)] transition-colors duration-300 ${
                    active
                      ? "text-magenta"
                      : `text-[var(--nav-text)] hover:text-[var(--nav-text-hover)] ${GLASS_PILL_HOVER}`
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="relative flex items-center gap-3">
          {/* Wrapper carries the breakpoint visibility: .btn-brand sets its
              own `display`, so a `hidden lg:inline-flex` on the link itself
              would fight the class rather than hide it. */}
          <div className="hidden lg:block">
            <Link href="/contact?tab=booking" className="btn-brand btn-sm group">
              {nav.cta}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="hover-lift flex h-11 w-11 items-center justify-center rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue text-paper animate-gradient-shift lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}

/**
 * Compact glassmorphic dropdown anchored under the nav pill — not a
 * full-screen takeover. Backdrop dimmer + click-outside close, panel
 * itself is real frosted glass (translucent white, heavy backdrop-blur/
 * saturate, layered top-sheen + ambient shadow) rather than the nav
 * pill's own opaque --glass-bg tokens, since the ask here is specifically
 * "super glassmorphism" — content behind should actually show through.
 */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[85] bg-ink/20 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            // Anchored just under the bar, which is h-16 (4rem) below `sm`
            // and h-[4.992rem] above it — the panel is `lg:hidden`, so it
            // has to track both of those, not just the desktop height.
            className="fixed inset-x-4 top-[5.25rem] z-[90] overflow-hidden rounded-[2rem] border border-white/50 sm:top-[6.25rem] lg:hidden"
            style={{
              background: "linear-gradient(165deg, rgba(255,255,255,0.75), rgba(255,255,255,0.45))",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              boxShadow:
                "inset 0 1px 1px 0 rgba(255,255,255,0.8), inset 0 -1px 2px 0 rgba(0,0,0,0.06), 0 24px 60px -20px rgba(0,0,0,0.35), 0 8px 24px -12px rgba(0,0,0,0.25)",
            }}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <ul className="flex flex-col p-3">
              {nav.links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.06 + i * 0.04, ease: EASE }}
                >
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className="hover-lift font-avenir group flex items-center justify-between rounded-2xl px-4 py-3.5 text-base text-ink transition-colors duration-300 hover:bg-white/50"
                  >
                    {l.label}
                    <ArrowRight className="h-4 w-4 text-ink-soft transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="px-3 pb-3">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.06 + nav.links.length * 0.04, ease: EASE }}
              >
                <Link
                  href="/contact?tab=booking"
                  onClick={onClose}
                  className="btn-brand btn-block"
                >
                  {nav.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
