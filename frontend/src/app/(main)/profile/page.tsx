"use client";

import { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Input, 
  Button, 
  Avatar, 
  Divider, 
  Tag, 
  Space, 
  Modal, 
  message, 
  Tabs,
  Select,
  Switch,
  Popconfirm,
  Empty,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  EnvironmentOutlined,
  HeartOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { getCurrentUser, updateProfile, updateAddress, verifyEmail, checkAuth, User } from '@/services/auth';
import { getActiveCategories, Category } from '@/services/category';
import { useRouter } from 'next/navigation';

const { Option } = Select;

interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  favoriteCategories: string[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [emailVerificationForm] = Form.useForm();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isEmailVerificationModalVisible, setIsEmailVerificationModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
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
        
        console.log('User data received:', userData);
        console.log('Addresses:', userData.addresses);
        console.log('Favorite categories:', userData.favoriteCategories);
        
        profileForm.setFieldsValue({
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber || '',
          favoriteCategories: userData.favoriteCategories || []
        });

        if (userData.addresses) {
          setAddresses(userData.addresses);
        }
        if (userData.favoriteCategories) {
          setFavoriteCategories(userData.favoriteCategories);
        }

        const categoriesResponse = await getActiveCategories();
        setAvailableCategories(categoriesResponse);

      } catch (error) {
        console.error('User data fetch error:', error);
        message.error('Kullanıcı bilgileri yüklenirken hata oluştu');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, profileForm]);

  const handleProfileUpdate = async (values: ProfileFormData) => {
    try {
      setProfileLoading(true);
      const result = await updateProfile(values);
      
      if (result.success) {
        message.success('Profil başarıyla güncellendi!');
        setIsProfileModalVisible(false);
        
        if (result.user) {
          setUser(result.user);
          if (result.user.favoriteCategories) {
            setFavoriteCategories(result.user.favoriteCategories);
          }
        } else if (user) {
          setUser({
            ...user,
            ...values
          });
          setFavoriteCategories(values.favoriteCategories);
        }
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Profil güncellenirken hata oluştu');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddressSubmit = async (values: Address) => {
    try {
      setAddressLoading(true);
      
      let newAddresses: Address[];
      
      if (editingAddress) {
        newAddresses = addresses.map(addr => 
          addr._id === editingAddress._id ? { ...values, _id: addr._id } : addr
        );
      } else {

        const newAddress: Omit<Address, '_id'> = {
          ...values
        };
        newAddresses = [...addresses, newAddress as Address];
      }

      if (values.isDefault) {
        newAddresses = newAddresses.map(addr => ({
          ...addr,
          isDefault: addr._id === (editingAddress?._id || 'temp-new')
        }));
      }

      const result = await updateAddress({ addresses: newAddresses });
      
      if (result.success) {
        message.success(editingAddress ? 'Adres güncellendi!' : 'Adres eklendi!');
        
        if (result.addresses) {
          setAddresses(result.addresses);
        } else {
          setAddresses(newAddresses);
        }
        
        setIsAddressModalVisible(false);
        setEditingAddress(null);
        addressForm.resetFields();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Address update error:', error);
      message.error('Adres güncellenirken hata oluştu');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressDelete = async (addressId: string) => {
    try {
      const newAddresses = addresses.filter(addr => addr._id !== addressId);
      
      if (newAddresses.length > 0 && addresses.find(addr => addr._id === addressId)?.isDefault) {
        newAddresses[0].isDefault = true;
      }

      const result = await updateAddress({ addresses: newAddresses });
      
      if (result.success) {
        message.success('Adres silindi!');
        setAddresses(newAddresses);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Address delete error:', error);
      message.error('Adres silinirken hata oluştu');
    }
  };

  const openEditAddressModal = (address: Address) => {
    setEditingAddress(address);
    addressForm.setFieldsValue(address);
    setIsAddressModalVisible(true);
  };

  const openNewAddressModal = () => {
    setEditingAddress(null);
    addressForm.resetFields();
    addressForm.setFieldsValue({ isDefault: addresses.length === 0 });
    setIsAddressModalVisible(true);
  };

  const closeModals = () => {
    setIsProfileModalVisible(false);
    setIsAddressModalVisible(false);
    setIsEmailVerificationModalVisible(false);
    setEditingAddress(null);
    addressForm.resetFields();
    emailVerificationForm.resetFields();
  };

  const handleEmailVerification = async (values: { token: string }) => {
    try {
      setEmailVerificationLoading(true);
      const result = await verifyEmail({ token: values.token });
      
      if (result.success) {
        message.success('Email başarıyla doğrulandı!');
        setIsEmailVerificationModalVisible(false);
        
        if (user) {
          setUser({
            ...user,
            emailVerified: true
          });
        }
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      message.error('Email doğrulanırken hata oluştu');
    } finally {
      setEmailVerificationLoading(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                         <div className="text-center mb-8">
                   <div className="bg-white p-6 rounded-xl shadow-lg border-0">
                     <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                       Profil Bilgilerim
                     </h1>
                   </div>
                 </div>

                <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="text-center shadow-lg border-0 rounded-xl">
              <div className="mb-6">
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Tag color="blue" icon={<MailOutlined />}>
                    {user.email}
                  </Tag>
                  {user.role === 'admin' && (
                    <Tag color="gold" icon={<CrownOutlined />}>
                      Admin
                    </Tag>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-3 mt-4">
                  <Tag color={user.emailVerified ? 'green' : 'red'}>
                    {user.emailVerified ? 'Email Doğrulandı' : 'Email Doğrulanmadı'}
                  </Tag>
                  {!user.emailVerified && (
                    <Button 
                      type="primary" 
                      size="middle"
                      onClick={() => setIsEmailVerificationModalVisible(true)}
                      className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 text-white font-medium px-4 py-2 rounded-lg shadow-md"
                      icon={<MailOutlined />}
                    >
                      Maili Doğrula
                    </Button>
                  )}
                </div>
              </div>

              <Divider />

              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <PhoneOutlined className="text-gray-400" />
                  <span className="text-gray-600">
                    {user.phoneNumber || 'Telefon numarası eklenmemiş'}
                  </span>
                </div>
                                  <div className="flex items-center space-x-3">
                    <CalendarOutlined className="text-gray-400" />
                    <span className="text-gray-600">
                      Üye olma: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                    </span>
                  </div>
                <div className="flex items-center space-x-3">
                  <EnvironmentOutlined className="text-gray-400" />
                  <span className="text-gray-600">
                    {addresses.length} adres
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <HeartOutlined className="text-gray-400" />
                  <span className="text-gray-600">
                    {favoriteCategories.length} favori kategori
                  </span>
                </div>
              </div>

              <Divider />

              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setIsProfileModalVisible(true)}
                className="w-full"
              >
                Profili Düzenle
              </Button>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Tabs 
              defaultActiveKey="profile" 
              className="bg-white rounded-xl shadow-lg border-0"
              items={[
                {
                  key: 'profile',
                  label: 'Profil Bilgileri',
                  children: (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ad Soyad</h3>
                          <p className="text-gray-600">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                          <p className="text-gray-600">{user.email}</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefon</h3>
                          <p className="text-gray-600">{user.phoneNumber || 'Belirtilmemiş'}</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rol</h3>
                          <Tag color={user.role === 'admin' ? 'gold' : 'blue'}>
                            {user.role === 'admin' ? 'Admin' : 'Müşteri'}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'addresses',
                  label: 'Adreslerim',
                  children: (
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900">Adres Listesi</h3>
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={openNewAddressModal}
                        >
                          Yeni Adres Ekle
                        </Button>
                      </div>

                      {addresses.length === 0 ? (
                        <Empty 
                          description="Henüz adres eklenmemiş"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <div className="space-y-4">
                          {addresses.map((address, index) => (
                            <Card 
                              key={address._id || index}
                              className="border-l-4 border-l-blue-500 shadow-md border-0 rounded-lg"
                              extra={
                                <Space>
                                  <Button 
                                    type="text" 
                                    icon={<EditOutlined />}
                                    onClick={() => openEditAddressModal(address)}
                                  />
                                  <Popconfirm
                                    title="Bu adresi silmek istediğinizden emin misiniz?"
                                    onConfirm={() => handleAddressDelete(address._id || '')}
                                    okText="Evet"
                                    cancelText="Hayır"
                                  >
                                    <Button 
                                      type="text" 
                                      danger 
                                      icon={<DeleteOutlined />}
                                    />
                                  </Popconfirm>
                                </Space>
                              }
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-medium text-gray-900">
                                      {address.street}
                                    </h4>
                                    {address.isDefault && (
                                      <Tag color="green">Varsayılan</Tag>
                                    )}
                                  </div>
                                  <p className="text-gray-600">
                                    {address.city}, {address.state} {address.zipCode}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    {address.country}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  key: 'categories',
                  label: 'Favori Kategoriler',
                  children: (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 bg-gray-50 p-4 rounded-lg">Favori Kategorilerim</h3>
                      
                      {favoriteCategories.length === 0 ? (
                        <Empty 
                          description="Henüz favori kategori eklenmemiş"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 bg-white p-4 rounded-lg shadow-sm">
                          {favoriteCategories.map((category, index) => (
                            <Tag key={index} color="blue" className="text-sm">
                              {category}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </Col>
        </Row>

        <Modal
          title="Profil Bilgilerini Düzenle"
          open={isProfileModalVisible}
          onCancel={closeModals}
          footer={null}
          width={500}
          className="rounded-xl"
        >
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
          >
            <Form.Item
              name="firstName"
              label="Ad"
              rules={[{ required: true, message: 'Ad gerekli!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Adınız" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Soyad"
              rules={[{ required: true, message: 'Soyad gerekli!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Soyadınız" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Telefon Numarası"
              rules={[
                { pattern: /^[0-9+\-\s()]+$/, message: 'Geçerli telefon numarası girin!' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Telefon numaranız" />
            </Form.Item>

            <Form.Item
              name="favoriteCategories"
              label="Favori Kategoriler"
            >
              <Select
                mode="multiple"
                placeholder="Favori kategorilerinizi seçin"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {availableCategories.map(category => (
                  <Option key={category._id} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={closeModals}>
                  İptal
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={profileLoading}
                  icon={<SaveOutlined />}
                >
                  Kaydet
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
          open={isAddressModalVisible}
          onCancel={closeModals}
          footer={null}
          width={600}
          className="rounded-xl"
        >
          <Form
            form={addressForm}
            layout="vertical"
            onFinish={handleAddressSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="street"
                  label="Sokak/Cadde"
                  rules={[{ required: true, message: 'Sokak/Cadde gerekli!' }]}
                >
                  <Input placeholder="Sokak veya cadde adı" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="city"
                  label="Şehir"
                  rules={[{ required: true, message: 'Şehir gerekli!' }]}
                >
                  <Input placeholder="Şehir" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="state"
                  label="İl/İlçe"
                  rules={[{ required: true, message: 'İl/İlçe gerekli!' }]}
                >
                  <Input placeholder="İl veya ilçe" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="zipCode"
                  label="Posta Kodu"
                  rules={[{ required: true, message: 'Posta kodu gerekli!' }]}
                >
                  <Input placeholder="Posta kodu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="country"
                  label="Ülke"
                  rules={[{ required: true, message: 'Ülke gerekli!' }]}
                >
                  <Select placeholder="Ülke seçin">
                    <Option value="TR">Türkiye</Option>
                    <Option value="US">Amerika Birleşik Devletleri</Option>
                    <Option value="DE">Almanya</Option>
                    <Option value="FR">Fransa</Option>
                    <Option value="GB">Birleşik Krallık</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="isDefault"
              label="Varsayılan Adres"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={closeModals}>
                  İptal
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={addressLoading}
                  icon={<SaveOutlined />}
                >
                  {editingAddress ? 'Güncelle' : 'Ekle'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
                 </Modal>

                   <Modal
            title="Email Doğrulama"
            open={isEmailVerificationModalVisible}
            onCancel={closeModals}
            footer={null}
            width={400}
            className="rounded-xl"
          >
            <Form
              form={emailVerificationForm}
              layout="vertical"
              onFinish={handleEmailVerification}
            >
              <Form.Item
                name="token"
                label="Doğrulama Token'ı"
                rules={[{ required: true, message: 'Token gerekli!' }]}
              >
                <Input 
                  placeholder="Email'deki doğrulama token'ını girin"
                  className="font-mono"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Space className="w-full justify-end">
                  <Button onClick={closeModals}>
                    İptal
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={emailVerificationLoading}
                  >
                    Doğrula
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
       </div>
     </div>
   );
 }
