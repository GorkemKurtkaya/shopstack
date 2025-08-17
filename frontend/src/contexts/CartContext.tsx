"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCartItemCount } from '@/services/cart';
import { checkAuth } from '@/services/auth';

interface CartContextType {
  cartItemCount: number;
  updateCartCount: () => Promise<void>;
  incrementCartCount: (amount?: number) => void;
  decrementCartCount: (amount?: number) => void;
  isAuthenticated: boolean;
  checkAuthentication: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const updateCartCount = async () => {
    try {
      const count = await getCartItemCount();
      setCartItemCount(count);
    } catch (error) {
      console.error('Cart count update error:', error);
    }
  };


  const incrementCartCount = (amount: number = 1) => {
    setCartItemCount(prev => prev + amount);
  };


  const decrementCartCount = (amount: number = 1) => {
    setCartItemCount(prev => Math.max(0, prev - amount));
  };


  const checkAuthentication = async (): Promise<boolean> => {
    try {
      const authResult = await checkAuth();
      setIsAuthenticated(authResult.isAuthenticated);
      return authResult.isAuthenticated;
    } catch (error) {
      console.error('Authentication check error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkAuthentication();
      if (isAuthenticated) {
        await updateCartCount();
      }
    };
    initialize();
  }, []);

  const value = {
    cartItemCount,
    updateCartCount,
    incrementCartCount,
    decrementCartCount,
    isAuthenticated,
    checkAuthentication,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
