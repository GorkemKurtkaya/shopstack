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
  activeUsers: number;
  activeUsersData: number[];
}

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
    recentOrders: [],
    activeUsers: 0,
    activeUsersData: []
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

      // Kullanıcıları al
      const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
        credentials: 'include'
      });
      if (!usersResponse.ok) {
        throw new Error('Kullanıcılar yüklenirken bir hata oluştu');
      }
      const usersData = await usersResponse.json();

      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const activeUsersCount = usersData.filter((user: any) => {
        const lastActivity = new Date(user.last_activity || 0);
        return lastActivity > fiveMinutesAgo;
      }).length;


      const hourlyData = Array(24).fill(0);
      usersData.forEach((user: any) => {
        if (user.last_activity) {
          const activityTime = new Date(user.last_activity);
          const hour = activityTime.getHours();
          hourlyData[hour]++;
        }
      });

      // İstatistikleri hesapla
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + order.amount, 0);
      const activeOrders = ordersData.filter((order: any) => order.status !== 'completed').length;
      const totalUsers = usersData.length;

      // Aylık verileri hesapla
      const dailyStats: { [key: string]: number } = {};
      ordersData.forEach((order: any) => {
        const date = new Date(order.created_at);
        const day = date.toISOString().split('T')[0];
        if (!dailyStats[day]) {
          dailyStats[day] = 0;
        }
        dailyStats[day] += order.amount;
      });

      const dailyDataArray = Object.entries(dailyStats)
        .map(([day, amount]) => ({
          day,
          amount
        }))
        .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

      // Popüler ürünleri hesapla
      const productStats: { [key: string]: number } = {};
      ordersData.forEach((order: any) => {
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach((product: any) => {
            if (!productStats[product.product_id]) {
              productStats[product.product_id] = 0;
            }
            productStats[product.product_id] += product.quantity;
          });
        }
      });

      // Ürün detaylarını al
      const productDetails: { [key: string]: any } = {};
      for (const productId of Object.keys(productStats)) {
        const productResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/products/${productId}`, {
          credentials: 'include'
        });
        if (productResponse.ok) {
          const productData = await productResponse.json();
          productDetails[productId] = productData;
        }
      }

      const popularProductsArray = Object.entries(productStats)
        .map(([productId, quantity]) => ({
          name: productDetails[productId]?.title || `Ürün ${productId}`,
          quantity
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Son siparişleri hazırla
      const ordersWithUsers = await Promise.all(
        ordersData
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(async (order: any) => {
            const user = usersData.find((u: any) => u.id === order.user_id);
            return {
              id: order.id,
              customer_name: user ? user.name : 'Bilinmeyen Kullanıcı',
              total: order.amount,
              status: order.status,
              created_at: order.created_at
            };
          })
      );

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
        recentOrders: ordersWithUsers,
        activeUsers: activeUsersCount,
        activeUsersData: hourlyData
      });

    } catch (err: any) {
      setError(err.message || 'Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

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
