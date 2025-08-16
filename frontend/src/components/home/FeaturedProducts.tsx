"use client";

import { useState, useEffect } from 'react';
import { Button, Spin, Alert } from 'antd';
import ProductCard from './ProductCard';
import { getFeaturedProducts, Product } from '@/services/product';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Öne çıkan ürünleri yükle
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const featuredProducts = await getFeaturedProducts();
        setProducts(featuredProducts);
      } catch (err) {
        console.error('Featured products fetch error:', err);
        setError('Öne çıkan ürünler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Öne Çıkan Ürünler
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            En popüler ve en çok tercih edilen ürünlerimizi keşfedin. 
            Kalite ve uygun fiyat garantisi ile.
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Öne Çıkan Ürünler
          </h2>
        </div>
        <Alert
          message="Hata"
          description={error}
          type="error"
          showIcon
          className="max-w-md mx-auto"
        />
      </section>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Öne Çıkan Ürünler
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Şu anda öne çıkan ürün bulunmuyor.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Öne Çıkan Ürünler
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          En popüler ve en çok tercih edilen ürünlerimizi keşfedin. 
          Kalite ve uygun fiyat garantisi ile.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* View All Products Button */}
      <div className="text-center mt-12">
        <Button
          type="primary"
          size="large"
          className="bg-blue-600 hover:bg-blue-700 border-0 h-12 px-8 text-lg"
          onClick={() => window.location.href = '/products'}
        >
          Tüm Ürünleri Görüntüle
        </Button>
      </div>
    </section>
  );
}
