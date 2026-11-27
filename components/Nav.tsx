"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Logo } from "@/components/Logo";
import { brand, nav, siteGreeting, whatsappHref } from "@/content/siteConfig";
import { CtaLink } from "@/components/CtaLink";
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
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setOpen(false), []);
  // Whether whatever currently sits behind the (translucent) nav is dark —
  // any section that needs the bar to switch to its light-text/dark-glass
  // theme marks itself with `data-nav-scrim="light"` (see Hero.tsx,
  // ContactSplit.tsx). Starts false to match the server-rendered markup (no
  // `document` at SSR time); the IntersectionObserver effect below corrects
  // it client-side right after mount.
  const [overDarkHero, setOverDarkHero] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
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
  // Below lg the bar steps out of the way while reading (scrolling down)
  // and comes straight back the moment the visitor scrolls up, the way a
  // native app's toolbar does. A few px of hysteresis stops it flickering
  // on a slow drag; it never hides near the top or while the menu is open.
  const [tucked, setTucked] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > SCROLL_THRESHOLD);
      const dy = y - last;
      if (Math.abs(dy) < 6) return;
      setTucked(!openRef.current && dy > 0 && y > 160);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Published for anything pinned under the bar (sticky filter rows), so it
  // can ride up into the space the bar leaves instead of leaving a gap.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-nav-tucked", tucked && !open);
  }, [tucked, open]);

  // rootMargin shrinks the observed root to a thin band at the very top of
  // the viewport, roughly where the nav itself sits, so this reflects what's
  // directly behind the bar rather than the whole page's scroll position.
  useEffect(() => {
    const targets = document.querySelectorAll('[data-nav-scrim="light"]');
    // Light sections nested inside a dark-marked page (DarkPage wraps whole
    // pages in the dark scrim) mark themselves `data-nav-light`, and win:
    // the bar goes light over them even though the page around is dark.
    const lights = document.querySelectorAll("[data-nav-light]");
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
    const lightHits = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const set = entry.target.hasAttribute("data-nav-light") ? lightHits : intersecting;
          if (entry.isIntersecting) set.add(entry.target);
          else set.delete(entry.target);
        }
        setOverDarkHero(intersecting.size > 0 && lightHits.size === 0);
      },
      { rootMargin: "0px 0px -90% 0px", threshold: 0 },
    );
    targets.forEach((target) => io.observe(target));
    lights.forEach((target) => io.observe(target));
    return () => io.disconnect();
  }, [pathname]);

  // The open menu is the night ground, so the bar reads light-on-dark.
  const dark = overDarkHero || open;
  const navTheme = dark ? "dark" : "light";

  return (
    <header
      className={`nav-header fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        tucked && !open ? "max-lg:-translate-y-full" : ""
      }`}
    >
      <nav
        data-nav-theme={navTheme}
        // Phones: above the menu, so the bar and its close button stay sharp
        // while the menu assembles behind them. Height includes the notch
        // inset: the bar paints up under the status bar and its contents
        // start below it.
        className="nav-bar relative flex h-[calc(4rem+env(safe-area-inset-top))] w-full items-center justify-between px-4 pt-[env(safe-area-inset-top)] transition-colors duration-500 max-lg:z-[95] sm:h-[calc(4.992rem+env(safe-area-inset-top))] sm:px-8"
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
        {/* Reading progress: a hairline along the bar's lower edge, blue
           running into magenta. Driven by a CSS scroll timeline (no JS);
           browsers without one simply never show it. */}
        <div aria-hidden="true" className="nav-progress pointer-events-none absolute inset-x-0 bottom-0 h-px" />

        <Link href="/" className="relative flex min-h-11 items-center">
          {/* The full-size lockup renders ~240px wide — 61% of a 393px phone
             viewport — inside a bar that also has to hold the menu button.
             The smaller height below `sm` (~156px wide) leaves the bar
             breathing room and lets it shrink to h-16 with it. */}
          {/* Below lg the bar is always dark (see .nav-bar in globals.css),
              so the light lockup is fixed there; from lg it follows the
              section behind the bar. CSS picks which one shows, so the
              first server-rendered paint is already right. */}
          <Logo forceLight priority className="lg:hidden" imgClassName="h-11 w-auto sm:h-[4.224rem]" />
          <Logo forceLight={dark} imgId="nav-logo-mark" className="max-lg:hidden" imgClassName="h-11 w-auto sm:h-[4.224rem]" />
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
            <CtaLink section="nav" cta="book" className="btn-sm" />
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="nav-menu-btn hover-lift flex h-11 w-11 items-center justify-center rounded-full active:scale-95 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {/* Two square-capped bars that fold into an X, rather than an
               icon swap: the control visibly becomes its own opposite. */}
            <span aria-hidden="true" className="nav-burger" data-open={open || undefined}>
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={closeMenu} toggleRef={toggleRef} />
    </header>
  );
}

/** Menu open/close curve and timings. Opening is an expo-out curtain
 * (fast start, long soft landing); closing is shorter and ease-in, so the
 * page comes back the moment it is asked for. */
