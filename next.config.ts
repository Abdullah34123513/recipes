import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  images: {
    domains: [
      'cloud.foodista.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'www.foodista.com',
      'i.imgur.com',
      'upload.wikimedia.org',
      'cdn.pixabay.com',
      'www.publicdomainpictures.net',
      'www.maxpixel.net',
      'www.freeimages.com',
      'www.pexels.com',
      'burst.shopifycdn.com',
      'images.pexels.com'
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ['**/*'], // 忽略所有文件变化
      };
    }
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
