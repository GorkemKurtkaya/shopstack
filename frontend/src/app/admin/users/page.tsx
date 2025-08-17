"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Avatar, 
  Switch, 
  Popconfirm, 
  message, 
  Input, 
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
  Modal,
  Form,
  Divider,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { 
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconShield
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { getAllUsers, deleteUser, updateUser, User } from '@/services/user';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm] = Form.useForm();
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      
      if (Array.isArray(data)) {
        setUsers(data);
        setPagination(prev => ({ ...prev, total: data.length }));
      } else {
        console.error('API response is not an array:', data);
        setUsers([]);
        message.error('Kullanıcı verileri beklenmeyen formatta');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      message.error('Kullanıcılar yüklenirken bir hata oluştu');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('Kullanıcı başarıyla silindi');
      fetchUsers();
    } catch (error) {
      message.error('Kullanıcı silinirken bir hata oluştu');
    }
  };




  const handleEdit = (user: User) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role
    });
    setEditModalVisible(true);
  };


  const handleEditSubmit = async (values: any) => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser._id, values);
      message.success('Kullanıcı başarıyla güncellendi');
      setEditModalVisible(false);
      setSelectedUser(null);
      editForm.resetFields();
      fetchUsers();
    } catch (error) {
      message.error('Kullanıcı güncellenirken bir hata oluştu');
    }
  };


  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!user || typeof user !== 'object') return false;
    
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    const matchesSearch = fullName.includes(searchText.toLowerCase()) ||
                         email.includes(searchText.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesVerified = filterVerified === 'all' || 
                           (filterVerified === 'verified' && user.emailVerified) ||
                           (filterVerified === 'not-verified' && !user.emailVerified);
    
    return matchesSearch && matchesRole && matchesVerified;
  }) : [];


  const columns = [
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (record: User) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            icon={<UserOutlined />}
            className="bg-blue-500"
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleColors = {
          admin: 'red',
          customer: 'blue',
          moderator: 'orange'
        };
        const roleLabels = {
          admin: 'Admin',
          customer: 'Müşteri',
          moderator: 'Moderatör'
        };
        return (
          <Tag color={roleColors[role as keyof typeof roleColors] || 'default'}>
            {roleLabels[role as keyof typeof roleLabels] || role}
          </Tag>
        );
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Müşteri', value: 'customer' },
        { text: 'Moderatör', value: 'moderator' }
      ],
      onFilter: (value: any, record: User) => record.role === value,
    },
    {
      title: 'Telefon',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => (
        <div className="flex items-center space-x-2">
          <PhoneOutlined className="text-gray-400" />
          <span>{phone || 'Telefon yok'}</span>
        </div>
      ),
    },
    {
      title: 'Email Doğrulandı',
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      render: (verified: boolean) => (
        <Tag color={verified ? 'green' : 'red'}>
          {verified ? 'Evet' : 'Hayır'}
        </Tag>
      ),
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div className="flex items-center space-x-2">
          <CalendarOutlined className="text-gray-400" />
          <span className="text-sm text-gray-500">
            {date ? new Date(date).toLocaleDateString('tr-TR') : 'Tarih yok'}
          </span>
        </div>
      ),
      sorter: (a: User, b: User) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: User) => (
        <Space size="small">
          <Tooltip title="Görüntüle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/admin/users/${record._id}`)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Popconfirm
              title="Kullanıcıyı silmek istediğinizden emin misiniz?"
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
    total: Array.isArray(users) ? users.length : 0,
    verified: Array.isArray(users) ? users.filter(u => u?.emailVerified).length : 0,
    notVerified: Array.isArray(users) ? users.filter(u => !u?.emailVerified).length : 0,
    admins: Array.isArray(users) ? users.filter(u => u?.role === 'admin').length : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/admin/users/new')}
          size="large"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Toplam Kullanıcı"
              value={stats.total}
              valueStyle={{ color: '#059669' }}
              prefix={<IconUsers size={24} className="text-emerald-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Doğrulanmış"
              value={stats.verified}
              valueStyle={{ color: '#059669' }}
              prefix={<IconUserCheck size={24} className="text-emerald-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Title level={4} className="text-orange-600 mb-2">
              <IconUserX size={24} className="inline mr-2" />
              Doğrulanmamış
            </Title>
            <div className="text-2xl font-bold text-orange-600">{stats.notVerified}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Admin"
              value={stats.admins}
              valueStyle={{ color: '#dc2626' }}
              prefix={<IconShield size={24} className="text-red-600" />}
            />
          </Card>
        </Col>
      </Row>


      <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <Search
              placeholder="Kullanıcı ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-80"
              prefix={<SearchOutlined />}
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <Select
              value={filterRole}
              onChange={setFilterRole}
              className="w-full sm:w-40"
              placeholder="Rol"
            >
              <Option value="all">Tüm Roller</Option>
              <Option value="admin">Admin</Option>
              <Option value="customer">Müşteri</Option>
              <Option value="moderator">Moderatör</Option>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Select
              value={filterVerified}
              onChange={setFilterVerified}
              className="w-full sm:w-40"
              placeholder="Email Durumu"
            >
              <Option value="all">Tümü</Option>
              <Option value="verified">Doğrulanmış</Option>
              <Option value="not-verified">Doğrulanmamış</Option>
            </Select>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchUsers}
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
            dataSource={filteredUsers}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} / ${total} kullanıcı`,
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

      <Modal
        title="Kullanıcı Düzenle"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Ad"
                rules={[{ required: true, message: 'Ad gereklidir!' }]}
              >
                <Input placeholder="Ad" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Soyad"
                rules={[{ required: true, message: 'Soyad gereklidir!' }]}
              >
                <Input placeholder="Soyad" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email gereklidir!' },
              { type: 'email', message: 'Geçerli bir email girin!' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Telefon"
              >
                <Input placeholder="Telefon" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Rol"
                rules={[{ required: true, message: 'Rol gereklidir!' }]}
              >
                <Select placeholder="Rol seçin">
                  <Option value="admin">Admin</Option>
                  <Option value="customer">Müşteri</Option>
                  <Option value="moderator">Moderatör</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setSelectedUser(null);
                editForm.resetFields();
              }}
            >
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Güncelle
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
