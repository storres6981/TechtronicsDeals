/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['m.media-amazon.com', 'images-na.ssl-images-amazon.com']
  },
  basePath: process.env.NODE_ENV === 'production' ? '/TechtronicsDeals' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/TechtronicsDeals/' : '',
  trailingSlash: true,
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AMAZON_ACCESS_KEY: process.env.AMAZON_ACCESS_KEY,
    AMAZON_SECRET_KEY: process.env.AMAZON_SECRET_KEY,
    AMAZON_STORE_ID: process.env.AMAZON_STORE_ID
  }
}

module.exports = nextConfig