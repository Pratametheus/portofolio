import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: '6mb'
    }
  },
  images: {
    // Cloudflare Workers Free plan: every `/_next/image` request invokes the
    // Worker and counts against the 100k/day cap. The portfolio's images are a
    // handful of pre-sized .webp files under public/, so serve them straight
    // from static assets (free, no Worker) instead of on-the-fly optimisation.
    unoptimized: true
  }
};

export default createNextIntlPlugin()(nextConfig);

initOpenNextCloudflareForDev();
