// frontend/src/pages/SellerOrders.js
import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import SellerOrderUpdateForm from '../components/SellerOrderUpdateForm';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Status label mapping - Display labels without changing backend values
  const statusLabels = {
    PENDING: 'New Order',
    CONFIRMED: 'Confirmed',
    OUT_FOR_DELIVERY: 'Shipped',
    DELIVERED: 'Delivered',
  };

  // Get display label from backend status value
  const getStatusLabel = (status) => {
    return statusLabels[status] || status; // Fallback to original status if undefined
  };

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const fetchSellerOrders = async () => {
    try {
      const response = await orderAPI.getSellerOrdersAll();
      setOrders(response.data);
      setMessage('');
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setMessage('Failed to load orders');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setMessage(`Order status updated to ${getStatusLabel(newStatus)}`);
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update order status:', error);
      setMessage('Failed to update order status');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getNextStatusButton = (status) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Confirm Order', nextStatus: 'CONFIRMED', color: 'bg-purple-600 hover:bg-purple-700' };
      case 'CONFIRMED':
        return { label: 'Ship Order', nextStatus: 'OUT_FOR_DELIVERY', color: 'bg-yellow-600 hover:bg-yellow-700' };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Deliver Order', nextStatus: 'DELIVERED', color: 'bg-green-600 hover:bg-green-700' };
      default:
        return null;
    }
  };

  const handleStatusUpdated = (orderItemId, newStatus) => {
    setOrders(
      orders.map(order => ({
        ...order,
        status: newStatus,
      }))
    );
    setMessage('Order status updated successfully!');
    setMessageType('success');
    setTimeout(() => setMessage(''), 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return '📦';
      case 'CONFIRMED':
        return '✓';
      case 'OUT_FOR_DELIVERY':
        return '🚚';
      case 'DELIVERED':
        return '✅';
      default:
        return '•';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-purple-100 text-purple-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 Customer Orders</h1>
        <p className="text-gray-600">Manage and update order statuses</p>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg font-medium text-center ${
            messageType === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-xl text-gray-600">No orders yet</p>
          <p className="text-gray-500 mt-2">Customer orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Order Header - Clickable */}
              <div
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-pink-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Item #</p>
                    <p className="text-lg font-bold text-gray-800">#{order.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product</p>
                    <p className="font-semibold text-gray-800 truncate">{order.productName}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-800">{order.quantity}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="font-bold text-pink-600">₹{parseFloat(order.price).toFixed(2)}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                    </span>
                    {getNextStatusButton(order.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const buttonConfig = getNextStatusButton(order.status);
                          handleQuickStatusUpdate(order.id, buttonConfig.nextStatus);
                        }}
                        disabled={updatingOrderId === order.id}
                        className={`ml-2 px-3 py-1 rounded text-sm font-semibold text-white transition-colors ${
                          getNextStatusButton(order.status).color
                        } ${updatingOrderId === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {updatingOrderId === order.id ? '⏳ Updating...' : getNextStatusButton(order.status).label}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Details Section */}
              {expandedOrderId === order.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-lg font-bold text-gray-800">Product Details</h3>

                      <div className="bg-white rounded-lg p-4 border border-gray-200 flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={order.imageUrl || 'https://via.placeholder.com/96x96?text=No+Image'}
                            alt={order.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{order.productName}</h4>
                          <p className="text-sm text-gray-600">Category: {order.category}</p>
                          <div className="mt-3 space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-600">Quantity:</span>{' '}
                              <span className="font-bold">{order.quantity}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Unit Price:</span>{' '}
                              <span className="font-bold">₹{parseFloat(order.price).toFixed(2)}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Order Date:</span>{' '}
                              <span className="font-bold">
                                {new Date(order.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Update Form */}
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">Update Delivery</h3>
                      <SellerOrderUpdateForm
                        orderItem={order}
                        onStatusUpdated={handleStatusUpdated}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Collapse Indicator */}
              {expandedOrderId !== order.id && (
                <div className="px-6 py-2 bg-gray-50 text-right border-t border-gray-100">
                  <p className="text-sm text-gray-600">Click to expand ▼</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {orders.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-6 border border-pink-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Order Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-pink-600">{orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{getStatusLabel('PENDING')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'PENDING').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{getStatusLabel('CONFIRMED')}</p>
              <p className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.status === 'CONFIRMED').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{getStatusLabel('OUT_FOR_DELIVERY')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{getStatusLabel('DELIVERED')}</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'DELIVERED').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

