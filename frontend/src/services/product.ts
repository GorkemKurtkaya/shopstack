const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-image.svg';
  

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  

  if (imagePath.startsWith('/uploads/')) {
    return `${BASE_URL}${imagePath}`;
  }
  

  if (imagePath.startsWith('uploads/')) {
    return `${BASE_URL}/${imagePath}`;
  }
  

  return '/placeholder-image.svg';
};

export interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  category: string | {
    _id: string;
    name: string;
    slug: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };
  price: number;
  stock: number;
  specifications: Record<string, any>;
  tags: string[];
  featured: boolean;
  variants: Array<{
    size?: string;
    color?: string;
    additionalPrice: number;
    _id?: string;
  }>;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  images: (string | File)[];
  category: string;
  price: number;
  stock: number;
  specifications: Record<string, any>;
  tags: string[];
  featured: boolean;
  variants: Array<{
    size?: string;
    color?: string;
    additionalPrice: number;
  }>;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

// API response interface'i für paginated results
export interface PaginatedProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Öne çıkan ürünleri getir
export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${BASE_URL}/product/featured`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Öne çıkan ürünler yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Featured products getirme hatası:', error);
    throw error;
  }
};

// Tüm ürünleri getir
export const getAllProducts = async (): Promise<PaginatedProductsResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/product`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Ürünler yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ürünler getirme hatası:', error);
    throw error;
  }
};

// Tek ürün getir
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await fetch(`${BASE_URL}/product/find/${id}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Ürün yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ürün getirme hatası:', error);
    throw error;
  }
};

// Yeni ürün oluştur
export const createProduct = async (productData: CreateProductData): Promise<Product> => {
  try {
    const formData = new FormData();
    
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('category', productData.category);
    formData.append('price', productData.price.toString());
    formData.append('stock', productData.stock.toString());
    formData.append('tags', JSON.stringify(productData.tags));
    formData.append('featured', productData.featured.toString());
    formData.append('specifications', JSON.stringify(productData.specifications));
    formData.append('variants', JSON.stringify(productData.variants));
    
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('images', image);
        } else if (typeof image === 'string') {
          formData.append('imagePaths', image);
        }
      });
    }
    
    const response = await fetch(`${BASE_URL}/product/admin/products`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ürün oluşturulurken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ürün oluşturma hatası:', error);
    throw error;
  }
};

// Ürün güncelle
export const updateProduct = async (id: string, productData: UpdateProductData): Promise<Product> => {
  try {
    const response = await fetch(`${BASE_URL}/product/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ürün güncellenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    throw error;
  }
};

// Ürün güncelle (FormData ile - görsel ekle/sil)
export const updateProductWithForm = async (
  id: string,
  productData: UpdateProductData & { removeImages?: string[]; newImages?: File[] }
): Promise<Product> => {
  try {
    const formData = new FormData();

    if (productData.name !== undefined) formData.append('name', String(productData.name));
    if (productData.description !== undefined) formData.append('description', String(productData.description));
    if (productData.category !== undefined) formData.append('category', String(productData.category));
    if (productData.price !== undefined) formData.append('price', String(productData.price));
    if (productData.stock !== undefined) formData.append('stock', String(productData.stock));
    if (productData.featured !== undefined) formData.append('featured', String(productData.featured));

    if (productData.tags !== undefined) {
      const tagsValue = Array.isArray(productData.tags) ? productData.tags.join(',') : String(productData.tags as any);
      formData.append('tags', tagsValue);
    }

    if (productData.specifications !== undefined) {
      formData.append('specifications', JSON.stringify(productData.specifications));
    }

    if (productData.variants !== undefined) {
      formData.append('variants', JSON.stringify(productData.variants));
    }

    if (productData.removeImages && productData.removeImages.length > 0) {
      formData.append('removeImages', productData.removeImages.join(','));
    }

    if (productData.newImages && productData.newImages.length > 0) {
      productData.newImages.forEach((file) => formData.append('images', file));
    }

    const response = await fetch(`${BASE_URL}/product/admin/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ürün güncellenirken bir hata oluştu');
    }

    return await response.json();
  } catch (error) {
    console.error('Ürün güncelleme (form) hatası:', error);
    throw error;
  }
};

// Ürün sil
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/product/admin/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ürün silinirken bir hata oluştu');
    }
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    throw error;
  }
};

// Ürün durumunu güncelle (featured, stock, etc.)
export const updateProductStatus = async (id: string, updates: Partial<Product>): Promise<Product> => {
  try {
    const response = await fetch(`${BASE_URL}/product/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ürün durumu güncellenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ürün durumu güncelleme hatası:', error);
    throw error;
  }
};
