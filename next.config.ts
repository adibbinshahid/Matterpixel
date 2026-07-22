import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // TODO(demo): remove once real project imagery replaces the
    // picsum.photos placeholders in HeroFilmstrip.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
