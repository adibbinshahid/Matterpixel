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
import type { IconType } from "react-icons";

export type TechItem = { name: string; Icon: IconType };

/** Web/product stack. Authentic logos only. */
export const WEB_STACK: TechItem[] = [
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
