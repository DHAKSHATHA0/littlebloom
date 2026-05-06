import React, { createContext, useState, useEffect, useContext } from 'react';
import { orderAPI } from '../services/api';
import { AuthContext } from './AuthContext';

export const OrderNotificationContext = createContext();

export const OrderNotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [lastViewedTime, setLastViewedTime] = useState(null);

  const fetchOrderCounts = async () => {
    if (!user) return;

    try {
      if (user.role === 'SELLER') {
        const response = await orderAPI.getSellerOrdersAll();
        const orders = response.data;
        const lastViewed = localStorage.getItem(`seller_orders_viewed_${user.id}`);
        
        if (lastViewed) {
          const viewedTime = new Date(lastViewed);
          const newOrders = orders.filter(order => 
            order.status === 'PENDING' && 
            new Date(order.createdAt) > viewedTime
          );
          setNewOrderCount(newOrders.length);
        } else {
          const pendingCount = orders.filter(order => order.status === 'PENDING').length;
          setNewOrderCount(pendingCount);
        }
      } else {
        const response = await orderAPI.getBuyerOrdersAll();
        const orders = response.data;
        const lastViewed = localStorage.getItem(`buyer_orders_viewed_${user.id}`);
        
        if (lastViewed) {
          const viewedTime = new Date(lastViewed);
          // Check for any order status updates since last viewed
          const hasNewActivity = orders.some(order => {
            const orderUpdated = new Date(order.updatedAt || order.createdAt);
            // Show notification for status changes: CONFIRMED, OUT_FOR_DELIVERY, DELIVERED
            const hasStatusUpdate = ['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status);
            return orderUpdated > viewedTime && hasStatusUpdate;
          });
          setHasNewOrders(hasNewActivity);
        } else {
          // First time - show notification if there are any non-pending orders
          const hasActiveOrders = orders.some(order => 
            ['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
          );
          setHasNewOrders(hasActiveOrders);
        }
      }
    } catch (error) {
      console.error('Failed to fetch order counts:', error);
    }
  };

  const markOrdersAsViewed = () => {
    if (!user) return;
    
    const currentTime = new Date().toISOString();
    const storageKey = user.role === 'SELLER' 
      ? `seller_orders_viewed_${user.id}` 
      : `buyer_orders_viewed_${user.id}`;
    
    localStorage.setItem(storageKey, currentTime);
    setLastViewedTime(currentTime);
    
    // Clear notifications immediately
    if (user.role === 'SELLER') {
      setNewOrderCount(0);
    } else {
      setHasNewOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrderCounts();
      const interval = setInterval(fetchOrderCounts, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, lastViewedTime]);

  return (
    <OrderNotificationContext.Provider value={{ 
      newOrderCount, 
      hasNewOrders, 
      refreshOrderCounts: fetchOrderCounts,
      markOrdersAsViewed
    }}>
      {children}
    </OrderNotificationContext.Provider>
  );
};