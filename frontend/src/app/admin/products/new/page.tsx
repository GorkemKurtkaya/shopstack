"use client";

import React, { useState, useEffect } from 'react';
import { 
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
  Card,
  Alert
} from 'antd';
import { 
  IconPlus, 
  IconMinus, 
  IconUpload,
  IconDeviceFloppy,
  IconX,
  IconArrowLeft
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { createProduct, CreateProductData } from '@/services/product';
import { getAllCategories } from '@/services/category';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function NewProductPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageList, setImageList] = useState<any[]>([]);
  const router = useRouter();

  // Kategorileri yükle
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
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

      // Resim dosyalarını al
      const images = imageList.map(file => {
        if (file.originFileObj) {
          // Yeni yüklenen dosya
          return file.originFileObj;
        } else if (file.url) {
          // Mevcut dosya - sadece dosya adını al
          const fileName = file.url.split('/').pop();
          return fileName || file.url;
        }
        return file.name || file;
      }).filter(Boolean); // Boş değerleri filtrele

      const productData: CreateProductData = {
        name: values.name,
        description: values.description,
        category: values.category,
        price: values.price,
        stock: values.stock,
        tags,
        featured: values.featured,
        specifications,
        variants,
        images: images
      };

      await createProduct(productData);
      message.success('Ürün başarıyla oluşturuldu');
      router.push('/admin/products');
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error);
      message.error('Ürün oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Resim yükleme işlemi
  const handleImageUpload = (info: any) => {
    let fileList = [...info.fileList];
    
    // Sadece son 5 resmi kabul et
    fileList = fileList.slice(-5);
    
    setImageList(fileList);
  };

  // Resim kaldırma
  const handleImageRemove = (file: any) => {
    const newList = imageList.filter(item => item.uid !== file.uid);
    setImageList(newList);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          icon={<IconArrowLeft size={20} />}
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          Geri
        </Button>
        <Title level={2} className="mb-0">Yeni Ürün Ekle</Title>
      </div>

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
                    <Select
                      placeholder="Kategori seçin"
                      className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                      size="large"
                    >
                      {categories.map(cat => (
                        <Option key={cat._id} value={cat._id}>
                          {cat.name}
                        </Option>
                      ))}
                    </Select>
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
                      className="border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                      size="large"
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

          {/* Sağ Kolon - Görsel */}
          <Col span={8}>
            <Card title="Ürün Görselleri" className="border-2 border-gray-200 shadow-sm">
              <div className="space-y-4">
                <Alert
                  message="Görsel Yükleme"
                  description="Birden fazla görsel seçebilirsiniz. Maksimum 5 görsel yükleyebilirsiniz."
                  type="info"
                  showIcon
                  className="mb-4"
                />
                
                <Upload
                  name="images"
                  listType="picture-card"
                  fileList={imageList}
                  onChange={handleImageUpload}
                  onRemove={handleImageRemove}
                  multiple
                  accept="image/*"
                  beforeUpload={() => false} // Otomatik yüklemeyi engelle
                  maxCount={5}
                >
                  {imageList.length < 5 && (
                    <div>
                      <IconUpload size={20} />
                      <div style={{ marginTop: 8 }}>Görsel Ekle</div>
                    </div>
                  )}
                </Upload>
                
                <p className="text-xs text-gray-500">
                  Desteklenen formatlar: JPG, PNG, GIF. Maksimum boyut: 5MB
                </p>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Form Actions */}
        <Divider />
        <div className="flex justify-end space-x-4">
          <Button
            onClick={() => router.back()}
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
            Ürün Oluştur
          </Button>
        </div>
      </Form>
    </div>
  );
}
