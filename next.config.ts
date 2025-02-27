import { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/TechtronicsDeals' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/TechtronicsDeals/' : '',
};

export default config;