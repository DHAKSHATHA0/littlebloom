// frontend/src/context/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartAPI } from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart when user logs in
  useEffect(() => {
    if (token && user) {
      fetchCart();
    } else {
      setCart(null);
      setCartCount(0);
      setError(null);
    }
  }, [token, user]);

  const fetchCart = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
      setCartCount(response.data.items ? response.data.items.length : 0);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart({ items: [], totalPrice: 0 });
      setCartCount(0);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      setError('Please login to add items to cart');
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const response = await cartAPI.addToCart({ productId, quantity });
      setCart(response.data);
      setCartCount(response.data.items ? response.data.items.length : 0);
      setError(null);
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      console.error('Add to cart error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return { success: false };
    
    try {
      const response = await cartAPI.removeFromCart(productId);
      setCart(response.data);
      setCartCount(response.data.items ? response.data.items.length : 0);
      setError(null);
      return { success: true };
    } catch (error) {
      setError('Failed to remove item from cart');
      console.error('Remove from cart error:', error);
      return { success: false };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) return { success: false };
    
    try {
      const response = await cartAPI.updateCartQuantity(productId, quantity);
      setCart(response.data);
      setError(null);
      return { success: true };
    } catch (error) {
      setError('Failed to update quantity');
      console.error('Update quantity error:', error);
      return { success: false };
    }
  };

  const clearCart = async () => {
    if (!token) return { success: false };
    
    try {
      await cartAPI.clearCart();
      setCart({ items: [], totalPrice: 0 });
      setCartCount(0);
      setError(null);
      return { success: true };
    } catch (error) {
      setError('Failed to clear cart');
      console.error('Clear cart error:', error);
      return { success: false };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: cart || { items: [], totalPrice: 0 },
        cartCount,
        loading,
        error,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
