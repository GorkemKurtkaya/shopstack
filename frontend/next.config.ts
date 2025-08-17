import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["antd", "@ant-design/icons"],
  experimental: {
    optimizePackageImports: ["antd"],
  },
  env: {
    ANTD_COMPATIBLE: "true",
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      antd: require.resolve("antd"),
    };
    config.ignoreWarnings = [
      {
        module: /antd/,
        message: /antd v5 support React is 16 ~ 18/,
      },
    ];

    return config;
  },
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
