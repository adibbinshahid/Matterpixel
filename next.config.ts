import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  images: {
    // TODO(demo): remove once real project imagery replaces the
    // picsum.photos placeholders in HeroFilmstrip.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
