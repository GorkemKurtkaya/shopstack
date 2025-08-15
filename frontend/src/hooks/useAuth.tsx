"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  addresses: Address[];
  favoriteCategories: string[];
}

interface BackendError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

interface BackendResponse {
  succeeded: boolean;
  errors?: BackendError[];
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/check-auth`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Role'e göre yönlendirme
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/shop');
        }
        
        return { success: true };
      } else {
        const errorData: BackendResponse = await response.json();
        
        if (errorData.errors && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          return { 
            success: false, 
            message: firstError.msg || 'Giriş başarısız' 
          };
        }
        
        return { 
          success: false, 
          message: errorData.message || 'Giriş başarısız' 
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: 'Bağlantı hatası oluştu' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        setUser(responseData.user);
        
        router.push('/shop');
        return { success: true };
      } else {
        const errorData: BackendResponse = await response.json();
        
        if (errorData.errors && errorData.errors.length > 0) {
          const firstError = errorData.errors[0];
          return { 
            success: false, 
            message: firstError.msg || 'Kayıt başarısız' 
          };
        }
        
        return { 
          success: false, 
          message: errorData.message || 'Kayıt başarısız' 
        };
      }
    } catch (error) {
      console.error('Register failed:', error);
      return { 
        success: false, 
        message: 'Bağlantı hatası oluştu' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
