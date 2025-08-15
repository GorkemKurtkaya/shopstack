"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Tooltip,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Modal,
  Form,
  Typography,
  Spin,
  Alert,
  Descriptions,
  Divider
} from 'antd';
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconSearch,
  IconFilter,
  IconReload,
  IconPackage,
  IconTruck,
  IconCheck,
  IconX,
  IconCurrencyDollar,
  IconShoppingCart
} from '@tabler/icons-react';
import { getAllOrders, getOrderIncome, updateOrderStatus, deleteOrder, Order, OrderIncome } from '@/services/orders';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [income, setIncome] = useState<OrderIncome | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();

     const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersData, incomeData] = await Promise.all([
        getAllOrders(),
        getOrderIncome()
      ]);
      setOrders(ordersData);
      setIncome(incomeData);
    } catch (error) {
      message.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

     const handleStatusUpdate = async (values: { status: Order['status'] }) => {
    if (!selectedOrder) return;
    
    try {
      await updateOrderStatus(selectedOrder._id, values.status);
      message.success('Sipariş durumu güncellendi');
      setStatusModalVisible(false);
      setSelectedOrder(null);
      statusForm.resetFields();
      fetchOrders();
    } catch (error) {
      message.error('Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

     const handleDelete = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      message.success('Sipariş silindi');
      fetchOrders();
    } catch (error) {
      message.error('Sipariş silinirken bir hata oluştu');
    }
  };

     const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchText.toLowerCase()) ||
      order.user.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

         const stats = {
     total: orders.length,
     pending: orders.filter(o => o.status === 'pending').length,
     processing: orders.filter(o => o.status === 'processing').length,
     shipped: orders.filter(o => o.status === 'shipped').length,
     delivered: orders.filter(o => o.status === 'delivered').length,
     cancelled: orders.filter(o => o.status === 'cancelled').length,
     totalAmount: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
   };

     const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

     const getStatusText = (status: Order['status']) => {
    const texts = {
      pending: 'Beklemede',
      processing: 'İşleniyor',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };
    return texts[status] || status;
  };

     const columns = [
    {
      title: 'Sipariş ID',
      key: '_id',
      render: (order: Order) => (
        <Text code className="text-xs">{order._id.slice(-8)}</Text>
      ),
      sorter: (a: Order, b: Order) => a._id.localeCompare(b._id),
    },
    {
      title: 'Kullanıcı ID',
      key: 'user',
      render: (order: Order) => (
        <Text code className="text-xs">{order.user.slice(-8)}</Text>
      ),
      sorter: (a: Order, b: Order) => a.user.localeCompare(b.user),
    },
    {
      title: 'Ürün Sayısı',
      key: 'orderItems',
      render: (order: Order) => (
        <div className="flex items-center space-x-2">
          <IconShoppingCart size={16} className="text-blue-600" />
          <span className="font-medium">{order.orderItems.length}</span>
        </div>
      ),
      sorter: (a: Order, b: Order) => a.orderItems.length - b.orderItems.length,
    },
         {
       title: 'Toplam Tutar',
       key: 'totalAmount',
       render: (order: Order) => (
         <div className="flex items-center space-x-2">
           <IconCurrencyDollar size={16} className="text-green-600" />
           <span className="font-medium">
             {(order.totalAmount || 0).toLocaleString('tr-TR')} TL
           </span>
         </div>
       ),
       sorter: (a: Order, b: Order) => (a.totalAmount || 0) - (b.totalAmount || 0),
     },
    {
      title: 'Durum',
      key: 'status',
      render: (order: Order) => (
        <Tag color={getStatusColor(order.status)}>
          {getStatusText(order.status)}
        </Tag>
      ),
      filters: [
        { text: 'Beklemede', value: 'pending' },
        { text: 'İşleniyor', value: 'processing' },
        { text: 'Kargoda', value: 'shipped' },
        { text: 'Teslim Edildi', value: 'delivered' },
        { text: 'İptal Edildi', value: 'cancelled' },
      ],
      onFilter: (value: string, record: Order) => record.status === value,
    },
         {
       title: 'Ödeme',
       key: 'paymentInfo',
       render: (order: Order) => (
         <Tag color={(order.paymentInfo?.status || 'pending') === 'paid' ? 'green' : 'orange'}>
           {(order.paymentInfo?.status || 'pending') === 'paid' ? 'Ödendi' : 'Beklemede'}
         </Tag>
       ),
     },
    {
      title: 'Tarih',
      key: 'createdAt',
      render: (order: Order) => (
        <div className="text-sm text-gray-600">
          {new Date(order.createdAt).toLocaleDateString('tr-TR')}
        </div>
      ),
      sorter: (a: Order, b: Order) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (order: Order) => (
        <Space size="small">
          <Tooltip title="Detayları Gör">
            <Button
              type="primary"
              size="small"
              icon={<IconEye size={14} />}
              onClick={() => {
                setSelectedOrder(order);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Durum Güncelle">
            <Button
              size="small"
              icon={<IconEdit size={14} />}
              onClick={() => {
                setSelectedOrder(order);
                setStatusModalVisible(true);
              }}
            />
          </Tooltip>

          <Tooltip title="Sil">
            <Popconfirm
              title="Siparişi silmek istediğinizden emin misiniz?"
              onConfirm={() => handleDelete(order._id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button
                danger
                size="small"
                icon={<IconTrash size={14} />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
         <div className="space-y-6">
       <div className="flex items-center justify-between">
        <Title level={2} className="mb-0">Sipariş Yönetimi</Title>
        <Button
          icon={<IconReload size={16} />}
          onClick={fetchOrders}
          loading={loading}
        >
          Yenile
        </Button>
             </div>

       <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Toplam Sipariş"
              value={stats.total}
              prefix={<IconPackage size={24} className="text-blue-600" />}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Toplam Gelir"
              value={stats.totalAmount.toLocaleString('tr-TR')}
              suffix="TL"
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Bekleyen"
              value={stats.pending}
              prefix={<IconTruck size={24} className="text-orange-600" />}
              valueStyle={{ color: '#ea580c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Teslim Edilen"
              value={stats.delivered}
              prefix={<IconCheck size={24} className="text-green-600" />}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
             </Row>

       <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <Search
              placeholder="Sipariş ID veya kullanıcı ID ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-80"
              prefix={<IconSearch />}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full sm:w-40"
              placeholder="Durum"
            >
              <Option value="all">Tümü</Option>
              <Option value="pending">Beklemede</Option>
              <Option value="processing">İşleniyor</Option>
              <Option value="shipped">Kargoda</Option>
              <Option value="delivered">Teslim Edildi</Option>
              <Option value="cancelled">İptal Edildi</Option>
            </Select>
          </div>
        </div>
             </Card>

       <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="overflow-x-auto">
          <Table
            columns={columns as any}
            dataSource={filteredOrders}
            rowKey="_id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} / ${total} sipariş`,
              responsive: true,
              size: 'small',
            }}
            scroll={{ x: 'max-content' }}
            size="small"
            className="responsive-table"
          />
        </div>
             </Card>

       <Modal
        title="Sipariş Detayları"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div className="space-y-4">
                         <Descriptions column={2} bordered>
               <Descriptions.Item label="Sipariş ID" span={2}>
                 <Text code>{selectedOrder._id || 'ID Yok'}</Text>
               </Descriptions.Item>
               <Descriptions.Item label="Kullanıcı ID">
                 <Text code>{selectedOrder.user || 'Kullanıcı Yok'}</Text>
               </Descriptions.Item>
               <Descriptions.Item label="Toplam Tutar">
                 <Text strong className="text-green-600">
                   {(selectedOrder.totalAmount || 0).toLocaleString('tr-TR')} TL
                 </Text>
               </Descriptions.Item>
               <Descriptions.Item label="Durum">
                 <Tag color={getStatusColor(selectedOrder.status || 'pending')}>
                   {getStatusText(selectedOrder.status || 'pending')}
                 </Tag>
               </Descriptions.Item>
               <Descriptions.Item label="Ödeme Durumu">
                 <Tag color={(selectedOrder.paymentInfo?.status || 'pending') === 'paid' ? 'green' : 'orange'}>
                   {(selectedOrder.paymentInfo?.status || 'pending') === 'paid' ? 'Ödendi' : 'Beklemede'}
                 </Tag>
               </Descriptions.Item>
             </Descriptions>

                         <Divider>Ürünler</Divider>
             <div className="space-y-2">
               {selectedOrder.orderItems.map((item, index) => (
                 <Card key={index} size="small" className="bg-gray-50">
                   <div className="flex justify-between items-center">
                     <div>
                       <Text strong>Ürün ID: {item.product || 'ID Yok'}</Text>
                       <br />
                       <Text>Miktar: {item.quantity || 0}</Text>
                       <br />
                       <Text>Fiyat: {(item.price || 0).toLocaleString('tr-TR')} TL</Text>
                     </div>
                     {item.variant && (
                       <div className="text-right">
                         <Text type="secondary">
                           {item.variant.size && `Boyut: ${item.variant.size}`}
                           {item.variant.color && `, Renk: ${item.variant.color}`}
                         </Text>
                       </div>
                     )}
                   </div>
                 </Card>
               ))}
             </div>

                         <Divider>Teslimat Adresi</Divider>
             <Descriptions column={2} bordered>
               <Descriptions.Item label="Sokak">
                 {selectedOrder.shippingAddress?.street || 'Adres Yok'}
               </Descriptions.Item>
               <Descriptions.Item label="Şehir">
                 {selectedOrder.shippingAddress?.city || 'Şehir Yok'}
               </Descriptions.Item>
               <Descriptions.Item label="Eyalet">
                 {selectedOrder.shippingAddress?.state || 'Eyalet Yok'}
               </Descriptions.Item>
               <Descriptions.Item label="Posta Kodu">
                 {selectedOrder.shippingAddress?.zipCode || 'Posta Kodu Yok'}
               </Descriptions.Item>
               <Descriptions.Item label="Ülke" span={2}>
                 {selectedOrder.shippingAddress?.country || 'Ülke Yok'}
               </Descriptions.Item>
             </Descriptions>
          </div>
        )}
             </Modal>

       <Modal
        title="Sipariş Durumu Güncelle"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedOrder(null);
          statusForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={statusForm}
          onFinish={handleStatusUpdate}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="Yeni Durum"
            rules={[{ required: true, message: 'Lütfen durum seçin' }]}
          >
            <Select placeholder="Durum seçin">
              <Option value="pending">Beklemede</Option>
              <Option value="processing">İşleniyor</Option>
              <Option value="shipped">Kargoda</Option>
              <Option value="delivered">Teslim Edildi</Option>
              <Option value="cancelled">İptal Edildi</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Güncelle
              </Button>
              <Button onClick={() => {
                setStatusModalVisible(false);
                setSelectedOrder(null);
                statusForm.resetFields();
              }}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
