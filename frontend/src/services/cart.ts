// Cart service - Sepet işlemleri için API çağrıları

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product?: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    category?: {
      name: string;
    };
  };
}

export interface AddToCartRequest {
  product: {
    productId: string;
    quantity: number;
  };
}

export interface UpdateCartRequest {
  productId: string;
  action: 'increment' | 'decrement';
}

export interface CartResponse {
  response: CartItem[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Sepete ürün ekle
export const addToCart = async (productId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/basket/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Cookie'leri gönder
      body: JSON.stringify({
        product: {
          productId,
          quantity
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Ürün sepete eklendi!'
      };
    } else {
      return {
        success: false,
        message: data.message || 'Ürün sepete eklenirken hata oluştu'
      };
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    return {
      success: false,
      message: 'Bağlantı hatası oluştu'
    };
  }
};

// Kullanıcının sepetini getir
export const getCart = async (): Promise<CartItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/basket/me`, {
      method: 'GET',
      credentials: 'include', // Cookie'leri gönder
    });

    if (response.ok) {
      const data: CartResponse = await response.json();
      return data.response || [];
    } else {
      console.error('Get cart error:', response.statusText);
      return [];
    }
  } catch (error) {
    console.error('Get cart error:', error);
    return [];
  }
};

// Sepetteki ürün miktarını güncelle
export const updateCartItem = async (productId: string, action: 'increment' | 'decrement'): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/basket/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Cookie'leri gönder
      body: JSON.stringify({
        productId,
        action
      })
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Sepet güncellendi!'
      };
    } else {
      return {
        success: false,
        message: data.message || 'Sepet güncellenirken hata oluştu'
      };
    }
  } catch (error) {
    console.error('Update cart error:', error);
    return {
      success: false,
      message: 'Bağlantı hatası oluştu'
    };
  }
};

// Sepeti tamamen temizle
export const clearCart = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/basket/me`, {
      method: 'DELETE',
      credentials: 'include', // Cookie'leri gönder
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Sepet temizlendi!'
      };
    } else {
      return {
        success: false,
        message: 'Sepet temizlenirken hata oluştu'
      };
    }
  } catch (error) {
    console.error('Clear cart error:', error);
    return {
      success: false,
      message: 'Bağlantı hatası oluştu'
    };
  }
};

// Sepetteki toplam ürün sayısını hesapla
export const getCartItemCount = async (): Promise<number> => {
  try {
    const cartItems = await getCart();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Get cart item count error:', error);
    return 0;
  }
};
