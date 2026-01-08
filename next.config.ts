import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shikijs/core", "@shikijs/engine-javascript", "@shikijs/langs", "@shikijs/themes", "@shikijs/types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ensure proper resolution of ESM modules
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
      ".mjs": [".mjs", ".mts"],
    };
    return config;
  },
};

export default nextConfig;
