"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AdminContextValue {
  isAdmin: boolean;
  isLoading: boolean;
  checkAdminAccess: () => Promise<boolean>;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminAccess = async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check-admin`, {
        withCredentials: true
      });

      if (!response.data.isAdmin) {
        router.push('/auth/login?message=Lütfen admin hesabıyla giriş yapınız');
        setIsAdmin(false);
        return false;
      }
      setIsAdmin(true);
      return true;
    } catch (error) {
      console.error('Admin kontrolü sırasında hata:', error);
      router.push('/auth/login?message=Lütfen giriş yapınız');
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    const initialCheck = async () => {
      await checkAdminAccess();
      setIsLoading(false);
    };

    initialCheck();

    const intervalId = setInterval(async () => {
      const isValid = await checkAdminAccess();
      if (!isValid) {
        clearInterval(intervalId);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [router]);

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, checkAdminAccess }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
} 