'use client';

import { PrismaClient, Deal } from '@prisma/client';
import { scrapeAmazonDeals } from '../scrapers/amazon';
import { scrapeKouponDeals } from '../scrapers/koupon';
import { searchAmazonProducts } from './amazonApiService';

const prisma = new PrismaClient();

export async function getAllDeals(): Promise<Deal[]> {
  return prisma.deal.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function syncDeals(): Promise<void> {
  try {
    // Fetch deals from multiple sources with error handling
    const results = await Promise.allSettled([
      scrapeAmazonDeals(),
      scrapeKouponDeals()
    ]);

    const allDeals = results.reduce((deals, result) => {
      if (result.status === 'fulfilled') {
        return [...deals, ...result.value];
      }
      console.error('Error fetching deals:', result.reason);
      return deals;
    }, []);

    if (allDeals.length === 0) {
      throw new Error('No deals could be fetched from any source');

    // Upsert deals into database
    for (const deal of allDeals) {
      await prisma.deal.upsert({
        where: { id: deal.id },
        update: {
          title: deal.title,
          description: deal.description,
          price: deal.price,
          oldPrice: deal.oldPrice,
          imageUrl: deal.imageUrl,
          productUrl: deal.productUrl,
          couponCode: deal.couponCode,
          expiresAt: deal.expiresAt,
          source: deal.source,
          updatedAt: new Date()
        },
        create: deal
      });
    }

    // Clean up expired deals
    await prisma.deal.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error syncing deals:', error);
    throw error;
  }
}

export async function getDealById(id: string): Promise<Deal | null> {
  return prisma.deal.findUnique({
    where: { id }
  });
}

export async function searchDeals(query: string): Promise<Deal[]> {
  const [dbDeals, amazonProducts] = await Promise.all([
    prisma.deal.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    searchAmazonProducts(query)
  ]);

  return [...dbDeals, ...amazonProducts];
}