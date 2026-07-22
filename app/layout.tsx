import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { MotionConfig } from "motion/react";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
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

// Avenir has no dedicated "Bold" cut — Heavy is the standard stand-in
// (Avenir Next is the only variant with a true Bold weight).
const avenir = localFont({
  src: "../public/fonts/Avenir-Heavy.ttf",
  variable: "--font-avenir",
  weight: "700",
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
    <html lang="en" className={`${interTight.variable} ${avenir.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-paper text-ink" suppressHydrationWarning>
        {/* Solid black on the very first paint (present in the raw server
            HTML, so there's no flash of the light page underneath before
            this even renders), fading away quickly on its own via a plain
            CSS animation — no JS, no gating, so it can never get stuck. The
            whole page underneath is already fully rendered by the time this
            clears, so everything arrives together in one moment. */}
        <div id="mp-load-mask" aria-hidden="true" suppressHydrationWarning />
        {/* Must run before the browser's own automatic scroll restoration
            (which happens synchronously during navigation, before React
            ever hydrates) — a reload should always land at the top of the
            page, never wherever you'd previously scrolled to. Setting this
            from a React effect runs too late to preempt it; `beforeInteractive`
            is the earliest Next.js lets a script run. */}
        <Script id="disable-scroll-restoration" strategy="beforeInteractive">
          {`if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; } window.scrollTo(0, 0);`}
        </Script>
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
        <Analytics />
      </body>
    </html>
  );
}
