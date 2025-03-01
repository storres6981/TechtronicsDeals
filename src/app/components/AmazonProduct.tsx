import Image from 'next/image';
import { formatPrice } from '@/lib/utils/format';

export interface AmazonProductProps {
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  productUrl: string;
  prime?: boolean;
  rating?: number;
  reviewCount?: number;
  asin: string;
}

export function AmazonProduct({
  title,
  description,
  price,
  oldPrice,
  imageUrl,
  productUrl,
  prime = false,
  rating,
  reviewCount,
  asin
}: AmazonProductProps) {
  const formattedPrice = formatPrice(price);
  const formattedOldPrice = oldPrice ? formatPrice(oldPrice) : null;
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-100">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-contain p-2"
        />
        {prime && (
          <div className="absolute top-2 right-2">
            <Image
              src="/prime-badge.png"
              alt="Amazon Prime"
              width={40}
              height={20}
            />
          </div>
        )}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-bold">
            -{discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>

        <div className="flex items-center mb-4">
          {rating && (
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {reviewCount && (
                <span className="text-gray-600 text-sm ml-2">
                  ({reviewCount.toLocaleString()})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">{formattedPrice}</span>
            {formattedOldPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                {formattedOldPrice}
              </span>
            )}
          </div>
        </div>

        <a
          href={`${productUrl}?tag=${process.env.NEXT_PUBLIC_AMAZON_TRACKING_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#FF9900] hover:bg-[#FF8C00] text-white font-bold py-2 px-4 rounded text-center transition-colors"
          data-asin={asin}
        >
          View on Amazon
        </a>
      </div>
    </div>
  );
}