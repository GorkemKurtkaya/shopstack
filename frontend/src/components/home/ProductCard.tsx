"use client";

import { Card, Button, Rate, Tag, Carousel, message, notification } from 'antd';
import React from 'react';
import { ShoppingCartOutlined, EyeOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Product, getImageUrl } from '@/services/product';
import { addToCart } from '@/services/cart';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

const { Meta } = Card;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { incrementCartCount, isAuthenticated } = useCart();
  const [api, contextHolder] = notification.useNotification();
  
  // Görselleri kontrol et
  const hasMultipleImages = product.images && product.images.length > 1;
  const images = product.images && product.images.length > 0 ? product.images : [];

  // Sepete ekleme fonksiyonu
  const handleAddToCart = async () => {
    // Authentication kontrolü
    if (!isAuthenticated) {
      api.warning({
        message: 'Giriş Gerekli',
        description: 'Sepete eklemek için giriş yapmanız gerekiyor',
        placement: 'bottomLeft',
        duration: 3,
      });
      return;
    }

    try {
      const result = await addToCart(product._id, 1);
      
      if (result.success) {
        message.success(result.message);
        incrementCartCount(1); // Sepet sayısını anlık güncelle
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      message.error('Ürün sepete eklenirken hata oluştu');
    }
  };

  // Rating'i 0-5 arasında sınırla
  const rating = Math.min(Math.max(product.averageRating || 0, 0), 5);

  // Stok durumuna göre tag göster
  const stockStatus = product.stock > 0 ? 'green' : 'red';
  const stockText = product.stock > 0 ? 'Stokta' : 'Stok Yok';

  // Carousel için özel arrow'lar - ürünün altında
  const CustomArrow = ({ type, onClick }: { type: 'prev' | 'next'; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${
        type === 'prev' ? 'left-1' : 'right-1'
      }`}
    >
      {type === 'prev' ? <LeftOutlined className="text-xs" /> : <RightOutlined className="text-xs" />}
    </button>
  );

  return (
    <>
      {contextHolder}
      <Card
        hoverable
        className="product-card group"
      cover={
        <div className="relative overflow-hidden bg-gray-50">
          {hasMultipleImages ? (
            // Birden çok görsel varsa carousel
            <Carousel
              autoplay={true}
              autoplaySpeed={5000}
              dots={false}
              arrows={true}
              prevArrow={<CustomArrow type="prev" />}
              nextArrow={<CustomArrow type="next" />}
              className="product-carousel"
            >
              {images.map((image, index) => (
                <div key={index} className="flex items-center justify-center h-48">
                  <Image
                    src={getImageUrl(image)}
                    alt={`${product.name} - Görsel ${index + 1}`}
                    width={300}
                    height={300}
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            // Tek görsel varsa normal gösterim
            <div className="flex items-center justify-center h-48">
              <Image
                src={getImageUrl(images[0] || '')}
                alt={product.name}
                width={300}
                height={300}
                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
        </div>
      }
      actions={[
        <Button
          key="cart"
          type="text"
          icon={<ShoppingCartOutlined />}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 h-10 px-4 rounded-lg"
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
        >
          {product.stock > 0 ? 'Sepete Ekle' : 'Stok Yok'}
        </Button>,
        <Link href={`/products/${product._id}`}>
          <Button
            key="view"
            type="text"
            icon={<EyeOutlined />}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 h-10 px-4 rounded-lg"
          >
            Görüntüle
          </Button>
        </Link>
      ]}
    >
      <Meta
        title={
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
              {product.name}
            </h3>
          </div>
        }
        description={
          <div className="space-y-3">
            {/* Rating */}
            <div className="flex items-center space-x-2">
              <Rate disabled defaultValue={rating} className="text-sm" />
              <span className="text-gray-500 text-sm">
                ({rating.toFixed(1)})
              </span>
            </div>
            
            {/* Fiyat */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                ₺{product.price.toLocaleString('tr-TR')}
              </span>
            </div>
            
            {/* Kategori */}
            {product.category && typeof product.category === 'object' && 'name' in product.category && (
              <div className="text-sm text-gray-500">
                {product.category.name}
              </div>
            )}
            
            {/* Stok bilgisi */}
            <div className="text-sm text-gray-500">
              Stok: {product.stock} adet
            </div>
            
            {/* Tag'ler - Kategorinin altında */}
            <div className="flex flex-wrap gap-2 pt-2">
              {/* Stok durumu tag'i */}
              <Tag 
                color={stockStatus} 
                className="text-xs font-medium"
              >
                {stockText}
              </Tag>
              
              {/* Featured tag */}
              {product.featured && (
                <Tag color="blue" className="text-xs font-medium">
                  Öne Çıkan
                </Tag>
              )}
            </div>
          </div>
        }
      />
    </Card>
    </>
  );
}