const OPEN_EASE = [0.16, 1, 0.3, 1] as const;
const CLOSE_EASE = [0.7, 0, 0.84, 0] as const;
const OPEN_S = 0.42;
const CLOSE_S = 0.24;

/**
 * Phones and tablets: a full-screen takeover on the night ground. The
 * panel drops in as a curtain from under the bar (a clip-path wipe, no
 * layout work) while the links rise into place one after another, set
 * large and left-aligned; closing lifts the curtain back in ~0.24s.
 * Book, WhatsApp and email sit at the bottom, inside thumb reach, above
 * the home indicator.
 *
 * A modal while open: Escape closes it, Tab stays inside it (the toggle,
 * which reads "Close menu", counts as inside), and focus goes back to the
 * toggle when it closes. Reduced motion: the panel and links appear
 * without travel (MotionConfig reducedMotion="user").
 */
function MobileMenu({
  open,
  onClose,
  toggleRef,
}: {
  open: boolean;
  onClose: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) toggleRef.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const focusables = () => [
      ...(toggleRef.current ? [toggleRef.current] : []),
      ...(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []),
    ];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (!els.length) return;
      const i = els.indexOf(document.activeElement as HTMLElement);
      const last = els.length - 1;
      const next = e.shiftKey ? (i <= 0 ? last : i - 1) : i === -1 || i === last ? 0 : i + 1;
      e.preventDefault();
      els[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, toggleRef]);

  // Links ride up into their line boxes just behind the curtain's edge;
  // on close they don't animate out — the curtain takes them with it.
  const rise = (i: number) => ({
    initial: { y: "105%" },
    animate: { y: "0%", transition: { duration: 0.5, delay: 0.06 + i * 0.035, ease: OPEN_EASE } },
  });
  const fade = (i: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.06 + i * 0.035, ease: OPEN_EASE } },
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[90] bg-[#0b0c0e] lg:hidden"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: OPEN_S, ease: OPEN_EASE } }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: CLOSE_S, ease: CLOSE_EASE } }}
        >
          {/* Light pools: blue low-left, magenta high-right. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue/25 blur-[120px]" />
            <div className="absolute -right-20 top-24 h-64 w-64 rounded-full bg-magenta/20 blur-[120px]" />
          </div>
          {/* The curtain's leading edge: a blue-to-magenta hairline that
              lands with the panel. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,var(--blue),var(--magenta))]"
          />

          {/* Content — scrolls on its own if a short landscape screen can't
             hold it, without dragging the page behind. */}
          <div className="relative flex h-full flex-col overflow-y-auto overscroll-contain px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(4rem+env(safe-area-inset-top)+2rem)] sm:px-8 sm:pt-[calc(4.992rem+env(safe-area-inset-top)+2.5rem)]">
            <nav aria-label="Site">
              <ul className="flex flex-col">
                {nav.links.map((l, i) => {
                  const active = isActive(pathname, l.href);
                  return (
                    <li key={l.href} className="overflow-hidden border-b border-white/10">
                      <motion.div {...rise(i)}>
                        <Link
                          href={l.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={`group flex min-h-16 items-center gap-3 py-3 text-[clamp(2rem,9vw,2.75rem)] font-bold leading-none tracking-[-0.03em] transition-[color,translate] duration-150 active:translate-x-1 ${
                            active ? "text-white" : "text-white/70 active:text-white"
                          }`}
                        >
                          {/* The current page carries the brand's square
                             magenta pixel; the rest leave its slot empty so
                             every label starts on one line. */}
                          <span
                            aria-hidden="true"
                            className={`h-2.5 w-2.5 shrink-0 ${active ? "bg-magenta" : "bg-white/0"}`}
                          />
                          <span className="flex-1">{l.label}</span>
                          <ArrowUpRight
                            aria-hidden="true"
                            className={`h-6 w-6 shrink-0 ${active ? "text-magenta" : "text-white/30"}`}
                          />
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Thumb zone. */}
            <div className="mt-auto pt-10">
              <motion.div {...fade(nav.links.length)}>
                <CtaLink section="nav-mobile" cta="book" onClick={onClose} className="btn-block" />
              </motion.div>
              <motion.div {...fade(nav.links.length + 1)} className="mt-3 grid grid-cols-2 gap-3">
                <a
                  href={whatsappHref(siteGreeting(pathname))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] text-sm font-semibold text-white transition-[scale,background-color] duration-150 active:scale-[0.97] active:bg-white/10"
                >
                  <SiWhatsapp className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
                  WhatsApp
                </a>
                <a
                  href={`mailto:${brand.email}`}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] text-sm font-semibold text-white transition-[scale,background-color] duration-150 active:scale-[0.97] active:bg-white/10"
                >
                  <Mail className="h-4 w-4 text-[var(--blue-ink)]" aria-hidden="true" />
                  Email
                </a>
              </motion.div>
              <motion.p {...fade(nav.links.length + 2)} className="mt-4 text-center text-[0.8125rem] text-white/50">
                {brand.replyPromise}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
