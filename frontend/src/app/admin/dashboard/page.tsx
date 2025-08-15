"use client";

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { useFetch } from '@/hooks/useFetch';

export default function DashboardPage() {
  const { data, loading, error } = useFetch();
  const { stats, monthlyData, popularProducts, recentOrders, activeUsers, activeUsersData } = data;

  useEffect(() => {
    let barChart: Chart | null = null;
    let doughnutChart: Chart | null = null;
    let activeUsersChart: Chart | null = null;

    if (monthlyData.length > 0 && popularProducts.length > 0) {
      const barCtx = document.getElementById('barChart') as HTMLCanvasElement;
      if (barCtx) {
        barChart = new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: monthlyData.map(data => new Date(data.day).toLocaleDateString('tr-TR')),
            datasets: [{
              label: 'Günlük Gelir',
              data: monthlyData.map(data => data.amount),
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

      const activeUsersCtx = document.getElementById('activeUsersChart') as HTMLCanvasElement;
      if (activeUsersCtx) {
        activeUsersChart = new Chart(activeUsersCtx, {
          type: 'line',
          data: {
            labels: Array(24).fill(0).map((_, i) => `${i}:00`),
            datasets: [{
              label: 'Aktif Kullanıcılar',
              data: activeUsersData,
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 0
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
    }

    return () => {
      if (barChart) {
        barChart.destroy();
      }
      if (doughnutChart) {
        doughnutChart.destroy();
      }
      if (activeUsersChart) {
        activeUsersChart.destroy();
      }
    };
  }, [monthlyData, popularProducts, activeUsersData]);

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Sipariş Alındı';
      case 'preparing':
        return 'Sipariş Hazırlanıyor';
      case 'on_delivery':
        return 'Sipariş Yola Çıktı';
      case 'completed':
        return 'Sipariş Tamamlandı';
      default:
        return 'Sipariş Alındı';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
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
              <p className="text-sm font-medium text-gray-500 uppercase">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <span className="inline-block px-2 py-1 mt-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                +2.6%
              </span>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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

      <div className="grid grid-cols-1 p-4 space-y-8 lg:gap-8 lg:space-y-0 lg:grid-cols-3">
        <div className="col-span-2 bg-white rounded-md shadow-lg">
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
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
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