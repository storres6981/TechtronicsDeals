import { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  images: {
    domains: ['images-na.ssl-images-amazon.com', 'i.imgur.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/TechtronicsDeals' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/TechtronicsDeals/' : '',
  trailingSlash: true,
};

export default config;