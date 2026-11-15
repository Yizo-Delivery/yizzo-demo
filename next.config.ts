import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A static site: Vercel (or any host) serves out/ with no server
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
