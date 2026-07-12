import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "motion/react";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { Loader } from "@/components/Loader";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PageReveal } from "@/components/PageReveal";
import { RouteTransition } from "@/components/RouteTransition";
import { siteUrl, brand } from "@/content/siteConfig";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Matterpixel — We build what matters. Down to the pixel.",
    template: "%s — Matterpixel",
  },
  description:
    "Matterpixel is a digital agency engineering web, product, and brand experiences that scale, convert, and last. 90+ PageSpeed, guaranteed.",
  keywords: [
    "digital agency",
    "web development",
    "product design",
    "branding",
    "Next.js agency",
  ],
  authors: [{ name: "Matterpixel" }],
  openGraph: {
    title: "Matterpixel — We build what matters. Down to the pixel.",
    description:
      "From consumer brands to complex platforms, we engineer digital experiences that scale, convert, and last.",
    url: siteUrl,
    siteName: "Matterpixel",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matterpixel — We build what matters. Down to the pixel.",
    description:
      "From consumer brands to complex platforms, we engineer digital experiences that scale, convert, and last.",
    images: ["/api/og"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Matterpixel",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  email: brand.email,
  description:
    "Matterpixel is a founder-led digital studio engineering fast, accessible, senior-led web products.",
  sameAs: [
    "https://linkedin.com",
    "https://behance.net",
    "https://x.com",
    "https://dribbble.com",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interTight.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-paper text-ink" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-blue focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
          <Loader />
          <SmoothScrollProvider>
            <Nav />
            <main id="main">
              <PageReveal>
                <RouteTransition>{children}</RouteTransition>
              </PageReveal>
            </main>
            <Footer />
          </SmoothScrollProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
