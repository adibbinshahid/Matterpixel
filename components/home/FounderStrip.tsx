"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { founder } from "@/content/siteConfig";
import { PixelSection } from "@/components/home/PixelSection";
import { Hl } from "@/components/home/Hl";
import { easeOutExpo, prefersReducedMotion } from "@/lib/pixels";

/** Same three verified figures as the founder feature on /about, in the
 * order a buyer weighs them: tenure, quality, volume. */
const PROOF = [
  { value: 7, suffix: "+", decimals: 0, label: "Years in practice" },
  { value: 4.9, suffix: "", decimals: 1, label: "Fiverr rating" },
  { value: 150, suffix: "+", decimals: 0, label: "Projects by Adib" },
];

const CURTAIN_MS = 1300;
const isPhone = () => window.matchMedia("(max-width: 767px)").matches;
const COUNT_MS = 1400;
const COUNT_STAGGER_MS = 160;
/** Parallax travel of the portrait inside its frame, px each way. */
const DRIFT = 40;

/**
 * Who builds it, as an editorial feature: the founder's portrait owns the
 * left half of the section edge to edge, the statement and the proof the
 * right.
 *
 * Motion, once per visit and all on transform / opacity / clip-path:
 *  - the portrait is uncovered by a curtain rising off it while the image
 *    settles from 1.15× to rest
 *  - while on screen, the image drifts against the scroll inside its
 *    frame, so it reads as a layer behind the copy
 *  - a soft light follows a fine pointer across the portrait
 *  - the proof rule draws across, then each figure counts up in turn
 * Text runs on the page's shared staggered entrance (data-reveal).
 * Reduced motion: everything is shown finished and still. Phones skip the
 * curtain and the count (both run over a second, longer than a flick takes
 * to pass the section) and show the portrait and figures finished.
 */
