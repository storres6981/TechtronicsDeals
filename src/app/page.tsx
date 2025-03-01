import Image from "next/image";
import Link from "next/link";
import { AmazonProduct } from './components/AmazonProduct';

export default async function Home() {
  try {
    // Use relative URL to work in both development and production environments
    const response = await fetch('/api/products', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Featured Tech Deals</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <AmazonProduct
              key={product.asin}
              {...product}
            />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading products:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-600">Failed to load products. Please try again later.</p>
      </div>
    );
  }
}
