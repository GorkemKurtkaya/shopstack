const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Category {
  _id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateCategoryData {
  name: string;
  active: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

// Tüm kategorileri getir
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${BASE_URL}/categories`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Kategoriler yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kategoriler getirme hatası:', error);
    throw error;
  }
};

// Sadece aktif kategorileri getir (public)
export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${BASE_URL}/categories/active`);
    
    if (!response.ok) {
      throw new Error('Aktif kategoriler yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Aktif kategoriler getirme hatası:', error);
    throw error;
  }
};

// Tek kategori getir
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await fetch(`${BASE_URL}/categories/${id}`);
    
    if (!response.ok) {
      throw new Error('Kategori yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    throw error;
  }
};

// Yeni kategori oluştur
export const createCategory = async (categoryData: CreateCategoryData): Promise<Category> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(categoryData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kategori oluşturulurken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
    throw error;
  }
};

// Kategori güncelle
export const updateCategory = async (id: string, categoryData: UpdateCategoryData): Promise<Category> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(categoryData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kategori güncellenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    throw error;
  }
};

// Kategori sil
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kategori silinirken bir hata oluştu');
    }
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    throw error;
  }
};

// Kategori durumunu güncelle (active)
export const updateCategoryStatus = async (id: string, active: boolean): Promise<Category> => {
  try {
    const response = await fetch(`${BASE_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ active })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kategori durumu güncellenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kategori durumu güncelleme hatası:', error);
    throw error;
  }
};
