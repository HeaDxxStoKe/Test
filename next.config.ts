import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Strava liefert Aktivitäts-/Athleten-Bilder von diesen Hosts.
    remotePatterns: [
      { protocol: "https", hostname: "dgalywyr863hv.cloudfront.net" },
      { protocol: "https", hostname: "graph.strava.com" },
    ],
  },
};

export default nextConfig;
