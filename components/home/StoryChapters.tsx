"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { getLenis } from "@/components/SmoothScrollProvider";

export type Chapter = {
  /** Short story beat shown in the pill: "The proof". */
  label: string;
  /** CSS selector for any element inside the chapter's section. */
  anchor: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Phones and tablets: the homepage read as a story. A small pill pinned at
 * the top of the screen names the chapter on screen ("3/8 · The person")
 * so the visitor always knows where they are in the argument without
 * scrolling back up for context; tapping it lists every chapter and jumps
 * to one. It takes the nav bar's place as a slim frosted strip whenever
 * the bar tucks away on scroll-down (see .story-chapters in globals.css).
 *
 * Hidden over the hero (no chapter yet) and while the site menu is open.
 */
export function StoryChapters({ chapters }: { chapters: Chapter[] }) {
  const [current, setCurrent] = useState(-1);
  const [open, setOpen] = useState(false);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sections.current = chapters.map(
      (c) => document.querySelector<HTMLElement>(c.anchor)?.closest("section") ?? null,
    );
    // The chapter is whichever section crosses a line 40% down the screen.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setCurrent(sections.current.indexOf(e.target as HTMLElement));
        }
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    sections.current.forEach((s) => s && io.observe(s));
    // Above the first chapter (the hero), there's no chapter to name.
    const first = sections.current[0];
    const onScroll = () => {
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.4) setCurrent(-1);
      setOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [chapters]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const jump = (i: number) => {
    setOpen(false);
    const el = sections.current[i];
    if (!el) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(el, { offset: -8 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 8, behavior: "smooth" });
  };

  const shown = current >= 0;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      ref={rootRef}
      className="story-chapters pointer-events-none fixed inset-x-0 z-[96] flex justify-center lg:hidden"
    >
      <AnimatePresence>
        {shown && (
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE } }}
            exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.18 } }}
          >
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="story-chapter-list"
              aria-label={`Chapter ${current + 1} of ${chapters.length}: ${chapters[current]?.label}. Show all chapters`}
              className="flex h-9 items-center gap-2 rounded-full border border-white/12 bg-[rgba(16,16,22,0.78)] pl-3 pr-2.5 text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-[scale] duration-150 active:scale-95"
            >
              <span className="font-avenir text-xs tabular-nums text-magenta">
                {pad(current + 1)}
                <span className="text-white/40">/{pad(chapters.length)}</span>
              </span>
              <span className="h-3 w-px bg-white/15" aria-hidden="true" />
              {/* The label swaps by rising out as the next one rises in. */}
              <span className="relative block h-4 overflow-hidden text-[0.8125rem] font-semibold leading-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={current}
                    className="block whitespace-nowrap"
                    initial={{ y: "100%" }}
                    animate={{ y: "0%", transition: { duration: 0.35, ease: EASE } }}
                    exit={{ y: "-100%", transition: { duration: 0.2 } }}
                  >
                    {chapters[current]?.label}
                  </motion.span>
                </AnimatePresence>
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-white/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence>
              {open && (
                <motion.ol
                  id="story-chapter-list"
                  className="absolute left-1/2 top-11 w-60 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/12 bg-[rgba(16,16,22,0.92)] p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: EASE } }}
                  exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
                >
                  {chapters.map((c, i) => (
                    <li key={c.label}>
                      <button
                        type="button"
                        onClick={() => jump(i)}
                        aria-current={i === current ? "step" : undefined}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors active:bg-white/10 ${
                          i === current ? "bg-white/[0.07] text-white" : "text-white/70"
                        }`}
                      >
                        <span className={`font-avenir text-xs tabular-nums ${i === current ? "text-magenta" : "text-white/40"}`}>
                          {pad(i + 1)}
                        </span>
                        {c.label}
                      </button>
                    </li>
                  ))}
                </motion.ol>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
