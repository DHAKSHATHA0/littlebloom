// frontend/src/pages/NotificationsPage.js
import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import Loading from '../components/Loading';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unread'); // 'all' or 'unread'
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [unreadRes, allRes] = await Promise.all([
        notificationAPI.getUnreadNotifications(),
        notificationAPI.getNotifications()
      ]);
      setNotifications(unreadRes.data || []);
      setAllNotifications(allRes.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_PLACED':
        return '📦';
      case 'ORDER_SHIPPED':
        return '🚚';
      case 'ORDER_DELIVERED':
        return '✅';
      case 'REVIEW_ADDED':
        return '⭐';
      case 'PRODUCT_SOLD':
        return '💰';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ORDER_PLACED':
        return 'border-l-4 border-blue-500';
      case 'ORDER_SHIPPED':
        return 'border-l-4 border-orange-500';
      case 'ORDER_DELIVERED':
        return 'border-l-4 border-green-500';
      case 'REVIEW_ADDED':
        return 'border-l-4 border-yellow-500';
      case 'PRODUCT_SOLD':
        return 'border-l-4 border-pink-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  if (loading) {
    return null;
  }

  const displayNotifications = filter === 'unread' ? notifications : allNotifications;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📢 Notifications</h1>
        <p className="text-gray-600">
          {filter === 'unread' 
            ? `${notifications.length} unread notification${notifications.length !== 1 ? 's' : ''}`
            : `${allNotifications.length} total notification${allNotifications.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('unread')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Unread ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All ({allNotifications.length})
        </button>
      </div>

      {/* Notifications List */}
      {displayNotifications.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {displayNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => setSelectedNotif(notif.id === selectedNotif ? null : notif.id)}
              className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer ${
                getNotificationColor(notif.type)
              } ${notif.isRead ? 'bg-gray-50' : 'bg-white border-2 border-pink-100'}`}
            >
              <div className="flex gap-4">
                <span className="text-4xl">{getNotificationIcon(notif.type)}</span>
                <div className="flex-1">
                  <p className="text-lg text-gray-800 font-semibold">{notif.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 capitalize">
                    {notif.type.replace(/_/g, ' ')} {notif.isRead && '• Read'}
                  </p>
                  
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>

                {notif.senderName && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">From:</p>
                    <p className="font-medium text-gray-800">{notif.senderName}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-2xl text-gray-600 mb-2">
            {filter === 'unread' ? '🎉 All caught up!' : '📭 No notifications yet'}
          </p>
          <p className="text-gray-500">
            {filter === 'unread' 
              ? 'You have no unread notifications'
              : 'You will see your notifications here'
            }
          </p>
        </div>
      )}
    </div>
  );
}
