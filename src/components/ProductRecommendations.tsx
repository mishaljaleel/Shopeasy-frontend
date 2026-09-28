import React, { useState, useEffect } from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';
import api from '../api/client';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductRecommendationsProps {
  currentProductId?: number;
  categoryName?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  currentProductId,
  categoryName,
  title = 'You May Also Like',
  subtitle = 'Recommended based on your browsing interests and popular trending picks',
  limit = 4,
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<any>('/products', { params: { pageSize: 50 } })
      .then((res) => {
        const raw = res.data;
        let items: Product[] = Array.isArray(raw) ? raw : (raw?.items || []);

        // Exclude current product if viewing one
        if (currentProductId) {
          items = items.filter((p) => p.productID !== currentProductId);
        }

        // Prioritize same category if specified
        if (categoryName) {
          const sameCategory = items.filter((p) => p.categoryName?.toLowerCase() === categoryName.toLowerCase());
          const otherCategory = items.filter((p) => p.categoryName?.toLowerCase() !== categoryName.toLowerCase());
          items = [...sameCategory, ...otherCategory];
        }

        // Sort by highest rating or random shuffle
        setRecommendations(items.slice(0, limit));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentProductId, categoryName, limit]);

  if (loading || recommendations.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.productID} product={product} />
        ))}
      </div>
    </section>
  );
};
