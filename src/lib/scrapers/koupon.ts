import { Deal } from '@prisma/client';
import puppeteer, { Browser, Page } from 'puppeteer';

interface KouponDeal {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  url: string;
  couponCode?: string;
  expiryDate?: Date;
}

export async function scrapeKouponDeals(): Promise<Deal[]> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000 // 60 seconds browser launch timeout
    });

    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000); // 30 seconds navigation timeout
    await page.setDefaultTimeout(10000); // 10 seconds default timeout for other operations

    // Navigate to Koupon.ai deals page
    await page.goto('https://koupon.ai/deals', {
      waitUntil: 'networkidle0'
    });

    // Wait for deals to load
    await page.waitForSelector('.deal-item');

    // Extract deals information
    const deals = await page.evaluate(() => {
      const dealItems = document.querySelectorAll('.deal-item');
      return Array.from(dealItems, item => {
        const id = item.getAttribute('data-deal-id') || '';
        const title = item.querySelector('.deal-title')?.textContent?.trim() || '';
        const description = item.querySelector('.deal-description')?.textContent?.trim() || '';
        const price = parseFloat(item.querySelector('.current-price')?.textContent?.replace(/[^0-9.]/g, '') || '0');
        const originalPrice = parseFloat(item.querySelector('.original-price')?.textContent?.replace(/[^0-9.]/g, '') || '0');
        const imageUrl = item.querySelector('.deal-image')?.getAttribute('src') || '';
        const productUrl = item.querySelector('.deal-link')?.getAttribute('href') || '';
        const couponCode = item.querySelector('.coupon-code')?.textContent?.trim() || null;
        const expiryDate = item.querySelector('.expiry-date')?.getAttribute('data-expiry') || null;

        return {
          id,
          title,
          description,
          price,
          originalPrice,
          imageUrl,
          productUrl,
          couponCode,
          expiryDate: expiryDate ? new Date(expiryDate) : null
        };
      });
    });

    if (!deals.length) {
      console.warn('No deals found on Koupon.ai');
      return [];
    }

    // Transform to Deal[]
    return deals.map(deal => ({
      id: `koupon-${deal.id}`,
      title: deal.title,
      description: deal.description,
      price: deal.price,
      oldPrice: deal.originalPrice,
      imageUrl: deal.imageUrl,
      productUrl: deal.productUrl,
      couponCode: deal.couponCode,
      expiresAt: deal.expiryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      source: 'Koupon.ai',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

  } catch (error: any) {
    console.error('Error scraping Koupon.ai deals:', error);
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      throw new Error('Failed to load Koupon.ai deals: Operation timed out');
    }
    throw new Error(`Failed to scrape Koupon.ai deals: ${error.message}`);
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}