export function FounderStrip() {
  const frameRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Curtain + settle on first arrival.
  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    const grid = gridRef.current;
    if (!frame || !img || !grid || prefersReducedMotion() || isPhone()) return;
    if (frame.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    const curtain = frame.animate([{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)" }], {
      duration: CURTAIN_MS,
      easing: "cubic-bezier(0.77, 0, 0.175, 1)",
      fill: "both",
    });
    const settle = img.animate([{ scale: "1.15" }, { scale: "1" }], {
      duration: CURTAIN_MS + 500,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both",
    });
    curtain.pause();
    settle.pause();
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        curtain.play();
        settle.play();
        Promise.all([curtain.finished, settle.finished])
          .then(() => {
            curtain.cancel();
            settle.cancel();
          })
          .catch(() => undefined);
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    // Watch the unclipped grid, not the frame: the curtain's clip-path
    // shrinks the frame's own intersection to nothing, so it would never
    // report itself on screen.
    io.observe(grid);
    return () => {
      io.disconnect();
      curtain.cancel();
      settle.cancel();
    };
  }, []);

  // Parallax drift while the section is on screen.
  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img || prefersReducedMotion()) return;
    let raf = 0;
    let visible = false;
    const tick = () => {
      const r = frame.getBoundingClientRect();
      // -1 as the frame enters from below, +1 as it leaves at the top.
      const p = Math.max(-1, Math.min(1, (window.innerHeight / 2 - (r.top + r.height / 2)) / window.innerHeight));
      img.style.translate = `0 ${(p * DRIFT).toFixed(1)}px`;
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(frame);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Proof: rule draws, then the figures count up in turn.
  useEffect(() => {
    const proof = proofRef.current;
    const rule = ruleRef.current;
    const nums = numRefs.current;
    if (!proof || !rule || prefersReducedMotion() || isPhone()) return;
    if (proof.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    const draw = rule.animate([{ scale: "0 1" }, { scale: "1 1" }], {
      duration: 900,
      easing: "cubic-bezier(0.77, 0, 0.175, 1)",
      fill: "both",
    });
    draw.pause();
    nums.forEach((n, i) => n && (n.textContent = (0).toFixed(PROOF[i].decimals)));
    const raf: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        draw.play();
        PROOF.forEach((item, i) => {
          const node = nums[i];
          if (!node) return;
          const start = performance.now() + 350 + i * COUNT_STAGGER_MS;
          const tick = (now: number) => {
            const p = Math.min(1, Math.max(0, (now - start) / COUNT_MS));
            node.textContent = (item.value * easeOutExpo(p)).toFixed(item.decimals);
            if (p < 1) raf[i] = requestAnimationFrame(tick);
          };
          raf[i] = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 },
    );
    io.observe(proof);
    return () => {
      io.disconnect();
      raf.forEach((id) => cancelAnimationFrame(id));
      draw.cancel();
      nums.forEach((n, i) => n && (n.textContent = PROOF[i].value.toFixed(PROOF[i].decimals)));
    };
  }, []);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const light = lightRef.current;
    if (!light || e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    light.style.opacity = "1";
    light.style.background = `radial-gradient(420px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(255,214,235,0.32), transparent 60%)`;
  };

  return (
    <PixelSection seam tone="magenta" labelledBy="founder-strip-title" className="overflow-hidden">
      {/* Phones: portrait on top, statement full width under it. Side by side
          at 402px the copy column was ~200px and the heading broke over four
          lines. */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:min-h-[640px]">
        {/* Portrait: edge to edge on the left half, no frame. */}
        <div
          ref={frameRef}
          onPointerMove={onMove}
          onPointerLeave={() => lightRef.current && (lightRef.current.style.opacity = "0")}
          className="founder-frame relative min-h-full overflow-hidden bg-[#0b0c0e] max-sm:aspect-[5/4]"
        >
          <div ref={imgRef} className="absolute -inset-y-12 inset-x-0 will-change-transform">
            {founder.photo && (
              <Image
                src={founder.photo}
                alt={`${founder.name}, ${founder.role}`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                loading="lazy"
                className="object-cover object-[50%_30%]"
              />
            )}
          </div>
          <div
            ref={lightRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
          />
          {/* Specular rake, same as the project thumbnails. */}
          <div
            aria-hidden="true"
            className="founder-rake pointer-events-none absolute -inset-y-1/2 left-[-45%] w-[38%] rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)] blur-[3px] will-change-[translate] motion-reduce:hidden"
          />
          {/* Bottom scrim + caption, set on the photograph. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgba(11,12,14,0.85),transparent)]"
          />
          <p className="absolute bottom-3 left-3 right-3 text-white sm:bottom-8 sm:left-10 sm:right-6">
            <span className="block text-base font-bold tracking-tight sm:text-2xl lg:text-[1.75rem]">{founder.name}</span>
            <span className="mt-1 block text-xs font-medium leading-snug text-white/80 sm:mt-1.5 sm:text-base lg:text-[1.0625rem]">
              {founder.role} · {founder.roleScope}
            </span>
          </p>
        </div>

        {/* Statement */}
        <div className="flex min-w-0 flex-col justify-center px-6 pb-[72px] pt-8 sm:px-10 sm:py-12 md:py-14 lg:py-20 lg:pl-16 lg:pr-[max(3rem,calc((100vw-1200px)/2))]">
          <p
            data-reveal="eyebrow"
            className="flex items-center gap-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-ink-soft md:text-xs"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-magenta" />
            Who builds it
          </p>
          <h2
            id="founder-strip-title"
            data-reveal="title"
            className="mt-3 max-w-[18ch] text-balance text-[clamp(2rem,0.6rem+3.4vw,3.25rem)] sm:mt-4 font-bold leading-[1.06] tracking-[-0.025em] text-ink"
          >
            You talk to the <Hl tone="magenta">founder</Hl>, never an account manager.
          </h2>
          <p
            data-reveal="lede"
            className="mt-3 max-w-[46ch] text-[0.9375rem] font-normal leading-relaxed text-white/85 sm:mt-6 sm:text-lg md:text-ink-soft"
          >
            One person owns the direction, keeps the work moving, and stays accountable for the result.
          </p>

          <div ref={proofRef} data-reveal="block" className="mt-5 sm:mt-8 md:mt-10">
            <span ref={ruleRef} aria-hidden="true" className="block h-px origin-left bg-white/50" />
            <dl className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-4">
              {PROOF.map((p, i) => (
                // dt before dd in the markup (valid <dl>), shown under it.
                <div key={p.label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-1 text-xs font-medium leading-tight text-ink-soft sm:mt-2 sm:text-sm">{p.label}</dt>
                  <dd className="text-[clamp(1.25rem,0.7rem+2.6vw,3rem)] font-bold leading-none tracking-[-0.025em] text-ink tabular-nums">
                    <span
                      ref={(el) => {
                        numRefs.current[i] = el;
                      }}
                    >
                      {p.value.toFixed(p.decimals)}
                    </span>
                    {p.suffix}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Link
            href="/about"
            data-reveal="lede"
            className="group mt-4 inline-flex min-h-11 w-fit items-center gap-1.5 text-sm sm:mt-8 sm:text-base md:mt-10 font-semibold text-ink underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
          >
            More about Adib
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </PixelSection>
  );
}
