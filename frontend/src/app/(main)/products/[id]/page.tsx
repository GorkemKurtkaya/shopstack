"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Empty,
  Spin,
  message,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Rate,
  Image,
  Carousel,
  notification,
  Modal,
  Form,
  Input,
  Avatar,
  List
} from 'antd';
import { 
  ShoppingCartOutlined,
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  StarOutlined,
  CalendarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { getProductById, Product, getImageUrl } from '@/services/product';
import { addToCart } from '@/services/cart';
import { getProductReviews, createReview, CreateReviewData, checkUserReview, Review } from '@/services/review';
import { getCurrentUser } from '@/services/auth';
import { getUserOrders } from '@/services/orders';
import { getCategoryById, Category } from '@/services/category';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import React from 'react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { incrementCartCount, isAuthenticated } = useCart();
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadReviews();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await getProductById(productId);
      setProduct(productData);

      if (productData.category && typeof productData.category === 'string') {
        try {
          const categoryData = await getCategoryById(productData.category);
          setCategory(categoryData);
        } catch (error) {
          console.error('Category load error:', error);
        }
      }

      if (isAuthenticated) {
        try {
          const userReviewData = await checkUserReview(productId);
          setUserReview(userReviewData);
        } catch (error) {
          console.error('User review check error:', error);
        }

        try {
          const me = await getCurrentUser();
          if (me?.id) {
            const orders = await getUserOrders(me.id);
            const purchased = orders.some(order => 
              order.status === 'delivered' && order.orderItems.some(item => item.product === productId)
            );
            setHasPurchased(purchased);
          } else {
            setHasPurchased(false);
          }
        } catch (error) {
          console.error('Purchase check error:', error);
          setHasPurchased(false);
        }
      } else {
        setHasPurchased(false);
      }
    } catch (error) {
      console.error('Product load error:', error);
      message.error('Ürün yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviewsData = await getProductReviews(productId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Reviews load error:', error);
      message.error('Yorumlar yüklenirken hata oluştu');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddToCart = async () => {
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
      const result = await addToCart(productId, quantity);

      if (result.success) {
        message.success(result.message);
        incrementCartCount(quantity);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      message.error('Ürün sepete eklenirken hata oluştu');
    }
  };

  const openReviewModal = () => {
    setReviewModalVisible(true);
    reviewForm.resetFields();
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    reviewForm.resetFields();
  };

  const handleSubmitReview = async (values: any) => {
    try {
      setReviewLoading(true);

      const reviewData: CreateReviewData = {
        productId,
        rating: values.rating,
        comment: values.comment
      };

      const newReview = await createReview(reviewData);

      await loadReviews();

      setUserReview(newReview);

      message.success('Yorumunuz başarıyla gönderildi!');
      closeReviewModal();

    } catch (error) {
      console.error('Review submission error:', error);
      message.error('Yorum gönderilirken hata oluştu');
    } finally {
      setReviewLoading(false);
    }
  };

  const CustomArrow = ({ type, onClick }: { type: 'prev' | 'next'; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl ${type === 'prev' ? 'left-4' : 'right-4'
        }`}
    >
      {type === 'prev' ? <LeftOutlined className="text-lg" /> : <RightOutlined className="text-lg" />}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">
            Ürün yükleniyor...
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Empty description="Ürün bulunamadı" />
      </div>
    );
  }

  const hasMultipleImages = product.images && product.images.length > 1;
  const images = product.images && product.images.length > 0 ? product.images : [];
  const rating = Math.min(Math.max(product.averageRating || 0, 0), 5);

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Ürünlere Dön
                </Button>
              </Link>
            </div>
          </div>

          <Row gutter={[48, 24]}>
            <Col xs={24} lg={12}>
              <Card className="shadow-lg border-0 rounded-xl">
                {hasMultipleImages ? (
                  <Carousel
                    autoplay={false}
                    dots={false}
                    arrows={true}
                    prevArrow={<CustomArrow type="prev" />}
                    nextArrow={<CustomArrow type="next" />}
                    className="product-detail-carousel relative"
                    afterChange={(current) => setSelectedImageIndex(current)}
                  >
                    {images.map((image, index) => (
                      <div key={index} className="flex items-center justify-center h-96 w-full overflow-hidden ml-20">
                        <Image
                          src={getImageUrl(image)}
                          alt={`${product.name} - Görsel ${index + 1}`}
                          width={400}
                          height={400}
                          className="w-full h-full object-contain mx-auto"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <div className="flex items-center justify-center h-96 w-full overflow-hidden ml-20">
                    <Image
                      src={getImageUrl(images[0] || '')}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain mx-auto"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}

                {hasMultipleImages && (
                  <div className="flex justify-center space-x-2 mt-4">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-16 border-2 rounded-lg overflow-hidden transition-all duration-200 ${index === selectedImageIndex
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <Image
                          src={getImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          style={{
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card className="shadow-lg border-0 rounded-xl h-fit">
                <div className="space-y-6">
                  <div>
                    <Title level={2} className="mb-2 text-gray-900">
                      {product.name}
                    </Title>
                    <div className="flex items-center space-x-4">
                      <Rate disabled defaultValue={rating} className="text-lg" />
                      <span className="text-gray-600">
                        ({rating.toFixed(1)})
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        {reviews.length} yorum
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Text className="text-3xl font-bold text-blue-600">
                      ₺{product.price.toLocaleString('tr-TR')}
                    </Text>
                  </div>

                  {(product.category || category) && (
                    <div>
                      <Text className="text-gray-600 text-sm">Kategori:</Text>
                      <div className="mt-1">
                        <Tag color="blue" className="text-sm">
                          {typeof product.category === 'object'
                            ? product.category.name
                            : category?.name || 'Kategori Yükleniyor...'
                          }
                        </Tag>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Text className="text-gray-600">Stok:</Text>
                    <Tag color={product.stock > 0 ? 'green' : 'red'}>
                      {product.stock > 0 ? `${product.stock} adet` : 'Stok Yok'}
                    </Tag>
                  </div>

                  {product.featured && (
                    <Tag color="gold" icon={<StarOutlined />}>
                      Öne Çıkan Ürün
                    </Tag>
                  )}

                  <div>
                    <Text className="text-gray-600 text-sm">Açıklama:</Text>
                    <div className="mt-2">
                      {product.description.length > 150 ? (
                        <div>
                          <Paragraph className="text-gray-700 mb-2">
                            {showFullDescription
                              ? product.description
                              : `${product.description.substring(0, 150)}...`
                            }
                          </Paragraph>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="p-0 h-auto text-blue-600 hover:text-blue-800"
                          >
                            {showFullDescription ? 'Daha az göster' : 'Devamını oku'}
                          </Button>
                        </div>
                      ) : (
                        <Paragraph className="text-gray-700">
                          {product.description}
                        </Paragraph>
                      )}
                    </div>
                  </div>

                  <div>
                    <Text className="text-gray-600 text-sm">Miktar:</Text>
                    <div className="flex items-center space-x-3 mt-2">
                      <Button
                        icon={<LeftOutlined />}
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      />
                      <span className="w-16 text-center font-medium">{quantity}</span>
                      <Button
                        icon={<RightOutlined />}
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                      />
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                  >
                    {product.stock > 0 ? 'Sepete Ekle' : 'Stok Yok'}
                  </Button>

                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div>
                      <Text className="text-gray-600 text-sm">Özellikler:</Text>
                      <div className="mt-2 space-y-2">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <Text className="text-gray-600 capitalize">{key}:</Text>
                            <Text className="text-gray-800">{value}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <Text className="text-gray-600 text-sm">Etiketler:</Text>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Tag key={index} color="blue" className="text-xs">
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          <div className="mt-16">
            <Card title="💬 Ürün Yorumları" className="shadow-lg border-0 rounded-xl">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Text className="text-lg font-medium">
                      {reviews.length} yorum
                    </Text>
                    <Rate disabled defaultValue={rating} className="text-sm" />
                    <Text className="text-gray-600 text-sm">
                      ({rating.toFixed(1)} ortalama)
                    </Text>
                  </div>

                  {isAuthenticated && hasPurchased && !userReview && (
                    <Button
                      type="primary"
                      icon={<StarOutlined />}
                      onClick={openReviewModal}
                    >
                      Yorum Yap
                    </Button>
                  )}


                  {isAuthenticated && userReview && (
                    <Tag color="green" icon={<StarOutlined />}>
                      Yorumunuz: {userReview.rating}⭐
                    </Tag>
                  )}
                </div>
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                </div>
              ) : reviews.length === 0 ? (
                <Empty
                  description="Henüz yorum yapılmamış"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={reviews}
                  renderItem={(review) => (
                    <List.Item>
                      <div className="flex space-x-4 w-full">
                        <Avatar icon={<UserOutlined />} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Text strong>{review.user.name}</Text>
                            <Rate disabled defaultValue={review.rating} className="text-sm" />
                          </div>
                          <Paragraph className="mb-2">{review.comment}</Paragraph>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <CalendarOutlined />
                            <span>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </div>
        </div>

        <Modal
          title={
            <div className="flex items-center space-x-3">
              <span>💬</span>
              <span>{product.name} için Yorum Yap</span>
            </div>
          }
          open={reviewModalVisible}
          onCancel={closeReviewModal}
          footer={null}
          width={500}
          className="rounded-xl"
        >
          <Form
            form={reviewForm}
            layout="vertical"
            onFinish={handleSubmitReview}
            className="mt-4"
          >
            <Form.Item
              name="rating"
              label="Puanınız"
              rules={[{ required: true, message: 'Lütfen puan verin!' }]}
            >
              <Rate
                allowHalf={false}
                className="text-2xl"
                tooltips={['Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Çok İyi']}
              />
            </Form.Item>

            <Form.Item
              name="comment"
              label="Yorumunuz"
              rules={[
                { required: true, message: 'Lütfen yorum yazın!' },
                { min: 10, message: 'Yorum en az 10 karakter olmalı!' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Bu ürün hakkında düşüncelerinizi paylaşın..."
                className="rounded-lg"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-3">
                <Button onClick={closeReviewModal}>
                  İptal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={reviewLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {reviewLoading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}
