import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
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
 * screens and reduced motion show the types from the start. CSS only — no
 * script on this section beyond the shared entrance.
 */
export function WhoWeWorkFor() {
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

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-14 xl:auto-rows-[320px] xl:grid-cols-4">
          {INDUSTRIES.map((ind, i) => (
            <li
              key={ind.label}
              data-reveal="block"
              className={`bento-tile group relative isolate flex min-h-[300px] flex-col justify-start overflow-hidden rounded-[22px] border border-white/10 p-6 pt-[5.25rem] sm:p-7 sm:pt-[5.5rem] ${ind.span}`}
            >
              <Image
                src={ind.image}
                alt=""
                fill
                loading="lazy"
                sizes="(min-width: 640px) 50vw, 100vw"
                className="bento-img -z-20 object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(11,12,14,0.55)_0%,rgba(11,12,14,0.85)_55%,rgba(11,12,14,0.95)_100%)]"
              />

              <span className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-magenta font-avenir text-sm font-extrabold tabular-nums text-white shadow-[0_6px_16px_-6px_rgba(255,46,147,0.7)] sm:left-7 sm:top-7">
                {String(i + 1).padStart(2, "0")}
              </span>

              <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-2xl font-bold leading-tight tracking-tight text-white">
                {ind.label}
                {ind.tag && (
                  <span className="rounded-full border border-white/30 px-2.5 py-1 text-[0.6875rem] font-bold uppercase leading-none tracking-[0.12em] text-white/90">
                    {ind.tag}
                  </span>
                )}
              </h3>
              <p className="mt-2 max-w-[34ch] text-base leading-snug text-white/80">{ind.build}</p>
              {ind.proof && (
                <Link
                  href={ind.proof.href}
                  className="group/proof mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-magenta hover:decoration-magenta"
                >
                  <span className="h-1.5 w-1.5 shrink-0 bg-magenta" aria-hidden="true" />
                  Concept build: {ind.proof.name}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover/proof:-translate-y-0.5 group-hover/proof:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              )}

              {/* Business types: rise in on hover / focus; always shown on
                  touch and under reduced motion. */}
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
            </li>
          ))}
        </ul>
      </div>
    </PixelSection>
  );
}
