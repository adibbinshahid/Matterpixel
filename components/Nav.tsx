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
 * rather than a flat tint. Shared by nav hover/active states. */
const GLASS_PILL =
  "rounded-full bg-white/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),inset_0_-1px_2px_0_rgba(0,0,0,0.06),0_4px_12px_-4px_rgba(22,22,28,0.25)] backdrop-blur-lg backdrop-saturate-200";
const GLASS_PILL_HOVER =
  "hover:rounded-full hover:bg-white/50 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),inset_0_-1px_2px_0_rgba(0,0,0,0.06),0_4px_12px_-4px_rgba(22,22,28,0.25)] hover:backdrop-blur-lg hover:backdrop-saturate-200";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
      <nav
        className={`mx-auto flex w-full max-w-[1400px] items-center justify-between overflow-visible rounded-full border border-white/50 bg-gradient-to-b from-white/55 to-white/20 px-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_8px_32px_-8px_rgba(22,22,28,0.18)] backdrop-blur-2xl backdrop-saturate-150 transition-[height] duration-300 sm:px-8 ${
          scrolled ? "h-[3.84rem]" : "h-[4.992rem]"
        }`}
      >
        <Link
          href="/"
          className="flex items-center transition-transform duration-300 hover:scale-105"
        >
          <Logo priority imgClassName="h-[3.84rem] w-auto" />
        </Link>

        <ul className="hidden items-center gap-5 lg:flex">
          {nav.links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li
                key={l.href}
                className={`relative origin-center transition-transform duration-300 hover:scale-110 ${active ? "scale-110" : ""}`}
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
                  className={`relative inline-block rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                    active ? "font-bold text-magenta" : `font-medium text-ink-soft hover:text-ink ${GLASS_PILL_HOVER}`
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <Link
              href="/contact#email"
              className="group inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-5 py-2.5 text-sm font-semibold text-paper transition-transform duration-300 hover:scale-105 animate-gradient-shift"
            >
              {nav.cta}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-md transition-all duration-300 hover:scale-105 lg:hidden ${GLASS_PILL_HOVER}`}
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
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-transform duration-300 hover:scale-105"
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
                  className="block origin-left py-3 text-4xl font-bold tracking-tight text-ink transition-transform duration-300 hover:scale-105"
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
                className="inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-5 py-3 text-sm font-semibold text-paper transition-transform duration-300 hover:scale-105 animate-gradient-shift"
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
