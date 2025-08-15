import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['antd', '@ant-design/icons'],
  experimental: {
    optimizePackageImports: ['antd']
  }
};

export default nextConfig;
