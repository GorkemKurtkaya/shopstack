"use client";

import { useState, useEffect } from 'react';
import { Input, Select, Button, Spin, Alert, Empty, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import ProductCard from '@/components/home/ProductCard';
import HeroCarousel from '@/components/home/HeroCarousel';
import { getAllProducts, Product } from '@/services/product';
import { getActiveCategories, Category } from '@/services/category';
import { useSearchParams } from 'next/navigation';

const { Search } = Input;
const { Option } = Select;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize] = useState(12);

  // URL'den kategori parametresini oku
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      // URL'de kategori parametresi yoksa filtreleri temizle
      setSelectedCategory('');
      setSearchTerm('');
      setSortBy('name');
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Tüm ürünleri ve kategorileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Paralel olarak ürünleri ve kategorileri çek
        const [productsResponse, categoriesResponse] = await Promise.all([
          getAllProducts(),
          getActiveCategories()
        ]);
        
        setProducts(productsResponse.items || []);
        setTotalProducts(productsResponse.total || 0);
        setCategories(categoriesResponse);
      } catch (err) {
        console.error('Data fetch error:', err);
        setError('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtreleme ve arama
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      (typeof product.category === 'object' && product.category._id === selectedCategory) ||
      (typeof product.category === 'string' && product.category === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Sıralama
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  // Sayfalama
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Filtreleri temizle
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
    setCurrentPage(1);
  };

  // Seçili kategori bilgisi
  const selectedCategoryInfo = categories.find(c => c._id === selectedCategory);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert
            message="Hata"
            description={error}
            type="error"
            showIcon
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      <div className="mb-8">
        <HeroCarousel />
      </div>
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sayfa Başlığı */}
          <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {selectedCategoryInfo ? `${selectedCategoryInfo.name} Ürünleri` : 'Tüm Ürünler'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {selectedCategoryInfo 
              ? `${selectedCategoryInfo.name} kategorisinde ${filteredProducts.length} ürün bulundu`
              : `${totalProducts} ürün arasından size en uygun olanı bulun`
            }
          </p>
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="md:col-span-2">
              <Search
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={(value) => setSearchTerm(value)}
                size="large"
                prefix={<SearchOutlined />}
              />
            </div>

            {/* Kategori Filtresi */}
            <Select
              placeholder="Kategori seçin"
              value={selectedCategory}
              onChange={setSelectedCategory}
              size="large"
              allowClear
              className="w-full"
              loading={loading}
            >
              {categories.map(category => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>

            {/* Sıralama */}
            <Select
              placeholder="Sırala"
              value={sortBy}
              onChange={setSortBy}
              size="large"
              className="w-full"
            >
              <Option value="name">İsme göre</Option>
              <Option value="price-low">Fiyat (Düşük → Yüksek)</Option>
              <Option value="price-high">Fiyat (Yüksek → Düşük)</Option>
              <Option value="rating">Rating'e göre</Option>
              <Option value="newest">En yeni</Option>
            </Select>
          </div>

          {/* Filtreleri Temizle */}
          {(searchTerm || selectedCategory || sortBy !== 'name') && (
            <div className="mt-4 flex justify-center">
              <Button
                icon={<ClearOutlined />}
                onClick={clearFilters}
                type="text"
                className="text-gray-500 hover:text-gray-700"
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>

        {/* Sonuç Bilgisi */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} ürün bulundu
            {searchTerm && ` "${searchTerm}" için`}
            {selectedCategory && ` ${selectedCategoryInfo?.name} kategorisinde`}
          </p>
        </div>

        {/* Ürün Listesi */}
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Sayfalama */}
            {filteredProducts.length > pageSize && (
              <div className="flex justify-center">
                <Pagination
                  current={currentPage}
                  total={filteredProducts.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} / ${total} ürün`
                  }
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description={
              <span className="text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Arama kriterlerinize uygun ürün bulunamadı' 
                  : 'Henüz ürün bulunmuyor'
                }
              </span>
            }
            className="my-16"
          />
        )}
        </div>
      </div>
    </div>
  );
}
