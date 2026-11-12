import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vinext also pre-parses multipart API requests as potential server actions.
  // Allow an 8 MB photo plus form overhead; the upload route enforces its limit.
  experimental: { serverActions: { bodySizeLimit: 9 * 1024 * 1024 } },
};

export default nextConfig;
