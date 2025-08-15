"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col, 
  Tag, 
  Image, 
  Switch, 
  message, 
  Space,
  Typography,
  Spin,
  Alert,
  Descriptions,
  Divider,
  Statistic
} from 'antd';
import { 
  IconArrowLeft, 
  IconEdit, 
  IconTrash,
  IconStar,
  IconShoppingCart,
  IconCurrencyDollar
} from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { getProductById, updateProductStatus, deleteProduct, Product, getImageUrl } from '@/services/product';
import { getCategoryById } from '@/services/category';
import ProductEditModal from '../producteditModal';

const { Title, Text } = Typography;

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<{ _id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  // Ürün verilerini yükle
  const fetchProduct = useCallback(async () => {
    try {
      setInitialLoading(true);
      const data = await getProductById(productId);
      setProduct(data);
      
      // Kategori bilgisini çek
      if (data.category && typeof data.category === 'string') {
        try {
          const categoryData = await getCategoryById(data.category);
          setCategory(categoryData);
        } catch (error) {
          console.error('Kategori bilgisi yüklenemedi:', error);
        }
      } else if (data.category && typeof data.category === 'object' && 'name' in data.category) {
        setCategory(data.category as { _id: string; name: string });
      }
    } catch (error) {
      message.error('Ürün yüklenirken bir hata oluştu');
      router.push('/admin/products');
    } finally {
      setInitialLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  // Featured durumunu güncelle
  const handleFeaturedChange = async (featured: boolean) => {
    try {
      setLoading(true);
      await updateProductStatus(productId, { featured });
      message.success('Ürün durumu güncellendi');
      // Ürün verilerini yenile
      const data = await getProductById(productId);
      setProduct(data);
    } catch (error) {
      message.error('Ürün durumu güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Ürün sil
  const handleDelete = async () => {
    try {
      await deleteProduct(productId);
      message.success('Ürün başarıyla silindi');
      router.push('/admin/products');
    } catch (error) {
      message.error('Ürün silinirken bir hata oluştu');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <Alert
        message="Ürün bulunamadı"
        description="Aradığınız ürün mevcut değil veya silinmiş olabilir."
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => router.push('/admin/products')}>
            Geri Dön
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            icon={<IconArrowLeft size={16} />}
            onClick={() => router.push('/admin/products')}
            className="text-gray-600"
          >
            Geri Dön
          </Button>
          <Title level={2} className="mb-0">Ürün Detayları</Title>
        </div>
        
        <Space>
          <Button
            type="primary"
            icon={<IconEdit size={16} />}
            onClick={() => setEditModalVisible(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Düzenle
          </Button>
          <Button
            danger
            icon={<IconTrash size={16} />}
            onClick={handleDelete}
          >
            Sil
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        {/* Sol Kolon - Ürün Görselleri */}
        <Col span={12}>
          <Card 
            title="Ürün Görselleri" 
            className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50"
          >
            <div className="grid grid-cols-2 gap-3">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={getImageUrl(image)}
                      alt={`Ürün görseli ${index + 1}`}
                      className="w-full h-32 rounded-md object-cover border border-gray-200"
                      fallback="/placeholder-image.svg"
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {index + 1}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8 col-span-2">
                  Görsel bulunamadı
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Sağ Kolon - Ürün Bilgileri */}
        <Col span={12}>
          <Card 
            title="Temel Bilgiler" 
            className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50"
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Ürün Adı">
                <Text strong>{product.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">
                <Tag color="blue">
                  {category ? category.name : 'Kategori Yok'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fiyat">
                <Text strong className="text-green-600">
                  {(product.price || 0).toLocaleString('tr-TR')} TL
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Stok">
                <Tag color={product.stock > 10 ? 'green' : product.stock > 5 ? 'orange' : 'red'}>
                  {product.stock}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Öne Çıkan">
                <Switch
                  checked={product.featured || false}
                  onChange={handleFeaturedChange}
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  loading={loading}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Değerlendirme">
                <div className="flex items-center">
                  <IconStar size={16} className="text-yellow-500 mr-1" />
                  <Text>{product.averageRating?.toFixed(1) || '0.0'}</Text>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* İstatistikler */}
          <Card 
            title="İstatistikler" 
            className="mt-6 shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50"
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Görsel Sayısı"
                  value={product.images?.length || 0}
                  prefix={<Image />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Varyant Sayısı"
                  value={product.variants?.length || 0}
                  prefix={<IconShoppingCart size={16} />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Toplam Değer"
                  value={(product.price || 0) * (product.stock || 0)}
                  suffix="TL"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Açıklama */}
      <Card 
        title="Açıklama" 
        className="mt-6 shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50"
      >
        <Text className="text-gray-700 leading-relaxed">{product.description || 'Açıklama bulunamadı'}</Text>
      </Card>

      {/* Etiketler */}
      {product.tags && product.tags.length > 0 && (
        <Card 
          title="Etiketler" 
          className="mt-6 shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50"
        >
          <div className="flex flex-wrap gap-3">
            {product.tags.map((tag, index) => (
              <Tag key={index} color="blue" className="px-3 py-1 text-sm font-medium">{tag}</Tag>
            ))}
          </div>
        </Card>
      )}

      {/* Teknik Özellikler */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <Card 
          title="Teknik Özellikler" 
          className="mt-6 shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50"
        >
          <Descriptions column={2} size="small" className="bg-gray-50 p-4 rounded-lg">
            {Object.entries(product.specifications).map(([key, value]) => (
              <Descriptions.Item key={key} label={key} className="font-medium">
                <span className="text-gray-700">{String(value)}</span>
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      )}

      {/* Varyantlar */}
      {product.variants && product.variants.length > 0 && (
        <Card 
          title="Varyantlar" 
          className="mt-6 shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50"
        >
          <Row gutter={16}>
            {product.variants.map((variant, index) => (
              <Col key={index} span={8}>
                <Card size="small" className="shadow-md border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <div className="text-center p-3">
                    <div className="font-medium text-gray-800">{variant.size || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{variant.color || 'N/A'}</div>
                    {variant.additionalPrice > 0 && (
                      <div className="text-green-600 font-semibold">
                        +{variant.additionalPrice} TL
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Tarih Bilgileri */}
      <Card 
        title="Tarih Bilgileri" 
        className="mt-6 shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50"
      >
        <Row gutter={16}>
          <Col span={12}>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 font-medium">Oluşturulma Tarihi</div>
              <div className="font-semibold text-gray-800 mt-1">
                {product.createdAt ? new Date(product.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 font-medium">Güncellenme Tarihi</div>
              <div className="font-semibold text-gray-800 mt-1">
                {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Edit Modal */}
      <ProductEditModal
        visible={editModalVisible}
        productId={productId}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={() => {
          fetchProduct();
          setEditModalVisible(false);
        }}
      />
    </div>
  );
}
