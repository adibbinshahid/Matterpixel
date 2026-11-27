"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PixelPager } from "@/components/ui/PixelPager";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Calculator,
  Coffee,
  Dumbbell,
  Handshake,
  Heart,
  Layers,
  type LucideIcon,
  Package,
  Scale,
  Scissors,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  Store,
  Utensils,
  Workflow,
} from "lucide-react";
import { PixelSection } from "@/components/home/PixelSection";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Hl } from "@/components/home/Hl";

type Industry = {
  label: string;
  /** Small qualifier shown as a tag beside the name. */
  tag?: string;
  /** What we typically build for this industry — positioning, no claims. */
  build: string;
  items: { label: string; icon: LucideIcon }[];
  image: string;
  /** A live concept build in this industry, where one exists. */
  proof?: { name: string; href: string };
  /** Bento placement from lg up. */
  span: string;
};

/**
 * Six industries, each on its segment photograph. Where a concept build
 * exists in the sector, the tile links to it.
 */
const INDUSTRIES: Industry[] = [
  {
    label: "Ecommerce & D2C",
    build: "Fast storefronts, product visuals and automations that recover carts.",
    items: [
      { label: "Online stores", icon: ShoppingCart },
      { label: "Direct-to-consumer brands", icon: Package },
      { label: "Marketplace sellers", icon: Store },
    ],
    image: "/WhoWeWorkFor/property-physical-goods.webp",
    proof: { name: "ShopSphere", href: "/projects/shopsphere" },
    span: "xl:col-span-2",
  },
  {
    label: "Professional Services",
    build: "Credible sites, lead capture and the busywork automated.",
    items: [
      { label: "Consultancies", icon: Briefcase },
      { label: "Law firms", icon: Scale },
      { label: "Accountants & advisors", icon: Calculator },
    ],
    image: "/WhoWeWorkFor/regulated and relationshion driven.webp",
    span: "",
  },
  {
    label: "Health & Wellness",
    build: "Online booking, intake and reminders that fill the calendar.",
    items: [
      { label: "Clinics & practices", icon: Stethoscope },
      { label: "Therapists & coaches", icon: Heart },
      { label: "Fitness studios", icon: Dumbbell },
    ],
    image: "/WhoWeWorkFor/health-wellness.webp",
    proof: { name: "MindWell", href: "/projects/mindwell" },
    span: "",
  },
  {
    label: "Food & Hospitality",
    build: "Direct ordering that skips the delivery-app commission.",
    items: [
      { label: "Restaurants & delivery", icon: Utensils },
      { label: "Cafés & bakeries", icon: Coffee },
      { label: "Food & beverage brands", icon: Package },
    ],
    image: "/WhoWeWorkFor/Services businesses.webp",
    proof: { name: "L'Cinco Pizza", href: "/projects/lcinco-pizza" },
    span: "",
  },
  {
    label: "Beauty & Personal Care",
    build: "Premium brand sites and campaign visuals without a photoshoot.",
    items: [
      { label: "Skincare & cosmetics", icon: Sparkles },
      { label: "Salons & spas", icon: Scissors },
      { label: "Fragrance & grooming", icon: Heart },
    ],
    image: "/WhoWeWorkFor/beauty-personal-care.webp",
    proof: { name: "Scentora", href: "/projects/scentora" },
    span: "xl:col-span-2",
  },
  {
    label: "Agencies",
    tag: "White-label",
    build: "Overflow builds under your brand, under NDA.",
    items: [
      { label: "Overflow web builds", icon: Layers },
      { label: "AI automations", icon: Workflow },
      { label: "No client contact", icon: Handshake },
    ],
    image: "/WhoWeWorkFor/Digital First Businesses.webp",
    span: "",
  },
];

/**
 * The industries as a bento grid: six photo tiles of mixed widths, every
 * industry readable at a glance.
 *
 * Each tile carries its number, name and one line on what we build there;
 * on hover (or keyboard focus within) the photo eases in and brightens, a
 * magenta rim lights, and the business types rise from the bottom. Touch
 * screens and reduced motion show the types from the start.
 *
 * Sized so the section fits one screen view at every size: phones swipe
 * a row of cards; tablets show a compact 2×3 grid and laptops 3×2, with
 * the number inline beside the name; from xl the mixed-width bento, its
 * rows scaled to the screen height, with the business types rising in on
 * hover.
 */

