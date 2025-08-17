"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Dropdown, Avatar, Space } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, UserOutlined, LogoutOutlined, SettingOutlined, ShoppingOutlined, CrownOutlined, DownOutlined } from '@ant-design/icons';
import { checkAuth, logout, User } from '@/services/auth';
import { getActiveCategories, Category } from '@/services/category';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { cartItemCount } = useCart();
    const router = useRouter();

    // Auth durumunu ve kategorileri kontrol et
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Paralel olarak auth ve kategorileri çek
                const [authResult, categoriesResponse] = await Promise.all([
                    checkAuth(),
                    getActiveCategories()
                ]);

                if (authResult.isAuthenticated && authResult.user) {
                    setUser(authResult.user);
                }

                setCategories(categoriesResponse);
            } catch (error) {
                console.error('Data fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Logout işlemi
    const handleLogout = async () => {
        try {
            const success = await logout();
            if (success) {
                setUser(null);
                router.push('/');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Profil dropdown menü öğeleri
    const getProfileMenuItems = () => {
        const items = [
            {
                key: 'profile',
                label: (
                    <Link href="/profile" className="flex items-center space-x-2">
                        <UserOutlined />
                        <span>Profilim</span>
                    </Link>
                ),
            },
            {
                key: 'orders',
                label: (
                    <Link href="/orders" className="flex items-center space-x-2">
                        <ShoppingOutlined />
                        <span>Siparişlerim</span>
                    </Link>
                ),
            },
        ];

        // Admin ise Admin Paneli ekle
        if (user?.role === 'admin') {
            items.unshift({
                key: 'admin',
                label: (
                    <Link href="/admin" className="flex items-center space-x-2 text-blue-600">
                        <CrownOutlined />
                        <span>Admin Paneli</span>
                    </Link>
                ),
            });
        }

        // Çıkış Yap en sona ekle
        items.push({
            key: 'logout',
            label: (
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left text-red-600 hover:text-red-700"
                >
                    <LogoutOutlined />
                    <span>Çıkış Yap</span>
                </button>
            ),
        });

        return items;
    };

      // Kategoriler dropdown menü öğeleri
  const getCategoriesMenuItems = () => {
    const items = [
      {
        key: 'all',
        label: (
          <Link href="/products" className="flex items-center space-x-2 text-blue-600 font-medium">
            <ShoppingOutlined />
            <span>Tüm Ürünler</span>
          </Link>
        ),
      },
      {
        type: 'divider' as const,
      },
      ...categories.map(category => ({
        key: category._id,
        label: (
          <Link href={`/products?category=${category._id}`} className="flex items-center space-x-2">
            <ShoppingOutlined />
            <span>{category.name}</span>
          </Link>
        ),
      })),
    ];
    
    return items;
  };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ShopStack
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-3">
                            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                                Ana Sayfa
                            </Link>
                            <Dropdown
                                menu={{ items: getCategoriesMenuItems() }}
                                placement="bottom"
                                trigger={['hover']}
                                disabled={categories.length === 0}
                            >
                                <Button
                                    type="text"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1"
                                >
                                    <span>Kategoriler</span>
                                    <DownOutlined className="text-xs" />
                                </Button>
                            </Dropdown>
                            <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                                Hakkımızda
                            </Link>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <Button
                            type="text"
                            icon={<SearchOutlined />}
                            className="text-gray-600 hover:text-blue-600"
                        />

                        {/* Cart */}
                        <Link href="/cart">
                            <Button
                                type="text"
                                icon={<ShoppingCartOutlined />}
                                className="text-gray-600 hover:text-blue-600 relative"
                            >
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            </Button>
                        </Link>

                        {/* Auth Section */}
                        {!loading && (
                            <>
                                {user ? (
                                    // Giriş yapılmış - Profil Dropdown
                                    <Dropdown
                                        menu={{ items: getProfileMenuItems() }}
                                        placement="bottomRight"
                                        trigger={['click']}
                                    >
                                        <Button
                                            type="text"
                                            className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg"
                                        >
                                            <Avatar
                                                size={32}
                                                icon={<UserOutlined />}
                                                className="bg-blue-500"
                                            />
                                            <span className="text-gray-700 font-medium">
                                                {user.firstName} {user.lastName}
                                            </span>
                                            {user.role === 'admin' && (
                                                <CrownOutlined className="text-yellow-500 text-sm" />
                                            )}
                                        </Button>
                                    </Dropdown>
                                ) : (
                                    // Giriş yapılmamış - Auth Buttons
                                    <div className="flex items-center space-x-2">
                                        <Link href="/auth/login">
                                            <Button type="text" className="text-gray-600 hover:text-blue-600">
                                                Giriş Yap
                                            </Button>
                                        </Link>
                                        <Link href="/auth/register">
                                            <Button type="primary" className="bg-blue-600 hover:bg-blue-700">
                                                Kayıt Ol
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
