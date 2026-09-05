import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  async headers() {
    return [
      {
        // Self-hosted behind Cloudflare/nginx with no per-deploy cache purge:
        // Next's default `s-maxage=31536000` on static pages means a shared
        // cache can keep serving a pre-deploy HTML shell that references JS
        // chunk hashes the new build no longer ships, so hydration 404s and
        // every animation goes dead while the page still looks "the same".
        // `no-cache` forces a conditional revalidation on every deploy
        // instead (cheap: served straight from ETag) without losing caching
        // for the content-hashed static assets below.
        source: "/:path*",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
