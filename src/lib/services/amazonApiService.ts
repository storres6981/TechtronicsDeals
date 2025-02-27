import { Deal } from '@prisma/client';
import crypto from 'crypto';
import axios from 'axios';

interface AmazonApiConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region: string;
  host: string;
}

const config: AmazonApiConfig = {
  accessKey: process.env.AMAZON_ACCESS_KEY || '',
  secretKey: process.env.AMAZON_SECRET_KEY || '',
  partnerTag: process.env.AMAZON_STORE_ID || '',
  region: 'us-east-1',
  host: 'webservices.amazon.com'
};

function generateSignature(stringToSign: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('base64');
}

function getAmzDate(): string {
  const date = new Date();
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function createAuthHeader(method: string, path: string, payload: string, amzDate: string): string {
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${amzDate.slice(0, 8)}/${config.region}/ProductAdvertisingAPI/aws4_request`;
  const canonicalRequest = [
    method,
    path,
    '',
    'content-type:application/json; charset=utf-8',
    `host:${config.host}`,
    `x-amz-date:${amzDate}`,
    '',
    'content-type;host;x-amz-date',
    crypto.createHash('sha256').update(payload).digest('hex')
  ].join('\n');

  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  const signature = generateSignature(stringToSign, config.secretKey);

  return `${algorithm} Credential=${config.accessKey}/${credentialScope}, SignedHeaders=content-type;host;x-amz-date, Signature=${signature}`;
}

export async function searchAmazonProducts(keyword: string): Promise<Deal[]> {
  if (!config.accessKey || !config.secretKey || !config.partnerTag) {
    throw new Error('Amazon API configuration is incomplete');
  }

  const path = '/paapi5/searchitems';
  const payload = JSON.stringify({
    Keywords: keyword,
    Resources: [
      'ItemInfo.Title',
      'ItemInfo.Features',
      'ItemInfo.ByLineInfo',
      'ItemInfo.ProductInfo',
      'Offers.Listings.Price',
      'Offers.Listings.SavePrice',
      'Offers.Listings.Availability',
      'Images.Primary.Large'
    ],
    PartnerTag: config.partnerTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.com',
    ItemCount: 10,
    Availability: 'Available',
    SortBy: 'Relevance'
  });

  const amzDate = getAmzDate();
  const authHeader = createAuthHeader('POST', path, payload, amzDate);

  try {
    const response = await axios.post(`https://${config.host}${path}`, payload, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Amz-Date': amzDate,
        'Authorization': authHeader
      }
    });

    if (!response.data?.ItemsResult?.Items) {
      console.warn('No items found in Amazon API response');
      return [];
    }

    return response.data.ItemsResult.Items
      .filter((item: any) => {
        return item.Offers?.Listings?.[0]?.Price && 
               item.ItemInfo?.Title?.DisplayValue &&
               item.Images?.Primary?.Large?.URL;
      })
      .map((item: any) => {
        const listing = item.Offers.Listings[0];
        const price = listing.Price.Amount;
        const oldPrice = listing.SavePrice?.Amount || price * 1.2; // Estimate original price if not provided

        return {
          id: `amazon-${item.ASIN}`,
          title: item.ItemInfo.Title.DisplayValue,
          description: item.ItemInfo.Features?.DisplayValues?.join('\n') || 
                      item.ItemInfo.ProductInfo?.DisplayValue || '',
          price,
          oldPrice,
          imageUrl: item.Images.Primary.Large.URL,
          productUrl: `https://amazon.com/dp/${item.ASIN}?tag=${config.partnerTag}`,
          source: 'Amazon API',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          couponCode: null
        };
      });
  } catch (error: any) {
    console.error('Error fetching Amazon products:', error.response?.data || error.message);
    if (error.response?.status === 429) {
      throw new Error('Amazon API rate limit exceeded. Please try again later.');
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid Amazon API credentials.');
    }
    throw new Error(`Failed to fetch Amazon products: ${error.message}`);
  }
}