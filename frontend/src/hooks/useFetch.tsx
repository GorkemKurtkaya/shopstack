"use client";

import { useState, useEffect } from 'react';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  totalUsers: number;
}

interface MonthlyData {
  day: string;
  amount: number;
}

interface PopularProduct {
  name: string;
  quantity: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

interface DashboardData {
  stats: Stats;
  monthlyData: MonthlyData[];
  popularProducts: PopularProduct[];
  recentOrders: RecentOrder[];
}

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const formatDate = (dateString: string): string => {
  if (!isValidDate(dateString)) {
    return new Date().toISOString().split('T')[0];
  }
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export function useFetch() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalOrders: 0,
      totalRevenue: 0,
      activeOrders: 0,
      totalUsers: 0
    },
    monthlyData: [],
    popularProducts: [],
    recentOrders: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Siparişleri al
      const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/orders`, {
        credentials: 'include'
      });
      if (!ordersResponse.ok) {
        throw new Error('Siparişler yüklenirken bir hata oluştu');
      }
      const ordersData = await ordersResponse.json();

      // İstatistikleri hesapla
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + (order.paymentInfo?.totalAmount || 0), 0);
      const activeOrders = ordersData.filter((order: any) => order.paymentInfo?.status !== 'completed').length;
      
      // Kullanıcı sayısını şimdilik 0 olarak ayarla (API hazır olmadığı için)
      const totalUsers = 0;

      // Aylık verileri hesapla (güvenli tarih işleme ile)
      const dailyStats: { [key: string]: number } = {};
      ordersData.forEach((order: any) => {
        if (order.createdAt) {
          const day = formatDate(order.createdAt);
          if (!dailyStats[day]) {
            dailyStats[day] = 0;
          }
          dailyStats[day] += order.paymentInfo?.totalAmount || 0;
        }
      });

      const dailyDataArray = Object.entries(dailyStats)
        .map(([day, amount]) => ({
          day,
          amount
        }))
        .sort((a, b) => {
          const dateA = new Date(a.day);
          const dateB = new Date(b.day);
          return dateA.getTime() - dateB.getTime();
        });

      // Popüler ürünleri hesapla (orderItems'dan)
      const productStats: { [key: string]: number } = {};
      ordersData.forEach((order: any) => {
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach((item: any) => {
            if (item.product && item.quantity) {
              if (!productStats[item.product]) {
                productStats[item.product] = 0;
              }
              productStats[item.product] += item.quantity || 0;
            }
          });
        }
      });

      // Ürün detaylarını al (product/find endpoint'inden)
      const productDetails: { [key: string]: any } = {};
      for (const productId of Object.keys(productStats)) {
        try {
          const productResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/product/find/${productId}`, {
            credentials: 'include'
          });
          if (productResponse.ok) {
            const productData = await productResponse.json();
            productDetails[productId] = productData;
          }
        } catch (error) {
          console.warn(`Ürün ${productId} detayları alınamadı:`, error);
        }
      }

      const popularProductsArray = Object.entries(productStats)
        .map(([productId, quantity]) => ({
          name: productDetails[productId]?.name || `Ürün ${productId}`,
          quantity
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Son siparişleri hazırla (güvenli tarih işleme ile)
      const recentOrdersArray = ordersData
        .filter((order: any) => order.createdAt && isValidDate(order.createdAt))
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5)
        .map((order: any) => ({
          id: order._id,
          customer_name: `Müşteri #${order._id.slice(0, 6)}`,
          total: order.paymentInfo?.totalAmount || 0,
          status: order.paymentInfo?.status || 'pending',
          created_at: order.createdAt
        }));

      // Tüm verileri set et
      setData({
        stats: {
          totalOrders,
          totalRevenue,
          activeOrders,
          totalUsers
        },
        monthlyData: dailyDataArray,
        popularProducts: popularProductsArray,
        recentOrders: recentOrdersArray
      });

    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 30 saniyede bir verileri güncelle
    const interval = setInterval(fetchDashboardData, 3000000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}
