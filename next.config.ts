import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow server actions and API routes to read/write files
  serverExternalPackages: ["js-yaml", "dockerode"],
};

export default nextConfig;
