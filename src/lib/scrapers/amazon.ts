import { Deal } from '@prisma/client';
import puppeteer from 'puppeteer';

interface AmazonDeal {
  asin: string;
  title: string;
  description: string;
  currentPrice: number;
  originalPrice: number;
  imageUrl: string;
  productUrl: string;
}

const AMAZON_STORE_ID = process.env.AMAZON_STORE_ID || '';

function getAffiliateUrl(asin: string): string {
  return `https://amazon.com/dp/${asin}?tag=${AMAZON_STORE_ID}`;
}

export async function scrapeAmazonDeals(): Promise<Deal[]> {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Navigate to Amazon Deals page
    await page.goto('https://www.amazon.com/deals', {
      waitUntil: 'networkidle0',
    });

    // Wait for deals to load
    await page.waitForSelector('[data-testid="deal-card"]');

    // Extract deals information
    const deals = await page.evaluate(() => {
      const dealCards = document.querySelectorAll('[data-testid="deal-card"]');
      return Array.from(dealCards, card => {
        const asin = card.getAttribute('data-asin') || '';
        const title = card.querySelector('.deal-title')?.textContent?.trim() || '';
        const description = card.querySelector('.deal-description')?.textContent?.trim() || '';
        const currentPrice = parseFloat(card.querySelector('.deal-price')?.textContent?.replace('$', '') || '0');
        const originalPrice = parseFloat(card.querySelector('.list-price')?.textContent?.replace('$', '') || '0');
        const imageUrl = card.querySelector('img')?.getAttribute('src') || '';

        return {
          asin,
          title,
          description,
          currentPrice,
          originalPrice,
          imageUrl
        };
      });
    });

    // Transform AmazonDeal[] to Deal[]
    return deals.map(deal => ({
      id: `amazon-${deal.asin}`,
      title: deal.title,
      description: deal.description,
      price: deal.currentPrice,
      oldPrice: deal.originalPrice,
      imageUrl: deal.imageUrl,
      productUrl: getAffiliateUrl(deal.asin),
      source: 'Amazon',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Deals typically expire in 24 hours
      createdAt: new Date(),
      updatedAt: new Date(),
      couponCode: null
    }));

  } catch (error) {
    console.error('Error scraping Amazon deals:', error);
    throw new Error(`Failed to scrape Amazon deals: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}