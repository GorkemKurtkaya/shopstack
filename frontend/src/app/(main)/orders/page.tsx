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
  EyeOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { getUserOrders, Order } from '@/services/orders';
import { getCurrentUser, checkAuth } from '@/services/auth';
import { getProductById, Product } from '@/services/product';
import { createReview, CreateReviewData, checkUserReview } from '@/services/review';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userReviews, setUserReviews] = useState<{[productId: string]: any}>({});
  const [reviewForm] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
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

      const userOrders = await getUserOrders(userData.id);
      
      const ordersWithProducts = await Promise.all(
        userOrders.map(async (order) => {
          const orderItemsWithProducts = await Promise.all(
            order.orderItems.map(async (item) => {
              try {
                const product = await getProductById(item.product as string);
                return { ...item, product };
              } catch (error) {
                console.error(`Product ${item.product} not found:`, error);
                return { ...item, product: item.product };
              }
            })
          );
          
          return { ...order, orderItemsWithProducts };
        })
      );
      
      const sortedOrders = [...ordersWithProducts].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(sortedOrders);
      

       const reviews: {[productId: string]: any} = {};
       for (const order of sortedOrders) {
         for (const item of order.orderItemsWithProducts || []) {
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
       }
       setUserReviews(reviews);
      
    } catch (error) {
      console.error('Orders load error:', error);
      message.error('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

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


  const openReviewModal = (product: Product) => {
    setSelectedProduct(product);
    setReviewModalVisible(true);
    reviewForm.resetFields();
  };


  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedProduct(null);
    reviewForm.resetFields();
  };


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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="mb-8">
           <div className="flex flex-col space-y-4">
             <div className="flex items-center space-x-4">
               <Link href="/">
                 <Button 
                   type="text" 
                   icon={<ArrowLeftOutlined />}
                   className="text-gray-600 hover:text-blue-600"
                 >
                   Ana Sayfa
                 </Button>
               </Link>
             </div>
             <Title level={1} className="mb-0 flex items-center">
               <ShoppingOutlined className="mr-3 text-blue-600" />
               Siparişlerim
             </Title>
           </div>
          
                     {orders.length > 0 && (
             <Text className="text-gray-600 mt-6">
               Toplam {orders.length} sipariş
             </Text>
           )}
        </div>
        {orders.length === 0 ? (
          <Card className="text-center py-16">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Henüz siparişiniz bulunmuyor"
            >
              <Link href="/products">
                <Button type="primary" size="large">
                  Alışverişe Başla
                </Button>
              </Link>
            </Empty>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
              
              return (
                <Card 
                  key={order._id} 
                  className="shadow-sm hover:shadow-md transition-shadow duration-200"
                  title={
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Text className="font-medium">Sipariş #{order._id.slice(-8)}</Text>
                        <Tag color={statusConfig.color} icon={statusConfig.icon}>
                          {statusConfig.text}
                        </Tag>
                      </div>
                      <Text className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </Text>
                    </div>
                  }
                  extra={
                    <Link href={`/orders/${order._id}`}>
                      <Button 
                        type="text" 
                        icon={<EyeOutlined />}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Detayları Gör
                      </Button>
                    </Link>
                  }
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={16}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Text className="font-medium">Ürünler</Text>
                          <Text>{totalItems} adet ürün</Text>
                        </div>
                        
                                                 <div className="space-y-2">
                           {order.orderItemsWithProducts?.slice(0, 3).map((item, index) => {
                             const product = item.product as Product;
                             const isProductObject = typeof product === 'object' && product !== null;
                             
                             return (
                               <div key={index} className="flex items-center justify-between text-sm">
                                 <div className="flex-1">
                                   <Text className="text-gray-600">
                                     {item.quantity}x {isProductObject ? product.name : `Ürün ID: ${item.product}`}
                                     {item.variant && (
                                       <span className="text-gray-400 ml-2">
                                         ({item.variant.size}, {item.variant.color})
                                       </span>
                                     )}
                                   </Text>
                                   
                                  
                                    {order.status === 'delivered' && isProductObject && (
                                      userReviews[product._id] ? (
                                        <div className="mt-1 flex items-center space-x-2">
                                          <Tag color="green">
                                            ✓ Yorum Yapıldı
                                          </Tag>
                                          <Text className="text-xs text-gray-500">
                                            {userReviews[product._id].rating}⭐
                                          </Text>
                                        </div>
                                      ) : (
                                        <Button
                                          type="text"
                                          size="small"
                                          onClick={() => openReviewModal(product)}
                                          className="text-blue-600 hover:text-blue-700 p-0 h-auto mt-1"
                                        >
                                          💬 Yorum Yap
                                        </Button>
                                      )
                                    )}
                                 </div>
                                 <Text className="font-medium">
                                   ₺{item.price.toLocaleString('tr-TR')}
                                 </Text>
                               </div>
                             );
                           })}
                          
                                                     {order.orderItemsWithProducts && order.orderItemsWithProducts.length > 3 && (
                             <Text className="text-gray-400 text-sm">
                               +{order.orderItemsWithProducts.length - 3} ürün daha...
                             </Text>
                           )}
                        </div>
                      </div>
                    </Col>

                    <Col xs={24} md={8}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Text className="text-gray-600">Toplam Tutar</Text>
                          <Text className="text-lg font-bold text-blue-600">
                            ₺{order.totalAmount.toLocaleString('tr-TR')}
                          </Text>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Text className="text-gray-600">Ödeme</Text>
                          <div className="flex items-center space-x-2">
                            <span>{getPaymentIcon(order.paymentInfo.method)}</span>
                            <Text className="capitalize">{order.paymentInfo.method}</Text>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Text className="text-gray-600">Durum</Text>
                          <Tag color={order.paymentInfo.status === 'paid' ? 'green' : 'orange'}>
                            {order.paymentInfo.status === 'paid' ? 'Ödendi' : 'Beklemede'}
                          </Tag>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Divider className="my-4" />
                  

                  <div className="flex items-start space-x-3">
                    <HomeOutlined className="text-gray-400 mt-1" />
                    <div className="flex-1">
                      <Text className="text-sm font-medium text-gray-700">Teslimat Adresi</Text>
                      <div className="text-sm text-gray-600 mt-1">
                        {order.shippingAddress.street}, {order.shippingAddress.city}
                        <br />
                        {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
                     </div>
         )}
       </div>

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
