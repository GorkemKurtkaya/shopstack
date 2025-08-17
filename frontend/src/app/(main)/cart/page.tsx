"use client";

import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  InputNumber,
  Space,
  Empty,
  Spin,
  message,
  Popconfirm,
  Divider,
  Row,
  Col,
  Typography,
  Image,
  Tag,
  Modal,
  Form,
  Select,
  Input
} from 'antd';
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { getCart, updateCartItem, clearCart, CartItem } from '@/services/cart';
import { getProductById, Product } from '@/services/product';
import { getImageUrl } from '@/services/product';
import { getCategoryById, Category } from '@/services/category';
import { getCurrentUser, User, Address, checkAuth } from '@/services/auth';
import { createOrder, CreateOrderData } from '@/services/orders';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface CartItemWithProduct extends CartItem {
  product?: Product;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [clearingCart, setClearingCart] = useState(false);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [user, setUser] = useState<User | null>(null);
  const [isCardModalVisible, setIsCardModalVisible] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [cardForm] = Form.useForm();
  const { updateCartCount } = useCart();
  const router = useRouter();

  // Sepeti yükle
  useEffect(() => {
    loadCart();
    loadUserData();
  }, []);

  // Kullanıcı bilgilerini yükle
  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        // Varsayılan adresi seç
        const defaultAddress = userData.addresses?.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (userData.addresses && userData.addresses.length > 0) {
          setSelectedAddress(userData.addresses[0]);
        }
      }
    } catch (error) {
      console.error('User data load error:', error);
    }
  };

  const fetchCategoryNames = async (categoryIds: string[]) => {
    try {
      const uniqueIds = [...new Set(categoryIds.filter(id => id && !categoryNames[id]))];

      if (uniqueIds.length === 0) return;

      const categoryPromises = uniqueIds.map(async (id) => {
        try {
          const category = await getCategoryById(id);
          return { id, name: category.name };
        } catch (error) {
          console.error(`Category ${id} not found:`, error);
          return { id, name: 'Bilinmeyen Kategori' };
        }
      });

      const categories = await Promise.all(categoryPromises);
      const newCategoryNames = categories.reduce((acc, { id, name }) => {
        acc[id] = name;
        return acc;
      }, {} as Record<string, string>);

      setCategoryNames(prev => ({ ...prev, ...newCategoryNames }));
    } catch (error) {
      console.error('Category names fetch error:', error);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);

      const authResult = await checkAuth();

      if (!authResult.isAuthenticated) {
        message.error('Bu sayfaya erişmek için giriş yapmanız gerekiyor');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        return;
      }

      const items = await getCart();

      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await getProductById(item.productId);
            return { ...item, product };
          } catch (error) {
            console.error(`Product ${item.productId} not found:`, error);
            return { ...item, product: undefined };
          }
        })
      );

      setCartItems(itemsWithProducts);


      const categoryIds = itemsWithProducts
        .map(item => item.product?.category)
        .filter(category => typeof category === 'string') as string[];

      if (categoryIds.length > 0) {
        await fetchCategoryNames(categoryIds);
      }
    } catch (error) {
      console.error('Cart load error:', error);
      message.error('Sepet yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Ürün miktarını güncelle
  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      setUpdatingItems(prev => new Set(prev).add(productId));

      const action = newQuantity > (cartItems.find(item => item.productId === productId)?.quantity || 0)
        ? 'increment'
        : 'decrement';

      const result = await updateCartItem(productId, action);

      if (result.success) {
        await loadCart();
        await updateCartCount(); 
        message.success('Sepet güncellendi!');
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Quantity update error:', error);
      message.error('Miktar güncellenirken hata oluştu');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Ürünü sepetten kaldır
  const handleRemoveItem = async (productId: string) => {
    try {
      setUpdatingItems(prev => new Set(prev).add(productId));

      const currentItem = cartItems.find(item => item.productId === productId);
      if (currentItem) {
        const decrements = currentItem.quantity;
        for (let i = 0; i < decrements; i++) {
          await updateCartItem(productId, 'decrement');
        }
      }

      await loadCart();
      await updateCartCount(); 
      message.success('Ürün sepetten kaldırıldı!');
    } catch (error) {
      console.error('Remove item error:', error);
      message.error('Ürün kaldırılırken hata oluştu');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Sepeti temizle
  const handleClearCart = async () => {
    try {
      setClearingCart(true);
      const result = await clearCart();

      if (result.success) {
        setCartItems([]);
        await updateCartCount(); 
        message.success('Sepet temizlendi!');
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      message.error('Sepet temizlenirken hata oluştu');
    } finally {
      setClearingCart(false);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => {
    if (item.product) {
      return total + (item.product.price * item.quantity);
    }
    return total;
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Sipariş oluştur
  const handleCreateOrder = async () => {
    if (!cardInfo) {
      message.error('Lütfen kart bilgilerini girin!');
      return;
    }

    if (!selectedAddress) {
      message.error('Lütfen teslimat adresi seçin!');
      return;
    }

    if (cartItems.length === 0) {
      message.error('Sepetinizde ürün bulunmuyor!');
      return;
    }

    try {
      setIsCreatingOrder(true);

      const orderData: CreateOrderData = {
        orderItems: cartItems.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.product?.price || 0,
          ...(item.product?.variants && item.product.variants.length > 0 && {
            variant: {
              size: item.product.variants[0]?.size,
              color: item.product.variants[0]?.color
            }
          })
        })),
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country
        },
        paymentInfo: {
          method: 'card',
          status: 'paid',
          transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };

      console.log('Creating order with data:', orderData);
      const order = await createOrder(orderData);

      message.success('Siparişiniz başarıyla oluşturuldu!');

      await clearCart();
      await updateCartCount();

      router.push(`/orders`);

    } catch (error) {
      console.error('Order creation error:', error);
      message.error('Sipariş oluşturulurken hata oluştu!');
    } finally {
      setIsCreatingOrder(false);
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
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start space-y-3">
              <Link href="/">
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  className="text-gray-500 hover:text-blue-600 text-sm font-medium border border-gray-200 hover:border-blue-300 px-3 py-1 rounded-lg transition-all duration-200"
                >
                  Alışverişe Devam Et
                </Button>
              </Link>
              <Title level={1} className="mb-0 flex items-center">
                <ShoppingCartOutlined className="mr-3 text-blue-600" />
                Sepetim
              </Title>
            </div>

            {cartItems.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearCart}
                loading={clearingCart}
              >
                Sepeti Temizle
              </Button>
            )}
          </div>

          {cartItems.length > 0 && (
            <Text className="text-gray-600 mt-6">
              {totalItems} ürün • Toplam: ₺{totalPrice.toLocaleString('tr-TR')}
            </Text>
          )}
        </div>

        {cartItems.length === 0 ? (
          <Card className="text-center py-16">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Sepetinizde ürün bulunmuyor"
            >
              <Link href="/products">
                <Button type="primary" size="large">
                  Alışverişe Başla
                </Button>
              </Link>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card
                    key={item.productId}
                    className="shadow-sm"
                    styles={{ body: { padding: '16px' } }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={item.product?.images?.[0] ? getImageUrl(item.product.images[0]) : '/placeholder.png'}
                          alt={item.product?.name || 'Ürün'}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                          fallback="/placeholder.png"
                        />
                      </div>


                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <Title level={5} className="mb-2 line-clamp-2">
                              {item.product?.name || 'Ürün bulunamadı'}
                            </Title>

                            {item.product?.category && (
                              <Tag color="blue" className="mb-2">
                                {typeof item.product.category === 'object'
                                  ? item.product.category.name
                                  : categoryNames[item.product.category] || 'Kategori Yükleniyor...'
                                }
                              </Tag>
                            )}

                            <div className="flex items-center space-x-4">
                              <Text className="text-lg font-semibold text-blue-600">
                                ₺{item.product?.price?.toLocaleString('tr-TR') || '0'}
                              </Text>
                            </div>
                          </div>


                          <div className="flex flex-col items-end space-y-2">
                            <Space>
                              <Button
                                size="small"
                                icon={<MinusOutlined />}
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updatingItems.has(item.productId)}
                                loading={updatingItems.has(item.productId)}
                              />

                              <InputNumber
                                min={1}
                                max={item.product?.stock || 999}
                                value={item.quantity}
                                onChange={(value) => value && handleQuantityChange(item.productId, value)}
                                disabled={updatingItems.has(item.productId)}
                                className="w-16 text-center"
                              />

                              <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= (item.product?.stock || 999) || updatingItems.has(item.productId)}
                                loading={updatingItems.has(item.productId)}
                              />
                            </Space>

                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleRemoveItem(item.productId)}
                              disabled={updatingItems.has(item.productId)}
                              loading={updatingItems.has(item.productId)}
                              size="small"
                            >
                              Kaldır
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <Text className="text-gray-600">
                              {item.quantity} × ₺{item.product?.price?.toLocaleString('tr-TR') || '0'}
                            </Text>
                            <Text className="text-lg font-semibold text-green-600">
                              ₺{((item.product?.price || 0) * item.quantity).toLocaleString('tr-TR')}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Sipariş Özeti" className="sticky top-0">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text>Ürünler ({totalItems})</Text>
                      <Text>₺{totalPrice.toLocaleString('tr-TR')}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Kargo</Text>
                      <Text className="text-green-600">Ücretsiz</Text>
                    </div>
                  </div>

                  <Divider />

                  <div className="flex justify-between items-center">
                    <Title level={4} className="mb-0">Toplam</Title>
                    <Title level={3} className="mb-0 text-blue-600">
                      ₺{totalPrice.toLocaleString('tr-TR')}
                    </Title>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    className="w-full h-12 text-lg"
                    disabled={cartItems.length === 0 || !cardInfo || !selectedAddress}
                    loading={isCreatingOrder}
                    onClick={handleCreateOrder}
                  >
                    {isCreatingOrder ? 'Sipariş Oluşturuluyor...' : 'Siparişi Tamamla'}
                  </Button>

                  {(!cardInfo || !selectedAddress) && (
                    <div className="text-xs text-gray-500 text-center mt-2">
                      {!cardInfo && !selectedAddress && 'Siparişi tamamlamak için kart bilgileri ve adres seçimi gerekli'}
                      {!cardInfo && selectedAddress && 'Siparişi tamamlamak için kart bilgileri gerekli'}
                      {cardInfo && !selectedAddress && 'Siparişi tamamlamak için adres seçimi gerekli'}
                    </div>
                  )}

                  <Divider />


                  <div className="space-y-4">
                    <Title level={5} className="mb-3 text-gray-800">
                      💳 Ödeme Bilgileri
                    </Title>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">1</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Kart Bilgileri</span>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => setIsCardModalVisible(true)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Kart Ekle/Düzenle
                        </Button>
                      </div>

                      {cardInfo ? (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Kart Numarası</span>
                            <span className="text-sm font-mono text-green-800">
                              **** **** **** {cardInfo.cardNumber.slice(-4)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Son Kullanma</span>
                            <span className="text-sm font-mono text-green-800">{cardInfo.expiryDate}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">Kart Sahibi</span>
                            <span className="text-sm font-medium text-green-800">{cardInfo.cardHolder}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="text-center text-gray-500 text-sm">
                            Henüz kart bilgileri girilmedi
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${cardInfo ? 'bg-green-500' : 'bg-gray-400'
                          }`}>
                          <span className="text-white text-xs">2</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">Kart Onaylandı</span>
                      </div>

                      {cardInfo ? (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm text-green-700">Kart bilgileri doğrulandı</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="text-center text-gray-500 text-sm">
                            Kart bilgileri girilmedi
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">3</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Teslimat Adresi</span>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => setIsAddressModalVisible(true)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Adres Seç
                        </Button>
                      </div>

                      {selectedAddress ? (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-orange-800">
                              {selectedAddress.street}
                            </div>
                            <div className="text-xs text-orange-700">
                              {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}<br />
                              {selectedAddress.country}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="text-sm text-gray-500 text-center">
                            Henüz adres seçilmedi
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </Card>
            </Col>
          </Row>
        )}

        <Modal
          title="💳 Kart Bilgileri"
          open={isCardModalVisible}
          onCancel={() => setIsCardModalVisible(false)}
          footer={null}
          width={500}
          className="rounded-xl"
        >
          <Form
            form={cardForm}
            layout="vertical"
            onFinish={(values) => {
              console.log('Card values:', values);
              setCardInfo(values);
              message.success('Kart bilgileri kaydedildi!');
              setIsCardModalVisible(false);
            }}
          >
            <Form.Item
              name="cardNumber"
              label="Kart Numarası"
              rules={[
                { required: true, message: 'Kart numarası gerekli!' },
                {
                  validator: (_, value) => {
                    const digits = String(value || '').replace(/\D/g, '');
                    return digits.length === 16
                      ? Promise.resolve()
                      : Promise.reject('Kart numarası 16 haneli olmalıdır');
                  }
                }
              ]}
            >
              <Input
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="font-mono"
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                  const grouped = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                  cardForm.setFieldsValue({ cardNumber: grouped });
                }}
              />
            </Form.Item>

            <Form.Item
              name="cardHolder"
              label="Kart Sahibi"
              rules={[{ required: true, message: 'Kart sahibi gerekli!' }]}
            >
              <Input
                placeholder="Ad Soyad"
                className="uppercase"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="expiryDate"
                  label="Son Kullanma"
                  rules={[{ required: true, message: 'Son kullanma tarihi gerekli!' }]}
                >
                  <Input
                    placeholder="MM/YY"
                    maxLength={5}
                    className="font-mono"
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                      const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                      cardForm.setFieldsValue({ expiryDate: formatted });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cvv"
                  label="CVV"
                  rules={[{ required: true, message: 'CVV gerekli!' }]}
                >
                  <Input
                    placeholder="123"
                    maxLength={4}
                    className="font-mono"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => setIsCardModalVisible(false)}>
                  İptal
                </Button>
                <Button type="primary" htmlType="submit">
                  Kartı Kaydet
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="📍 Teslimat Adresi Seç"
          open={isAddressModalVisible}
          onCancel={() => setIsAddressModalVisible(false)}
          footer={null}
          width={600}
          className="rounded-xl"
        >
          {user?.addresses && user.addresses.length > 0 ? (
            <div className="space-y-3">
              {user.addresses.map((address) => (
                <div
                  key={address._id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedAddress?._id === address._id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  onClick={() => {
                    setSelectedAddress(address);
                    setIsAddressModalVisible(false);
                    message.success('Adres seçildi!');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 mb-1">
                        {address.street}
                      </div>
                      <div className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zipCode}
                      </div>
                      <div className="text-sm text-gray-500">
                        {address.country}
                      </div>
                    </div>
                    {selectedAddress?._id === address._id && (
                      <div className="text-orange-500 text-lg">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                Henüz kayıtlı adresiniz bulunmuyor
              </div>
              <Link href="/profile">
                <Button type="primary">
                  Profilde Adres Ekle
                </Button>
              </Link>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
