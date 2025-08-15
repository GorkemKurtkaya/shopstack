"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Switch, 
  Popconfirm, 
  message, 
  Input, 
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
  Modal,
  Form
} from 'antd';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconSearch,
  IconRefresh,
  IconFolder,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory, updateCategoryStatus, Category } from '@/services/category';

const { Search } = Input;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // Kategorileri yükle
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Fetch categories error:', error);
      message.error('Kategoriler yüklenirken bir hata oluştu');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Modal aç
  const showModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      form.setFieldsValue({
        name: category.name,
        active: category.active
      });
    } else {
      setEditingCategory(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Modal kapat
  const handleCancel = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Form gönderimi
  const handleSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, values);
        message.success('Kategori başarıyla güncellendi');
      } else {
        await createCategory(values);
        message.success('Kategori başarıyla oluşturuldu');
      }
      handleCancel();
      fetchCategories();
    } catch (error) {
      message.error(editingCategory ? 'Kategori güncellenirken bir hata oluştu' : 'Kategori oluşturulurken bir hata oluştu');
    }
  };

  // Kategori sil
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success('Kategori başarıyla silindi');
      fetchCategories();
    } catch (error) {
      message.error('Kategori silinirken bir hata oluştu');
    }
  };

  // Active durumunu güncelle
  const handleActiveChange = async (id: string, active: boolean) => {
    try {
      await updateCategoryStatus(id, active);
      message.success('Kategori durumu güncellendi');
      fetchCategories();
    } catch (error) {
      message.error('Kategori durumu güncellenirken bir hata oluştu');
    }
  };

  // Filtreleme - Sadece arama metnine göre filtrele
  const filteredCategories = categories.filter(category => {
    if (searchText === '') return true;
    
    return category.name.toLowerCase().includes(searchText.toLowerCase()) ||
           category.slug.toLowerCase().includes(searchText.toLowerCase());
  });

  // Tablo sütunları
  const columns = [
    {
      title: 'Kategori Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Category) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <IconFolder size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">{record.slug}</div>
          </div>
        </div>
      ),
      sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
    },
    {
      title: 'Durum',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: Category) => (
        <Switch
          checked={active}
          onChange={(checked) => handleActiveChange(record._id, checked)}
          className={active ? 'bg-green-500' : 'bg-gray-400'}
        />
      ),
      filters: [
        { text: 'Aktif', value: 'true' },
        { text: 'Pasif', value: 'false' }
      ],
      onFilter: (value: string | number | boolean, record: Category) => {
        if (value === 'true') return record.active === true;
        if (value === 'false') return record.active === false;
        return true; // Tüm kategorileri göster
      },
    },
    {
      title: 'Oluşturulma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString('tr-TR')}
        </span>
      ),
      sorter: (a: Category, b: Category) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Güncellenme Tarihi',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => (
        <span className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString('tr-TR')}
        </span>
      ),
      sorter: (a: Category, b: Category) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: Category) => (
        <Space size="small">
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<IconEdit size={16} />}
              onClick={() => showModal(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Popconfirm
              title="Kategoriyi silmek istediğinizden emin misiniz?"
              description="Bu işlem geri alınamaz."
              onConfirm={() => handleDelete(record._id)}
              okText="Evet"
              cancelText="Hayır"
              okType="danger"
            >
              <Button
                type="text"
                icon={<IconTrash size={16} />}
                className="text-red-600 hover:text-red-800"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // İstatistikler
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.active).length,
    inactive: categories.filter(c => !c.active).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h1>
                  <Button
            type="primary"
            icon={<IconPlus size={16} />}
            onClick={() => showModal()}
            size="large"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Yeni Kategori
          </Button>
      </div>

      {/* İstatistikler */}
      <Row gutter={16}>
        <Col span={8}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Toplam Kategori"
              value={stats.total}
              valueStyle={{ color: '#3f8600' }}
              prefix={<IconFolder size={24} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Aktif Kategoriler"
              value={stats.active}
              valueStyle={{ color: '#1890ff' }}
              prefix={<IconCheck size={24} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
            <Statistic
              title="Pasif Kategoriler"
              value={stats.inactive}
              valueStyle={{ color: '#cf1322' }}
              prefix={<IconX size={24} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtreler */}
      <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-wrap gap-4 items-center">
          <Search
            placeholder="Kategori ara..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<IconSearch size={16} />}
          />
          
          <Button
            icon={<IconRefresh size={16} />}
            onClick={fetchCategories}
            loading={loading}
          >
            Yenile
          </Button>
        </div>
      </Card>

      {/* Kategoriler Tablosu */}
      <Card className="shadow-lg border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50">
        <Table
          columns={columns as any}
          dataSource={filteredCategories}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} kategori`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Kategori Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <IconFolder size={20} className="text-blue-600" />
            <span>{editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}</span>
          </div>
        }
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            active: true
          }}
        >
          <Form.Item
            name="name"
            label="Kategori Adı"
            rules={[{ required: true, message: 'Kategori adı gereklidir!' }]}
          >
            <Input 
              placeholder="Kategori adını girin" 
              size="large"
              className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="active"
            label="Durum"
            valuePropName="checked"
          >
            <Switch 
              className="bg-green-500"
            />
          </Form.Item>

          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={handleCancel} size="large">
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingCategory ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
