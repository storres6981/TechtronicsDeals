import { NextResponse } from 'next/server';
import { searchAmazonProducts } from '@/lib/services/amazonApiService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'deals';

    const results = await searchAmazonProducts(query);
    
    // Transform the Amazon API response into our product format
    const products = results.SearchResult?.Items?.map(item => ({
      title: item.ItemInfo.Title.DisplayValue,
      description: item.ItemInfo.Title.DisplayValue, // Using title as description since it's not provided in basic response
      price: item.Offers?.Listings[0]?.Price?.Amount || 0,
      oldPrice: item.Offers?.Listings[0]?.SavingBasis?.Amount,
      imageUrl: item.Images.Primary.Large.URL,
      productUrl: item.DetailPageURL,
      prime: item.Offers?.Listings[0]?.DeliveryInfo?.IsPrimeEligible || false,
      rating: item.CustomerReviews?.StarRating || 0,
      reviewCount: item.CustomerReviews?.Count || 0,
      asin: item.ASIN
    })) || [];

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}