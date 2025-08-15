"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Rate,
  message,
  Popconfirm,
  Tooltip,
  Statistic,
  Row,
  Col,
  Input,
  Select,
  Switch,
  Image,
  Typography,
  Spin,
  Alert
} from 'antd';
import {
  IconEye,
  IconCheck,
  IconTrash,
  IconSearch,
  IconFilter,
  IconReload,
  IconMessage,
  IconStar,
  IconUser,
  IconPackage
} from '@tabler/icons-react';
import { getAllReviews, approveReview, deleteReview, Review } from '@/services/review';
import { getUserById, User as UserType } from '@/services/user';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<{ [key: string]: UserType }>({});
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  // Yorumları yükle - useCallback ile optimize edildi
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
      
      // Kullanıcı bilgilerini çek - sadece yeni kullanıcılar için
      const newUserIds = data.filter(review => 
        review.user?._id && !users[review.user._id]
      ).map(review => review.user._id);
      
      if (newUserIds.length > 0) {
        const userPromises = newUserIds.map(async (userId) => {
          try {
            const userData = await getUserById(userId);
            return { [userId]: userData };
          } catch (error) {
            console.error(`Kullanıcı ${userId} bilgisi yüklenemedi:`, error);
            return null;
          }
        });
        
        const userResults = await Promise.all(userPromises);
        const newUsers = userResults.reduce((acc, user) => {
          if (user) {
            return { ...acc, ...user };
          }
          return acc;
        }, {});
        
        setUsers(prev => ({ ...prev, ...newUsers }));
      }
    } catch (error) {
      message.error('Yorumlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [users]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Yorum onayla - useCallback ile optimize edildi
  const handleApprove = useCallback(async (reviewId: string) => {
    try {
      await approveReview(reviewId);
      message.success('Yorum onaylandı');
      fetchReviews();
    } catch (error) {
      message.error('Yorum onaylanırken bir hata oluştu');
    }
  }, [fetchReviews]);

  // Yorum sil - useCallback ile optimize edildi
  const handleDelete = useCallback(async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      message.success('Yorum silindi');
      fetchReviews();
    } catch (error) {
      message.error('Yorum silinirken bir hata oluştu');
    }
  }, [fetchReviews]);

  // Filtrelenmiş yorumlar - useMemo ile optimize edildi
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // Güvenli kontroller
      const user = users[review.user?._id || ''] || review.user;
      const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
      const productName = review.product?.name || '';
      const comment = review.comment || '';
      
      const matchesSearch = 
        userName.toLowerCase().includes(searchText.toLowerCase()) ||
        productName.toLowerCase().includes(searchText.toLowerCase()) ||
        comment.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'approved' && review.approved) ||
        (filterStatus === 'pending' && !review.approved);
      
      const matchesRating = filterRating === 'all' || 
        review.rating === parseInt(filterRating);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, users, searchText, filterStatus, filterRating]);

  // İstatistikler - useMemo ile optimize edildi
  const stats = useMemo(() => ({
    total: reviews.length,
    approved: reviews.filter(r => r.approved).length,
    pending: reviews.filter(r => !r.approved).length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
  }), [reviews]);

  // Tablo kolonları - useMemo ile optimize edildi
  const columns = useMemo(() => [
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (review: Review) => {
        const user = users[review.user?._id || ''] || review.user;
        const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'İsim Yok';
        const email = user?.email || 'Email Yok';
        
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <IconUser size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{fullName}</div>
              <div className="text-xs text-gray-500">{email}</div>
              {user && 'role' in user && (
                <div className="text-xs text-gray-400 capitalize">{user.role}</div>
              )}
            </div>
          </div>
        );
      },
      sorter: (a: Review, b: Review) => {
        const userA = users[a.user?._id || ''] || a.user;
        const userB = users[b.user?._id || ''] || b.user;
        const nameA = userA ? `${userA.firstName || ''} ${userA.lastName || ''}`.trim() : '';
        const nameB = userB ? `${userB.firstName || ''} ${userB.lastName || ''}`.trim() : '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Ürün',
      key: 'product',
      render: (review: Review) => (
        <div className="flex items-center space-x-2">
          {review.product?.images && review.product.images.length > 0 && (
            <Image
              src={review.product.images[0]}
              alt={review.product.name || 'Ürün'}
              width={32}
              height={32}
              className="rounded-md object-cover"
              fallback="/placeholder-image.svg"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{review.product?.name || 'Ürün Yok'}</div>
            <div className="text-xs text-gray-500">ID: {review.product?._id || 'ID Yok'}</div>
          </div>
        </div>
      ),
      sorter: (a: Review, b: Review) => (a.product?.name || '').localeCompare(b.product?.name || ''),
    },
    {
      title: 'Puan',
      key: 'rating',
      render: (review: Review) => (
        <div className="flex items-center space-x-2">
          <Rate disabled defaultValue={review.rating} />
          <span className="text-sm font-medium text-gray-700">{review.rating}/5</span>
        </div>
      ),
      sorter: (a: Review, b: Review) => a.rating - b.rating,
      filters: [
        { text: '5 Yıldız', value: '5' },
        { text: '4 Yıldız', value: '4' },
        { text: '3 Yıldız', value: '3' },
        { text: '2 Yıldız', value: '2' },
        { text: '1 Yıldız', value: '1' },
      ],
      onFilter: (value: string, record: Review) => record.rating === parseInt(value),
    },
    {
      title: 'Yorum',
      key: 'comment',
      render: (review: Review) => (
        <div className="max-w-xs">
          <Text className="text-sm text-gray-700 line-clamp-2">
            {review.comment || 'Yorum yok'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Durum',
      key: 'approved',
      render: (review: Review) => (
        <Tag color={review.approved ? 'green' : 'orange'}>
          {review.approved ? 'Onaylandı' : 'Beklemede'}
        </Tag>
      ),
      filters: [
        { text: 'Onaylandı', value: 'approved' },
        { text: 'Beklemede', value: 'pending' },
      ],
      onFilter: (value: string, record: Review) => 
        (value === 'approved' && record.approved) ||
        (value === 'pending' && !record.approved),
    },
    {
      title: 'Tarih',
      key: 'createdAt',
      render: (review: Review) => (
        <div className="text-sm text-gray-600">
          {new Date(review.createdAt).toLocaleDateString('tr-TR')}
        </div>
      ),
      sorter: (a: Review, b: Review) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (review: Review) => (
        <Space size="small">
          {!review.approved && (
            <Tooltip title="Onayla">
              <Button
                type="primary"
                size="small"
                icon={<IconCheck size={14} />}
                onClick={() => handleApprove(review._id)}
                className="bg-green-600 hover:bg-green-700"
              />
            </Tooltip>
          )}
          


          <Tooltip title="Sil">
            <Popconfirm
              title="Yorumu silmek istediğinizden emin misiniz?"
              onConfirm={() => handleDelete(review._id)}
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
  ], [users, handleApprove, handleDelete]);

  // Search ve filter handler'ları - useCallback ile optimize edildi
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setFilterStatus(value);
  }, []);

  const handleRatingFilterChange = useCallback((value: string) => {
    setFilterRating(value);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Title level={2} className="mb-0">Yorum Yönetimi</Title>
        <Button
          icon={<IconReload size={16} />}
          onClick={fetchReviews}
          loading={loading}
        >
          Yenile
        </Button>
      </div>

      {/* İstatistikler */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Toplam Yorum"
              value={stats.total}
              prefix={<IconMessage size={24} className="text-blue-600" />}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Onaylanan"
              value={stats.approved}
              prefix={<IconCheck size={24} className="text-green-600" />}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Bekleyen"
              value={stats.pending}
              prefix={<IconMessage size={24} className="text-orange-600" />}
              valueStyle={{ color: '#ea580c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Ortalama Puan"
              value={stats.averageRating}
              prefix={<IconStar size={24} className="text-yellow-600" />}
              valueStyle={{ color: '#ca8a04' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtreler */}
      <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <Search
              placeholder="Kullanıcı, ürün veya yorum ara..."
              allowClear
              value={searchText}
              onChange={handleSearchChange}
              className="w-full sm:w-80"
              prefix={<IconSearch />}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <Select
              value={filterStatus}
              onChange={handleStatusFilterChange}
              className="w-full sm:w-40"
              placeholder="Durum"
            >
              <Option value="all">Tümü</Option>
              <Option value="approved">Onaylanan</Option>
              <Option value="pending">Bekleyen</Option>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select
              value={filterRating}
              onChange={handleRatingFilterChange}
              className="w-full sm:w-40"
              placeholder="Puan"
            >
              <Option value="all">Tümü</Option>
              <Option value="5">5 Yıldız</Option>
              <Option value="4">4 Yıldız</Option>
              <Option value="3">3 Yıldız</Option>
              <Option value="2">2 Yıldız</Option>
              <Option value="1">1 Yıldız</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Yorum Tablosu */}
      <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="overflow-x-auto">
          <Table
            columns={columns as any}
            dataSource={filteredReviews}
            rowKey="_id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} / ${total} yorum`,
              responsive: true,
              size: 'small',
            }}
            scroll={{ x: 'max-content' }}
            size="small"
            className="responsive-table"
          />
        </div>
      </Card>
    </div>
  );
}
