import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy. Everything the site loads is self-hosted (fonts
 * via next/font, media under /public) except Vercel Analytics and the
 * Cloudflare Turnstile bot check on the forms. Scripts keep
 * 'unsafe-inline' because Next's hydration payload and the JSON-LD blocks
 * are inline, and a per-request nonce would force every page to render
 * dynamically. Dev adds 'unsafe-eval' for React Refresh.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://challenges.cloudflare.com${isDev ? " ws: wss:" : ""}`,
  // Cloudflare Turnstile (the forms' bot check) runs in an iframe.
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The share-card route reads its fonts from disk at runtime.
  outputFileTracingIncludes: {
    "/api/og": ["./app/api/og/*.ttf"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Long-lived caching for the heavy, rarely-changed media under
        // /public. File names change when the asset changes.
        source: "/:dir(videos|projects|services|textures|fonts)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        // Agency enquiries moved off the project form onto the white-label
        // strip's direct WhatsApp / email links.
        source: "/contact",
        has: [{ type: "query", key: "tab", value: "partner" }],
        destination: "/#white-label",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
