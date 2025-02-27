import { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['images-na.ssl-images-amazon.com', 'i.imgur.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  basePath: process.env.NODE_ENV === 'production' ? '/techtronicsdeals' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/techtronicsdeals/' : '',
  trailingSlash: true,
  distDir: 'out',
  experimental: {
    appDir: true
  }
};

export default config;