const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface OrderItem {
  _id?: string;
  product: string;
  quantity: number;
  price: number;
  variant?: {
    _id?: string;
    size?: string;
    color?: string;
  };
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  method: 'card' | 'cash' | 'bank_transfer';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateOrderData {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
}

export interface UpdateOrderData {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentInfo?: Partial<PaymentInfo>;
}

export interface OrderIncome {
  total: number;
  count: number;
  monthly: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

// Tüm siparişleri getir (admin panel için)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${BASE_URL}/orders`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Siparişler yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Siparişler getirme hatası:', error);
    throw error;
  }
};

// Sipariş gelir istatistiklerini getir (admin panel için)
export const getOrderIncome = async (): Promise<OrderIncome> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/income`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Gelir istatistikleri yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Gelir istatistikleri getirme hatası:', error);
    // Hata durumunda boş veri döndür
    return {
      total: 0,
      count: 0,
      monthly: []
    };
  }
};

// Tek sipariş getir
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/findorder/${orderId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Sipariş yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sipariş getirme hatası:', error);
    throw error;
  }
};

// Kullanıcının siparişlerini getir
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/find/${userId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Kullanıcı siparişleri yüklenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı siparişleri getirme hatası:', error);
    throw error;
  }
};

// Yeni sipariş oluştur
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sipariş oluşturulurken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    throw error;
  }
};

// Sipariş güncelle (admin için)
export const updateOrder = async (orderId: string, orderData: UpdateOrderData): Promise<Order> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sipariş güncellenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sipariş güncelleme hatası:', error);
    throw error;
  }
};

// Sipariş durumunu güncelle (admin için)
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/status/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sipariş durumu güncellenirken bir hata oluştu');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Sipariş durumu güncelleme hatası:', error);
    throw error;
  }
};

// Sipariş sil (admin için)
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sipariş silinirken bir hata oluştu');
    }
  } catch (error) {
    console.error('Sipariş silme hatası:', error);
    throw error;
  }
};
