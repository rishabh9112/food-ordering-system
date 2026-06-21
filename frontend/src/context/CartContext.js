import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    if (user && user.role === 'CUSTOMER') {
      try {
        const { data } = await api.get('/cart');
        const count = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }
  };

  useEffect(() => {
    fetchCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateCartCount = (count) => {
    setCartCount(count);
  };

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
