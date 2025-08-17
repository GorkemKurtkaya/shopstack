"use client";

import { useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { getAllOrders, getOrderIncome, Order } from '@/services/orders';
import { getAllProducts, Product } from '@/services/product';


const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

const formatDateForDisplay = (dateString: string): string => {
  if (!isValidDate(dateString)) {
    return 'Geçersiz Tarih';
  }
  try {
    return new Date(dateString).toLocaleDateString('tr-TR');
  } catch (error) {
    return 'Geçersiz Tarih';
  }
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [income, setIncome] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard verilerini yükle
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData, incomeData] = await Promise.all([
        getAllOrders(),
        getAllProducts(),
        getOrderIncome()
      ]);
      
      setOrders(ordersData);
      setProducts(productsData.items || productsData);
      setIncome(incomeData);
    } catch (error) {
      console.error('Dashboard veri yükleme hatası:', error);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // İstatistikler
  const stats = {
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    totalOrders: orders.length,
    activeOrders: orders.filter(order => 
      order.status === 'pending' || 
      order.status === 'processing' || 
      order.status === 'shipped'
    ).length
  };

  // Günlük gelir verisi (son 7 gün)
  const getDailyRevenue = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayOrders = orders.filter(order => 
        order.createdAt.startsWith(date)
      );
      const amount = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      return { day: date, amount };
    });
  };

  // Popüler ürünler (en çok sipariş edilen)
  const getPopularProducts = () => {
    const productOrderCount: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const productId = item.product;
        productOrderCount[productId] = (productOrderCount[productId] || 0) + item.quantity;
      });
    });

    return Object.entries(productOrderCount)
      .map(([productId, quantity]) => {
        const product = products.find(p => p._id === productId);
        return {
          id: productId,
          name: product?.name || 'Bilinmeyen Ürün',
          quantity
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  // Son siparişler
  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(order => ({
        id: order._id,
        customer_name: `Kullanıcı ${order.user.slice(-8)}`,
        total: order.totalAmount || 0,
        status: order.status,
        created_at: order.createdAt
      }));
  };

  useEffect(() => {
    let barChart: Chart | null = null;
    let doughnutChart: Chart | null = null;

    if (orders.length > 0 && products.length > 0) {
      const dailyRevenue = getDailyRevenue();
      const popularProducts = getPopularProducts();

      const barCtx = document.getElementById('barChart') as HTMLCanvasElement;
      if (barCtx) {
        barChart = new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: dailyRevenue.map(data => {
              try {
                return new Date(data.day).toLocaleDateString('tr-TR', { 
                  month: 'short', 
                  day: 'numeric' 
                });
              } catch (error) {
                return 'Geçersiz Tarih';
              }
            }),
            datasets: [{
              label: 'Günlük Gelir',
              data: dailyRevenue.map(data => data.amount),
              backgroundColor: '#6366F1',
              borderColor: '#6366F1',
              borderWidth: 1,
              borderRadius: 4,
              barThickness: 'flex',
              maxBarThickness: 20
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }

      const doughnutCtx = document.getElementById('doughnutChart') as HTMLCanvasElement;
      if (doughnutCtx) {
        doughnutChart = new Chart(doughnutCtx, {
          type: 'doughnut',
          data: {
            labels: popularProducts.map(product => product.name),
            datasets: [{
              data: popularProducts.map(product => product.quantity),
              backgroundColor: [
                '#6366F1',
                '#818CF8',
                '#A5B4FC',
                '#C7D2FE',
                '#E0E7FF'
              ],
              borderWidth: 1,
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 12,
                  padding: 15
                }
              }
            },
            cutout: '70%'
          }
        });
      }
    }

    return () => {
      if (barChart) {
        barChart.destroy();
      }
      if (doughnutChart) {
        doughnutChart.destroy();
      }
    };
  }, [orders, products]);

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Ödeme Bekliyor';
      case 'processing':
        return 'İşleniyor';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      case 'refunded':
        return 'İade Edildi';
      default:
        return 'Beklemede';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  const recentOrders = getRecentOrders();

  return (
    <div className="space-y-6 mt-10">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} TL</p>
              <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                +4.4%
              </span>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                +3.1%
              </span>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Toplam Ürün</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                +2.8%
              </span>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse-animation {
            0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          }
          .animate-continuous-pulse {
            animation: pulse-animation 2s infinite;
          }
        `}</style>
        <div className={`bg-white rounded-lg shadow-md p-4 ${stats.activeOrders > 0 ? 'border-2 border-red-500 animate-continuous-pulse' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Aktif Siparişler</p>
              <p className={`text-2xl font-bold ${stats.activeOrders > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.activeOrders}</p>
              <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                +3.1%
              </span>
            </div>
            <div className={`p-3 rounded-full ${stats.activeOrders > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${stats.activeOrders > 0 ? 'text-red-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 p-4 space-y-8 lg:gap-8 lg:space-y-0 lg:grid-cols-2">
        <div className="bg-white rounded-md shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-500">Günlük Gelir Grafiği</h4>
          </div>
          <div className="relative p-4 h-72">
            <canvas id="barChart"></canvas>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="text-lg font-semibold text-gray-500">Popüler Ürünler</h4>
          </div>
          <div className="relative p-4 h-72">
            <canvas id="doughnutChart"></canvas>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Son Siparişler</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total} TL</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForDisplay(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 