export function WhoWeWorkFor() {
  // Phones: the swipe row's position, for the prev/next buttons (touch
  // users swipe; mouse users in a narrow window need the buttons).
  const rowRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [at, setAt] = useState(0);
  const onRowScroll = () => {
    const row = rowRef.current;
    if (!row) return;
    setEdge({ start: row.scrollLeft < 8, end: row.scrollLeft + row.clientWidth > row.scrollWidth - 8 });
    const card = row.firstElementChild as HTMLElement | null;
    if (!card) return;
    // The last card can't scroll to the start edge, so the end of the row
    // counts as the last card.
    const atEnd = row.scrollLeft + row.clientWidth > row.scrollWidth - 8;
    setAt(atEnd ? row.children.length - 1 : Math.round(row.scrollLeft / (card.offsetWidth + 12)));
  };
  const goTo = (i: number) => {
    const row = rowRef.current;
    const card = row?.children[i] as HTMLElement | undefined;
    if (!row || !card) return;
    row.scrollTo({ left: row.scrollLeft + card.getBoundingClientRect().left - row.getBoundingClientRect().left - 24, behavior: "smooth" });
  };
  const step = (dir: 1 | -1) => {
    const row = rowRef.current;
    const card = row?.firstElementChild as HTMLElement | null;
    if (!row || !card) return;
    row.scrollBy({ left: dir * (card.offsetWidth + 12), behavior: "smooth" });
  };
  return (
    <PixelSection seam labelledBy="industries-title">
      <div className="home-shell home-section">
        <SectionHeading
          id="industries-title"
          eyebrow="Industries"
          title={
            <>
              Where <Hl tone="blue">we</Hl> do our <Hl tone="magenta">best work</Hl>.
            </>
          }
          lede="Six sectors we know well — four with a live concept build you can open."
        />

        <ul
          id="industries-list"
          ref={rowRef}
          onScroll={onRowScroll}
          data-hscroll
          className="no-scrollbar -mx-6 mt-0 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-6 pb-7 pt-6 max-sm:-mb-6 sm:mx-0 sm:mt-6 sm:pt-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 md:mt-8 lg:grid-cols-3 xl:mt-10 xl:auto-rows-[clamp(210px,26svh,300px)] xl:grid-cols-4 xl:gap-4"
        >
          {INDUSTRIES.map((ind, i) => (
            <li
              key={ind.label}
              data-reveal="block"
              className={`bento-tile group relative isolate flex flex-col overflow-hidden rounded-[20px] grid-stroke p-5 max-sm:min-h-[240px] max-sm:w-[80vw] max-sm:max-w-[320px] max-sm:shrink-0 max-sm:snap-start max-sm:pt-[4.75rem] sm:p-5 xl:justify-start xl:rounded-[22px] xl:p-7 xl:pt-[4.5rem] ${ind.span}`}
            >
              <Image
                src={ind.image}
                alt=""
                fill
                loading="lazy"
                sizes="(min-width: 1280px) 50vw, (min-width: 640px) 33vw, 80vw"
                className="bento-img -z-20 object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,12,14,0.55)_0%,rgba(11,12,14,0.85)_55%,rgba(11,12,14,0.95)_100%)]"
              />

              <h3 className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-lg font-bold leading-tight tracking-tight text-white sm:text-xl xl:gap-x-3 xl:text-2xl">
                {/* Inline beside the name below xl; pinned top-left on the
                    bento tiles. */}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-magenta font-avenir text-xs font-extrabold tabular-nums text-white shadow-[0_6px_16px_-6px_rgba(255,46,147,0.7)] max-sm:absolute max-sm:left-5 max-sm:top-5 max-sm:h-9 max-sm:w-9 max-sm:text-sm xl:absolute xl:left-7 xl:top-6 xl:h-9 xl:w-9 xl:text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {ind.label}
                {ind.tag && (
                  <span className="rounded-full border border-white/30 px-2.5 py-1 text-xs font-bold uppercase leading-none tracking-[0.12em] text-white/90">
                    {ind.tag}
                  </span>
                )}
              </h3>
              <p className="mt-2 max-w-[34ch] text-sm leading-snug text-white/80 xl:text-base">{ind.build}</p>
              {ind.proof && (
                <Link
                  href={ind.proof.href}
                  className="tap-area group/proof mt-2.5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-magenta hover:decoration-magenta"
                >
                  <span className="h-1.5 w-1.5 shrink-0 bg-magenta" aria-hidden="true" />
                  Concept build: {ind.proof.name}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover/proof:-translate-y-0.5 group-hover/proof:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              )}

              {/* Business types: from xl only, rising in on hover / focus
                  (shown from the start on touch and under reduced motion). */}
              <div className="max-xl:hidden">
              <div className="bento-more">
                <div className="overflow-hidden">
                  <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-4 text-sm text-white/85">
                    {ind.items.map(({ label, icon: Icon }) => (
                      <li key={label} className="inline-flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-magenta" aria-hidden="true" />
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
          <PixelPager
            count={INDUSTRIES.length}
            index={at}
            onSelect={goTo}
            controls="industries-list"
            itemLabel="industry"
          />
          {/* Touch swipes; the arrows are for a mouse in a narrow window. */}
          <div className="flex gap-2 pointer-coarse:hidden">
          <button
            type="button"
            aria-controls="industries-list"
            aria-label="Previous industry"
            disabled={edge.start}
            onClick={() => step(-1)}
            className="grid-box flex h-11 w-11 items-center justify-center rounded-full text-white transition-[opacity,border-color] disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-controls="industries-list"
            aria-label="Next industry"
            disabled={edge.end}
            onClick={() => step(1)}
            className="grid-box flex h-11 w-11 items-center justify-center rounded-full text-white transition-[opacity,border-color] disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          </div>
        </div>
      </div>
    </PixelSection>
  );
}
