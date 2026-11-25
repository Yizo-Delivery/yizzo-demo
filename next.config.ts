import { existsSync } from "node:fs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A static site: Vercel (or any host) serves out/ with no server
  output: "export",
  // The welcome photo is optional until the licensed one arrives
  env: { NEXT_PUBLIC_HAS_WELCOME_PHOTO: existsSync("public/welcome.jpg") ? "1" : "" },
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
