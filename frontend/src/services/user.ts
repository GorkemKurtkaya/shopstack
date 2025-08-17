const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'customer' | 'moderator';
  phoneNumber: string;
  addresses: Array<{
    _id: string;
    title: string;
    address: string;
    city: string;
    country: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  favoriteCategories: string[];
  emailVerificationToken: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: 'admin' | 'customer' | 'moderator';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: 'admin' | 'customer' | 'moderator';
  emailVerified?: boolean;
}

// Tüm kullanıcıları getir (admin panel için)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Kullanıcılar yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kullanıcılar getirme hatası:', error);
    throw error;
  }
};

// Tek kullanıcı getir
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Kullanıcı yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    throw error;
  }
};

// Kullanıcı güncelle
export const updateUser = async (userId: string, userData: UpdateUserData): Promise<User> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kullanıcı güncellenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    throw error;
  }
};

// Kullanıcı sil
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Kullanıcı silinirken bir hata oluştu');
    }
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    throw error;
  }
};
