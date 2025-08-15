"use client";

import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    IconFileDescription,
    IconLayoutDashboard,
    IconShoppingCart,
    IconUsers,
    IconHome,
    IconX,
    IconLogout,
    IconTopologyStar,
    IconChevronDown
} from '@tabler/icons-react';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar = memo(({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                router.push('/auth/login');
            } else {
                alert('Çıkış yapılırken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Çıkış hatası:', error);
            alert('Çıkış yapılırken bir hata oluştu!');
        }
    }, [router]);

    const handleSidebarClose = useCallback(() => {
        setIsSidebarOpen(false);
    }, [setIsSidebarOpen]);

    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prev => !prev);
    }, []);

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/admin/dashboard',
            icon: <IconLayoutDashboard className="w-6 h-6" />
        },
        {
            name: 'Ürünler',
            path: '/admin/products',
            icon: <IconTopologyStar className="w-6 h-6" />
        },
        {
            name: 'Siparişler',
            path: '/admin/orders',
            icon: <IconShoppingCart className="w-6 h-6" />
        },
        {
            name: "Kategoriler",
            path: "/admin/categories",
            icon: <IconFileDescription className="w-6 h-6" />
        },
        {
            name: "Yorumlar",
            path: "/admin/reviews",
            icon: <IconFileDescription className="w-6 h-6" />
        },
        {
            name: 'Kullanıcılar',
            path: '/admin/users',
            icon: <IconUsers className="w-6 h-6" />
        },
        {
            name: "Ana Sayfa",
            path: "/shop",
            icon: <IconHome className="w-6 h-6" />
        }
    ];

    return (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-100 transform transition-transform duration-150 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Admin Panel</h1>
                    <button
                        onClick={handleSidebarClose}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors duration-100"
                    >
                        <IconX className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-3 pt-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-100 ${pathname === item.path
                                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className={`mr-3 ${pathname === item.path ? 'text-white' : 'text-gray-400'}`}>{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-100"
                        >
                            <div className="flex-1 text-left">
                                <div className="text-sm font-semibold text-gray-700">Admin Kullanıcı</div>
                                <div className="text-xs text-gray-500">admin@example.com</div>
                            </div>
                            <IconChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-100 flex items-center space-x-2"
                                >
                                    <IconLogout className="w-4 h-4" />
                                    <span>Çıkış Yap</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
