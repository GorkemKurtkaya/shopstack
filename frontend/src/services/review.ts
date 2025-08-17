const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

// Tüm yorumları getir (admin panel için)
export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/all`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Yorumlar yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Yorumlar getirme hatası:', error);
    throw error;
  }
};

// Ürün yorumlarını getir
export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/${productId}`);
    
    if (!response.ok) {
      throw new Error('Ürün yorumları yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ürün yorumları getirme hatası:', error);
    throw error;
  }
};

// Yorum oluştur (kullanıcı için)
export const createReview = async (reviewData: CreateReviewData): Promise<Review> => {
  try {
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorum oluşturulurken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Yorum oluşturma hatası:', error);
    throw error;
  }
};

// Yorum güncelle (kullanıcı için)
export const updateReview = async (reviewId: string, reviewData: UpdateReviewData): Promise<Review> => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(reviewData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorum güncellenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Yorum güncelleme hatası:', error);
    throw error;
  }
};

// Yorum sil (kullanıcı için)
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorum silinirken bir hata oluştu');
    }
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    throw error;
  }
};

// Kullanıcının belirli bir ürün için yorum yapıp yapmadığını kontrol et
export const checkUserReview = async (productId: string): Promise<Review | null> => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/user/${productId}`, {
      credentials: 'include'
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Yorum kontrolü yapılırken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Yorum kontrol hatası:', error);
    return null;
  }
};

// Yorum onayla (admin için)
export const approveReview = async (reviewId: string, approved: boolean = true): Promise<Review> => {
  try {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ approved })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorum onaylanırken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Yorum onaylama hatası:', error);
    throw error;
  }
};


