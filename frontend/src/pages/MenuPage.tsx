import { useEffect, useState } from 'react';
import type { Product, ProductCategory } from '../types';
import { CATEGORIES } from '../types';
import { getProducts } from '../api/menu';
import { CategoryTabs } from '../components/menu/CategoryTabs';
import { ProductGrid } from '../components/menu/ProductCard';
import { SkeletonProductGrid } from '../components/ui/Skeleton';

interface MenuPageProps {
  onAddToCart: (product: Product) => void;
}

export function MenuPage({ onAddToCart }: MenuPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    async function loadProducts() {
      try {
        const data = await getProducts();
        if (mounted) {
          setProducts(data);
          setFilteredProducts(data);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    loadProducts();
    
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeCategory) {
      setFilteredProducts(
        products.filter((p) => p.category === activeCategory)
      );
    } else {
      setFilteredProducts(products);
    }
  }, [activeCategory, products]);

  const handleCategorySelect = (category: string | null) => {
    setActiveCategory(category as ProductCategory | null);
  };

  return (
    <div className="py-6">
      {/* Hero section */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 text-balance">
          What are you craving today?
        </h1>
        <p className="text-neutral-600 mt-2">
          Fresh, delicious food ready for pickup or delivery
        </p>
      </div>

      {/* Category tabs */}
      <CategoryTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
        className="mb-6"
      />

      {/* Products */}
      {loading ? (
        <SkeletonProductGrid />
      ) : (
        <ProductGrid
          products={filteredProducts}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}