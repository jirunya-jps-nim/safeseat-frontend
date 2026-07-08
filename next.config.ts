import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set the root directory of the Turbopack build to this project's directory
    root: __dirname,
  },
};

export default nextConfig;
