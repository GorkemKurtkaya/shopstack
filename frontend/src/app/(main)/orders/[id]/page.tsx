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
  Timeline,
  Image,
  Badge,
  Modal,
  Form,
  Rate,
  Input
} from 'antd';
import { 
  ShoppingOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { getOrderById, Order } from '@/services/orders';
import { getCurrentUser, checkAuth } from '@/services/auth';
import { getProductById, Product } from '@/services/product';
import { getImageUrl } from '@/services/product';
import { createReview, CreateReviewData, checkUserReview } from '@/services/review';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

const { Title, Text } = Typography;

interface OrderWithProducts extends Order {
  orderItemsWithProducts?: Array<{
    _id?: string;
    product: string | Product;
    quantity: number;
    price: number;
    variant?: {
      _id?: string;
      size?: string;
      color?: string;
    };
  }>;
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState<OrderWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userReviews, setUserReviews] = useState<{[productId: string]: any}>({});
  const [reviewForm] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      
      const authResult = await checkAuth();
      
      if (!authResult.isAuthenticated) {
        message.error('Bu sayfaya erişmek için giriş yapmanız gerekiyor');
        router.push('/auth/login');
        return;
      }

      const userData = await getCurrentUser();
      if (!userData) {
        message.error('Kullanıcı bilgileri alınamadı');
        router.push('/auth/login');
        return;
      }
      
      setUser(userData);
      
      // Siparişi al
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
      
             // Ürün detaylarını al
       const orderItemsWithProducts = await Promise.all(
         orderData.orderItems.map(async (item) => {
           try {
             const product = await getProductById(item.product as string);
             return { ...item, product };
           } catch (error) {
             console.error(`Product ${item.product} not found:`, error);
             return { ...item, product: item.product };
           }
         })
       );
       
       setOrder(prev => prev ? { ...prev, orderItemsWithProducts } : null);
       
       // Kullanıcının yorumlarını kontrol et
       const reviews: {[productId: string]: any} = {};
       for (const item of orderItemsWithProducts) {
         if (typeof item.product === 'object' && item.product !== null) {
           try {
             const userReview = await checkUserReview(item.product._id);
             if (userReview) {
               reviews[item.product._id] = userReview;
             }
           } catch (error) {
             console.error(`Review check error for product ${item.product._id}:`, error);
           }
         }
       }
       setUserReviews(reviews);
      
    } catch (error) {
      console.error('Order load error:', error);
      message.error('Sipariş yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sipariş durumu için renk ve ikon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'orange', icon: <ClockCircleOutlined />, text: 'Beklemede' };
      case 'processing':
        return { color: 'blue', icon: <ClockCircleOutlined />, text: 'İşleniyor' };
      case 'shipped':
        return { color: 'purple', icon: <TruckOutlined />, text: 'Kargoda' };
      case 'delivered':
        return { color: 'green', icon: <CheckCircleOutlined />, text: 'Teslim Edildi' };
      case 'cancelled':
        return { color: 'red', icon: <ClockCircleOutlined />, text: 'İptal Edildi' };
      default:
        return { color: 'default', icon: <ClockCircleOutlined />, text: status };
    }
  };

  // Ödeme yöntemi için ikon
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'cash':
        return '💰';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💳';
    }
  };

  // Yorum yapma modal'ını aç
  const openReviewModal = (product: Product) => {
    setSelectedProduct(product);
    setReviewModalVisible(true);
    reviewForm.resetFields();
  };

  // Yorum yapma modal'ını kapat
  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedProduct(null);
    reviewForm.resetFields();
  };

  // Yorum gönder
  const handleSubmitReview = async (values: any) => {
    if (!selectedProduct) return;
    
    try {
      setReviewLoading(true);
      
      const reviewData: CreateReviewData = {
        productId: selectedProduct._id,
        rating: values.rating,
        comment: values.comment
      };
      
      const newReview = await createReview(reviewData);
      
      // userReviews state'ini güncelle
      setUserReviews(prev => ({
        ...prev,
        [selectedProduct._id]: newReview
      }));
      
      message.success('Yorumunuz başarıyla gönderildi!');
      closeReviewModal();
      
    } catch (error) {
      console.error('Review submission error:', error);
      message.error('Yorum gönderilirken hata oluştu');
    } finally {
      setReviewLoading(false);
    }
  };

  // Timeline için sipariş durumları
  const getTimelineItems = (status: string) => {
    const items = [
      {
        color: 'green',
        children: (
          <div>
            <Text strong>Sipariş Alındı</Text>
            <br />
            <Text type="secondary" className="text-sm">
              Siparişiniz başarıyla alındı ve işleme alındı
            </Text>
          </div>
        ),
      },
      {
        color: status === 'pending' ? 'orange' : 'green',
        children: (
          <div>
            <Text strong>Hazırlanıyor</Text>
            <br />
            <Text type="secondary" className="text-sm">
              Ürünleriniz hazırlanıyor
            </Text>
          </div>
        ),
      },
      {
        color: ['shipped', 'delivered'].includes(status) ? 'green' : 'gray',
        children: (
          <div>
            <Text strong>Kargoya Verildi</Text>
            <br />
            <Text type="secondary" className="text-sm">
              Ürünleriniz kargoya verildi
            </Text>
          </div>
        ),
      },
      {
        color: status === 'delivered' ? 'green' : 'gray',
        children: (
          <div>
            <Text strong>Teslim Edildi</Text>
            <br />
            <Text type="secondary" className="text-sm">
              Siparişiniz teslim edildi
            </Text>
          </div>
        ),
      },
    ];

    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">
            Authentication kontrol ediliyor...
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Empty description="Sipariş bulunamadı" />
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                 {/* Header */}
         <div className="mb-8">
           <div className="flex flex-col space-y-4">
             <div className="flex items-center space-x-4">
               <Link href="/orders">
                 <Button 
                   type="text" 
                   icon={<ArrowLeftOutlined />}
                   className="text-gray-600 hover:text-blue-600"
                 >
                   Siparişlerim
                 </Button>
               </Link>
             </div>
             <div className="flex items-center justify-between">
               <Title level={1} className="mb-0 flex items-center">
                 <ShoppingOutlined className="mr-3 text-blue-600" />
                 Sipariş #{order._id.slice(-8)}
               </Title>
               
               <Tag color={statusConfig.color} icon={statusConfig.icon} className="text-base px-3 py-1">
                 {statusConfig.text}
               </Tag>
             </div>
           </div>
          
          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CalendarOutlined />
              <span>Sipariş Tarihi: {new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockCircleOutlined />
              <span>Son Güncelleme: {new Date(order.updatedAt).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Sol Kolon - Sipariş Detayları */}
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {/* Sipariş Durumu Timeline */}
              <Card title="📋 Sipariş Durumu" className="shadow-sm">
                <Timeline items={getTimelineItems(order.status)} />
              </Card>

              {/* Ürün Listesi */}
              <Card title="🛍️ Sipariş Edilen Ürünler" className="shadow-sm">
                <div className="space-y-4">
                  {order.orderItemsWithProducts?.map((item, index) => {
                    const product = item.product as Product;
                    const isProductObject = typeof product === 'object' && product !== null;
                    
                    return (
                      <div key={index} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg">
                        {/* Ürün Görseli */}
                        <div className="flex-shrink-0">
                          {isProductObject && product.images && product.images.length > 0 ? (
                            <Image
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                              fallback="/placeholder.png"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <ShoppingOutlined className="text-gray-400 text-xl" />
                            </div>
                          )}
                        </div>

                        {/* Ürün Bilgileri */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Title level={5} className="mb-2">
                                {isProductObject ? product.name : `Ürün ID: ${item.product}`}
                              </Title>
                              
                              {item.variant && (
                                <div className="flex space-x-2 mb-2">
                                  {item.variant.size && (
                                    <Tag color="blue">{item.variant.size}</Tag>
                                  )}
                                  {item.variant.color && (
                                    <Tag color="purple">{item.variant.color}</Tag>
                                  )}
                                </div>
                              )}
                              
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                 <span>Miktar: {item.quantity}</span>
                                 <span>Birim Fiyat: ₺{item.price.toLocaleString('tr-TR')}</span>
                               </div>
                               
                                                               {/* Yorum Yap Butonu - Sadece teslim edilen siparişlerde göster */}
                                {order.status === 'delivered' && (
                                  userReviews[product._id] ? (
                                    <div className="mt-2 flex items-center space-x-2">
                                      <Tag color="green" icon={<CheckCircleOutlined />}>
                                        Yorum Yapıldı
                                      </Tag>
                                      <Text className="text-xs text-gray-500">
                                        {userReviews[product._id].rating}⭐
                                      </Text>
                                    </div>
                                  ) : (
                                    <Button
                                      type="primary"
                                      size="small"
                                      onClick={() => openReviewModal(product)}
                                      className="mt-2"
                                    >
                                      💬 Yorum Yap
                                    </Button>
                                  )
                                )}
                             </div>
                             
                             <div className="text-right">
                               <Text className="text-lg font-bold text-blue-600">
                                 ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                               </Text>
                             </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </Col>

          {/* Sağ Kolon - Özet Bilgiler */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              {/* Sipariş Özeti */}
              <Card title="📊 Sipariş Özeti" className="shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Text>Toplam Ürün</Text>
                    <Text strong>{totalItems} adet</Text>
                  </div>
                  
                  <div className="flex justify-between">
                    <Text>Toplam Tutar</Text>
                    <Text strong className="text-lg text-blue-600">
                      ₺{order.totalAmount.toLocaleString('tr-TR')}
                    </Text>
                  </div>
                  
                  <Divider />
                  
                  <div className="flex justify-between">
                    <Text>Ödeme Yöntemi</Text>
                    <div className="flex items-center space-x-2">
                      <span>{getPaymentIcon(order.paymentInfo.method)}</span>
                      <Text strong className="capitalize">{order.paymentInfo.method}</Text>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Text>Ödeme Durumu</Text>
                    <Tag color={order.paymentInfo.status === 'paid' ? 'green' : 'orange'}>
                      {order.paymentInfo.status === 'paid' ? 'Ödendi' : 'Beklemede'}
                    </Tag>
                  </div>
                  
                  {order.paymentInfo.transactionId && (
                    <div className="flex justify-between">
                      <Text>İşlem ID</Text>
                      <Text code className="text-xs">{order.paymentInfo.transactionId}</Text>
                    </div>
                  )}
                </div>
              </Card>

              {/* Teslimat Adresi */}
              <Card title="📍 Teslimat Adresi" className="shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <HomeOutlined className="text-gray-400 mt-1" />
                    <div className="flex-1">
                      <Text strong className="block mb-1">{order.shippingAddress.street}</Text>
                      <Text className="text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </Text>
                      <Text className="text-gray-600 block mt-1">{order.shippingAddress.country}</Text>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Müşteri Bilgileri */}
              {user && (
                <Card title="👤 Müşteri Bilgileri" className="shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserOutlined className="text-gray-400" />
                      <div>
                        <Text strong>{user.firstName} {user.lastName}</Text>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MailOutlined className="text-gray-400" />
                      <div>
                        <Text>{user.email}</Text>
                      </div>
                    </div>
                    
                    {user.phoneNumber && (
                      <div className="flex items-center space-x-3">
                        <PhoneOutlined className="text-gray-400" />
                        <div>
                          <Text>{user.phoneNumber}</Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
                     </Col>
         </Row>
       </div>

       {/* Yorum Yapma Modal */}
       <Modal
         title={
           <div className="flex items-center space-x-3">
             <span>💬</span>
             <span>{selectedProduct?.name} için Yorum Yap</span>
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
             <Input.TextArea
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
   );
 }
