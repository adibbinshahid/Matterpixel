import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { CalInit } from "@/components/CalInit";
import { MotionConfig } from "motion/react";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MobileStickyCta } from "@/components/home/MobileStickyCta";
import { PageReveal } from "@/components/PageReveal";
import { RouteTransition } from "@/components/RouteTransition";
import { siteUrl, brand, WHATSAPP_NUMBER } from "@/content/siteConfig";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Avenir has no dedicated "Bold" cut — Heavy is the standard stand-in
// (Avenir Next is the only variant with a true Bold weight).
const avenir = localFont({
  // WOFF2, not the raw .ttf sitting beside it — same outlines, ~a third the
  // bytes (173KB -> 57KB).
  src: "../public/fonts/Avenir-Heavy.woff2",
  variable: "--font-avenir",
  weight: "700",
  display: "swap",
});

const DEFAULT_TITLE = "Matterpixel — Web Development & AI Automation Studio";
const DEFAULT_DESCRIPTION =
  "Founder-led studio building fast websites, web apps and AI automation for growing brands. Fixed quotes, fast delivery, and you own everything we build.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_TITLE,
    template: "%s — Matterpixel",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "Matterpixel",
  authors: [{ name: brand.founder, url: `${siteUrl}/about` }],
  creator: brand.founder,
  publisher: "Matterpixel",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl,
    siteName: "Matterpixel",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Matterpixel" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/api/og"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  // Added to a phone's home screen, the site opens full-screen like an
  // app, under a status bar that blends into the dark nav.
  appleWebApp: { capable: true, title: "Matterpixel", statusBarStyle: "black-translucent" },
  // Google Search Console ownership check (HTML-tag method). Set the token
  // as GOOGLE_SITE_VERIFICATION in Vercel; absent, no tag is rendered.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0e",
  width: "device-width",
  initialScale: 1,
  // Paint under the notch / home indicator; fixed chrome pads itself back
  // out with env(safe-area-inset-*) (zero without this).
  viewportFit: "cover",
  // Android: the software keyboard shrinks the layout viewport, so
  // dvh-sized and bottom-pinned UI moves above it instead of under it.
  interactiveWidget: "resizes-content",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#organization`,
      name: "Matterpixel",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      image: `${siteUrl}/api/og`,
      email: brand.email,
      telephone: WHATSAPP_NUMBER,
      description:
        "Matterpixel is a founder-led digital studio building websites, web apps and AI automation, built with vetted specialists.",
      slogan: brand.tagline,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dhaka",
        addressCountry: "BD",
      },
      areaServed: "Worldwide",
      knowsLanguage: ["en", "bn"],
      founder: { "@id": `${siteUrl}/#founder` },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: brand.email,
        availableLanguage: ["English", "Bengali"],
        url: `${siteUrl}/contact`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#founder`,
      name: brand.founder,
      jobTitle: "Founder & Lead",
      url: `${siteUrl}/about`,
      image: `${siteUrl}/founder.webp`,
      worksFor: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Matterpixel",
      url: siteUrl,
      inLanguage: "en",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
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
            <MobileStickyCta />
          </SmoothScrollProvider>
        </MotionConfig>
        <Analytics />
        <CalInit />
      </body>
    </html>
  );
}
