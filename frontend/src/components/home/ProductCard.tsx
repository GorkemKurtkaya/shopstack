"use client";

import { Card, Button, Rate, Tag, Carousel, notification } from 'antd';
import React from 'react';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Product, getImageUrl } from '@/services/product';
import { addToCart } from '@/services/cart';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Meta } = Card;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { incrementCartCount, isAuthenticated } = useCart();
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();
  
  const hasMultipleImages = product.images && product.images.length > 1;
  const images = product.images && product.images.length > 0 ? product.images : [];


  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
        api.success({ message: result.message, placement: 'bottomLeft' });
        incrementCartCount(1); 
      } else {
        api.error({ message: result.message, placement: 'bottomLeft' });
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      api.error({ message: 'Ürün sepete eklenirken hata oluştu', placement: 'bottomLeft' });
    }
  };

  const rating = Math.min(Math.max(product.averageRating || 0, 0), 5);

  const stockStatus = product.stock > 0 ? 'green' : 'red';
  const stockText = product.stock > 0 ? 'Stokta' : 'Stok Yok';

  

  return (
    <>
      {contextHolder}
      <Card
        hoverable
        className="product-card group cursor-pointer"
        onClick={() => router.push(`/products/${product._id}`)}
      cover={
        <div className="relative overflow-hidden bg-gray-50">
          {hasMultipleImages ? (
            <Carousel
              autoplay={true}
              autoplaySpeed={5000}
              dots={false}
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
          onClick={(e) => handleAddToCart(e)}
        >
          {product.stock > 0 ? 'Sepete Ekle' : 'Stok Yok'}
        </Button>,
        <Button
          key="view"
          type="text"
          icon={<EyeOutlined />}
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 h-10 px-4 rounded-lg"
          onClick={(e) => { e.stopPropagation(); router.push(`/products/${product._id}`); }}
        >
          Görüntüle
        </Button>
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
            <div className="flex items-center space-x-2">
              <Rate disabled defaultValue={rating} className="text-sm" />
              <span className="text-gray-500 text-sm">
                ({rating.toFixed(1)})
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                ₺{product.price.toLocaleString('tr-TR')}
              </span>
            </div>
            
            {product.category && typeof product.category === 'object' && 'name' in product.category && (
              <div className="text-sm text-gray-500">
                {product.category.name}
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              Stok: {product.stock} adet
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <Tag 
                color={stockStatus} 
                className="text-xs font-medium"
              >
                {stockText}
              </Tag>
              
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
