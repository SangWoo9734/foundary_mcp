import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/ai-metadata"],
  outputFileTracingRoot: path.join(process.cwd(), "../../")
};

export default nextConfig;
