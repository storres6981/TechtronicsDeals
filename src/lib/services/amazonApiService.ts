import * as api from 'paapi5-nodejs-sdk';

const defaultClient = api.ApiClient.instance;
defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY || '';
defaultClient.secretKey = process.env.AMAZON_SECRET_KEY || '';
defaultClient.host = 'webservices.amazon.com';
defaultClient.region = 'us-east-1';

const apiInstance = new api.DefaultApi();

export async function searchAmazonProducts(query: string) {
  try {
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY || !process.env.AMAZON_STORE_ID) {
      throw new Error('Amazon API credentials are not properly configured');
    }

    const searchItemsRequest = new api.SearchItemsRequest();
    
    // Set the partner tag (store/tracking id)
    searchItemsRequest.PartnerTag = process.env.AMAZON_STORE_ID;
    
    // Set the partner type
    searchItemsRequest.PartnerType = 'Associates';
    
    // Set search keywords
    searchItemsRequest.Keywords = query;
    
    // Set the item count
    searchItemsRequest.ItemCount = 10;
    
    // Set the resources to retrieve
    searchItemsRequest.Resources = [
      'ItemInfo.Title',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'Images.Primary.Large',
      'CustomerReviews.StarRating',
      'CustomerReviews.Count',
      'Offers.Listings.DeliveryInfo.IsPrimeEligible'
    ];

    const response = await apiInstance.searchItems(searchItemsRequest);
    return response;
  } catch (error) {
    console.error('Error in Amazon API service:', error);
    throw error;
  }
}