"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Image, 
  Switch, 
  Popconfirm, 
  message, 
  Input, 
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { 
  IconPackage,
  IconStar,
  IconAlertTriangle,
  IconCurrencyDollar
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { getAllProducts, deleteProduct, updateProductStatus, Product, PaginatedProductsResponse, getImageUrl } from '@/services/product';
import ProductEditModal from './producteditModal';

const { Search } = Input;
const { Option } = Select;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const router = useRouter();


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      
      if (data && Array.isArray(data.items)) {
        setProducts(data.items);
        setPagination(prev => ({ 
          ...prev, 
          total: data.total,
          current: data.page,
          pageSize: data.limit
        }));
      } else {
        console.error('API response format is incorrect:', data);
        setProducts([]);
        message.error('Ürün verileri beklenmeyen formatta');
      }
    } catch (error) {
      console.error('Fetch products error:', error);
      message.error('Ürünler yüklenirken bir hata oluştu');
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); 


  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success('Ürün başarıyla silindi');
      fetchProducts();
    } catch (error) {
      message.error('Ürün silinirken bir hata oluştu');
    }
  };


  const handleFeaturedChange = async (id: string, featured: boolean) => {
    try {
      await updateProductStatus(id, { featured });
      message.success('Ürün durumu güncellendi');
      fetchProducts();
    } catch (error) {
      message.error('Ürün durumu güncellenirken bir hata oluştu');
    }
  };


  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (!product || typeof product !== 'object') return false;
    
    const productName = product.name || '';
    const productDescription = product.description || '';
    const productTags = Array.isArray(product.tags) ? product.tags : [];
    
    const matchesSearch = productName.toLowerCase().includes(searchText.toLowerCase()) ||
                         productDescription.toLowerCase().includes(searchText.toLowerCase()) ||
                         productTags.some(tag => 
                           typeof tag === 'string' && tag.toLowerCase().includes(searchText.toLowerCase())
                         );
    
    const matchesFeatured = filterFeatured === 'all' || 
                           (filterFeatured === 'featured' && product.featured) ||
                           (filterFeatured === 'not-featured' && !product.featured);
    
    return matchesSearch && matchesFeatured;
  }) : [];


  const columns = [
    {
      title: 'Ürün',
      key: 'product',
      render: (record: Product) => (
        <div className="flex items-center space-x-3">
          <Image
            width={50}
            height={50}
            src={getImageUrl(Array.isArray(record.images) && record.images[0] ? record.images[0] : '')}
            alt={record.name || 'Ürün'}
            fallback="/placeholder-image.svg"
            className="rounded-lg object-cover"
          />
          <div>
            <div className="font-medium text-gray-900">{record.name || 'İsimsiz Ürün'}</div>
            <div className="text-sm text-gray-500">
              {(record.description || '').substring(0, 50)}{record.description && record.description.length > 50 ? '...' : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => (
        <Tag color="blue">
          {(typeof category === 'object' && category?.name) ? category.name : category || 'Kategori Yok'}
        </Tag>
      ),
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span className="font-semibold text-green-600">
          {(price || 0).toLocaleString('tr-TR')} TL
        </span>
      ),
      sorter: (a: Product, b: Product) => (a.price || 0) - (b.price || 0),
    },
    {
      title: 'Stok',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number = 0) => (
        <Tag color={stock > 10 ? 'green' : stock > 5 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      ),
      sorter: (a: Product, b: Product) => (a.stock || 0) - (b.stock || 0),
    },
    {
      title: 'Öne Çıkan',
      dataIndex: 'featured',
      key: 'featured',
      render: (featured: boolean, record: Product) => (
        <Switch
          checked={featured || false}
          onChange={(checked) => handleFeaturedChange(record._id, checked)}
          checkedChildren="Evet"
          unCheckedChildren="Hayır"
        />
      ),
    },
    {
      title: 'Değerlendirme',
      dataIndex: 'averageRating',
      key: 'averageRating',
      render: (rating: number = 0) => (
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{rating.toFixed(1)}</span>
        </div>
      ),
      sorter: (a: Product, b: Product) => (a.averageRating || 0) - (b.averageRating || 0),
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-sm text-gray-500">
          {date ? new Date(date).toLocaleDateString('tr-TR') : 'Tarih Yok'}
        </span>
      ),
      sorter: (a: Product, b: Product) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: Product) => (
        <Space size="small">
          <Tooltip title="Görüntüle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/admin/products/${record._id}`)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedProductId(record._id);
                setEditModalVisible(true);
              }}
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Popconfirm
              title="Ürünü silmek istediğinizden emin misiniz?"
              description="Bu işlem geri alınamaz."
              onConfirm={() => handleDelete(record._id)}
              okText="Evet"
              cancelText="Hayır"
              okType="danger"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-red-600 hover:text-red-800"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];


  const stats = {
    total: Array.isArray(products) ? products.length : 0,
    featured: Array.isArray(products) ? products.filter(p => p?.featured).length : 0,
    lowStock: Array.isArray(products) ? products.filter(p => (p?.stock || 0) < 10).length : 0,
    totalValue: Array.isArray(products) ? products.reduce((sum, p) => sum + ((p?.price || 0) * (p?.stock || 0)), 0) : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/admin/products/new')}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Yeni Ürün Ekle
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Toplam Ürün"
              value={stats.total}
              valueStyle={{ color: '#059669' }}
              prefix={<IconPackage size={24} className="text-emerald-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Öne Çıkan"
              value={stats.featured}
              valueStyle={{ color: '#dc2626' }}
              prefix={<IconStar size={24} className="text-red-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Düşük Stok"
              value={stats.lowStock}
              valueStyle={{ color: '#ea580c' }}
              prefix={<IconAlertTriangle size={24} className="text-orange-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Toplam Değer"
              value={stats.totalValue.toLocaleString('tr-TR')}
              suffix="TL"
              valueStyle={{ color: '#7c3aed' }}
              prefix={<IconCurrencyDollar size={24} className="text-violet-600" />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <Search
              placeholder="Ürün ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-80"
              prefix={<SearchOutlined />}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <Select
              value={filterFeatured}
              onChange={setFilterFeatured}
              className="w-full sm:w-40"
              placeholder="Öne çıkan"
            >
              <Option value="all">Tümü</Option>
              <Option value="featured">Öne Çıkan</Option>
              <Option value="not-featured">Öne Çıkmayan</Option>
            </Select>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchProducts}
            loading={loading}
            className="w-full sm:w-auto"
          >
            Yenile
          </Button>
        </div>
      </Card>

      <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} / ${total} ürün`,
              responsive: true,
              size: 'small',
            }}
            onChange={(pagination) => {
              if (pagination.current && pagination.pageSize) {
                setPagination({
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total || 0
                });
              }
            }}
            scroll={{ x: 'max-content' }}
            size="small"
            className="responsive-table"
          />
        </div>
      </Card>

      <ProductEditModal
        visible={editModalVisible}
        productId={selectedProductId}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedProductId(null);
        }}
        onSuccess={() => {
          fetchProducts();
          setEditModalVisible(false);
          setSelectedProductId(null);
        }}
      />
    </div>
  );
}