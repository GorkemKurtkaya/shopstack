"use client";

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Row, 
  Col, 
  Switch, 
  InputNumber, 
  Select, 
  Upload, 
  message, 
  Space,
  Divider,
  Typography,
  Spin,
  Alert,
  Card
} from 'antd';
import { 
  IconEdit, 
  IconPlus, 
  IconMinus, 
  IconUpload,
  IconDeviceFloppy,
  IconX
} from '@tabler/icons-react';
import { getProductById, updateProduct, Product, getImageUrl } from '@/services/product';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

interface ProductEditModalProps {
  visible: boolean;
  productId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ProductEditModal({ 
  visible, 
  productId, 
  onCancel, 
  onSuccess 
}: ProductEditModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);

  // Modal açıldığında ürün verilerini yükle
  useEffect(() => {
    if (visible && productId) {
      fetchProduct();
    }
  }, [visible, productId]);

  // Ürün verilerini yükle
  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
      const data = await getProductById(productId!);
      setProduct(data);
      
              // Form'u doldur
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          stock: data.stock,
          tags: data.tags.join(', '),
          featured: data.featured,
          specifications: Object.entries(data.specifications || {}).map(([key, value]) => ({
            key,
            value: String(value)
          })),
          variants: data.variants.map(v => ({
            size: v.size || '',
            color: v.color || '',
            additionalPrice: v.additionalPrice
          }))
        });
    } catch (error) {
      message.error('Ürün yüklenirken bir hata oluştu');
      onCancel();
    } finally {
      setInitialLoading(false);
    }
  };

  // Form gönderimi
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Tags'ı array'e çevir
      const tags = values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
      
      // Specifications'ı object'e çevir
      const specifications: Record<string, string> = {};
      values.specifications.forEach((spec: any) => {
        if (spec.key && spec.value) {
          specifications[spec.key] = spec.value;
        }
      });

      // Variants'ı temizle
      const variants = values.variants.filter((v: any) => v.size || v.color);

      const updateData = {
        name: values.name,
        description: values.description,
        category: values.category,
        price: values.price,
        stock: values.stock,
        tags,
        featured: values.featured,
        specifications,
        variants
      };

      await updateProduct(productId!, updateData);
      message.success('Ürün başarıyla güncellendi');
      onSuccess();
      onCancel();
    } catch (error) {
      message.error('Ürün güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Modal kapatıldığında form'u temizle
  const handleCancel = () => {
    form.resetFields();
    setProduct(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <IconEdit size={20} className="text-blue-600" />
          <span>Ürün Düzenle: {product?.name || 'Yükleniyor...'}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      destroyOnHidden
    >
      {initialLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : !product ? (
        <Alert
          message="Ürün bulunamadı"
          description="Aradığınız ürün mevcut değil veya silinmiş olabilir."
          type="error"
          showIcon
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
                  initialValues={{
          featured: false,
          specifications: [{ key: '', value: '' }],
          variants: [{ size: '', color: '', additionalPrice: 0 }]
        }}
        >
          <Row gutter={24}>
            {/* Sol Kolon - Temel Bilgiler */}
            <Col span={16}>
              <Card title="Temel Bilgiler" className="mb-6 border-2 border-gray-200 shadow-sm">
                <Row gutter={16}>
                  <Col span={12}>
                                    <Form.Item
                  name="name"
                  label="Ürün Adı"
                  rules={[{ required: true, message: 'Ürün adı gereklidir!' }]}
                >
                  <Input 
                    placeholder="Ürün adını girin" 
                    className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                    size="large"
                  />
                </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="category"
                      label="Kategori"
                      rules={[{ required: true, message: 'Kategori gereklidir!' }]}
                    >
                      <Input 
                        placeholder="Kategori ID'si" 
                        className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label="Açıklama"
                  rules={[{ required: true, message: 'Açıklama gereklidir!' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Ürün açıklamasını girin"
                    className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="price"
                      label="Fiyat (TL)"
                      rules={[{ required: true, message: 'Fiyat gereklidir!' }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="0"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="stock"
                      label="Stok"
                      rules={[{ required: true, message: 'Stok gereklidir!' }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="0"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="featured"
                      label="Öne Çıkan"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="tags"
                  label="Etiketler"
                  help="Virgülle ayırarak etiketleri girin"
                >
                  <Input 
                    placeholder="apple, ios, phone" 
                    className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                    size="large"
                  />
                </Form.Item>
              </Card>

              {/* Specifications */}
              <Card title="Teknik Özellikler" className="mb-6 border-2 border-gray-200 shadow-sm">
                <Form.List name="specifications">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Row key={key} gutter={16} align="middle" className="mb-4 p-4 bg-gray-50 rounded-lg border">
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, 'key']}
                              label="Özellik Adı"
                              rules={[{ required: true, message: 'Özellik adı gereklidir!' }]}
                            >
                              <Input 
                                placeholder="Örn: CPU, RAM, Ekran" 
                                className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={10}>
                            <Form.Item
                              {...restField}
                              name={[name, 'value']}
                              label="Özellik Değeri"
                              rules={[{ required: true, message: 'Özellik değeri gereklidir!' }]}
                            >
                              <Input 
                                placeholder="Örn: A17, 8GB, 6.1 inç" 
                                className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Button
                              type="text"
                              danger
                              icon={<IconMinus size={16} />}
                              onClick={() => remove(name)}
                              className="mt-8"
                            />
                          </Col>
                        </Row>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<IconPlus size={16} />}
                          className="border-dashed border-2 border-gray-300 hover:border-blue-500"
                        >
                          Teknik Özellik Ekle
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Card>

              {/* Variants */}
              <Card title="Varyantlar" className="border-2 border-gray-200 shadow-sm">
                <Form.List name="variants">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Row key={key} gutter={16} align="middle" className="mb-4">
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'size']}
                              label="Boyut"
                            >
                              <Input 
                                placeholder="128GB" 
                                className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'color']}
                              label="Renk"
                            >
                              <Input 
                                placeholder="Siyah" 
                                className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'additionalPrice']}
                              label="Ek Fiyat"
                            >
                              <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="0"
                                className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                                size="large"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Button
                              type="text"
                              danger
                              icon={<IconMinus size={16} />}
                              onClick={() => remove(name)}
                              disabled={fields.length === 1}
                            />
                          </Col>
                        </Row>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<IconPlus size={16} />}
                        >
                          Varyant Ekle
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Card>
            </Col>

            {/* Sağ Kolon - Görsel ve Durum */}
            <Col span={8}>
              <Card title="Görsel" className="mb-6 border-2 border-gray-200 shadow-sm">
                <div className="space-y-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(image)}
                        alt={`Ürün görseli ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.svg';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                  <Upload
                    name="images"
                    listType="picture-card"
                    showUploadList={false}
                    disabled
                  >
                    <div>
                      <IconUpload size={20} />
                      <div style={{ marginTop: 8 }}>Görsel Ekle</div>
                    </div>
                  </Upload>
                  <p className="text-xs text-gray-500">
                    Görsel ekleme özelliği yakında eklenecek
                  </p>
                </div>
              </Card>

              <Card title="Ürün Bilgileri" className="border-2 border-gray-200 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oluşturulma:</span>
                    <span className="font-medium">
                      {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Güncellenme:</span>
                    <span className="font-medium">
                      {new Date(product.updatedAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Değerlendirme:</span>
                    <span className="font-medium">⭐ {product.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Görsel Sayısı:</span>
                    <span className="font-medium">{product.images.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Varyant Sayısı:</span>
                    <span className="font-medium">{product.variants.length}</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Form Actions */}
          <Divider />
          <div className="flex justify-end space-x-4">
            <Button
              onClick={handleCancel}
              size="large"
              icon={<IconX size={16} />}
            >
              İptal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<IconDeviceFloppy size={16} />}
              loading={loading}
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Güncelle
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
}
