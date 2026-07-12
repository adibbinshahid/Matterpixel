import type { Metadata } from "next";
import { Hero } from "@/components/Hero";

export const metadata: Metadata = {
  title: "Matterpixel — We build what matters. Down to the pixel.",
  description:
    "A new digital studio engineering fast, accessible, senior-led web products. 90+ PageSpeed guaranteed. See our demo builds and take on a founding-client project.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <Hero />;
}
