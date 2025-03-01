import { config } from 'dotenv';
import { searchAmazonProducts } from '../src/lib/services/amazonApiService.js';

// Load environment variables
config();

async function testAmazonApi() {
  try {
    console.log('Testing Amazon Product Advertising API...');
    const results = await searchAmazonProducts('laptop');
    console.log('API Results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testAmazonApi();