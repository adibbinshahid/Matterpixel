"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiNodedotjs,
  SiFigma,
  SiVercel,
  SiShopify,
  SiStripe,
  SiPaypal,
  SiWordpress,
  SiSupabase,
} from "react-icons/si";
import { useReducedMotion } from "@/lib/useReducedMotion";

type TechItem = { name: string; Icon: IconType };

/** Web/product stack. Authentic logos only. */
const WEB_STACK: TechItem[] = [
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "React", Icon: SiReact },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Tailwind", Icon: SiTailwindcss },
  { name: "Framer Motion", Icon: SiFramer },
  { name: "Node.js", Icon: SiNodedotjs },
  { name: "Figma", Icon: SiFigma },
  { name: "Vercel", Icon: SiVercel },
  { name: "Shopify", Icon: SiShopify },
  { name: "Stripe", Icon: SiStripe },
  { name: "PayPal", Icon: SiPaypal },
  { name: "WordPress", Icon: SiWordpress },
  { name: "Supabase", Icon: SiSupabase },
];

const SPEED_PX_PER_SEC = 76.8;

export function TechMarquee() {
  const reduced = useReducedMotion();
  const track = [...WEB_STACK, ...WEB_STACK];
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(14);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const singleCopyWidth = el.scrollWidth / 2;
      if (singleCopyWidth > 0) setDuration(singleCopyWidth / SPEED_PX_PER_SEC);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-10"
        style={reduced ? undefined : { animation: `marquee ${duration}s linear infinite` }}
      >
        {track.map(({ name, Icon }, i) => (
          <Icon
            key={`${name}-${i}`}
            title={name}
            className="h-7 w-7 shrink-0 grayscale"
            style={{ color: "var(--ink-soft)", opacity: 0.35 }}
          />
        ))}
      </div>
    </div>
  );
}
