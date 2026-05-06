// frontend/src/pages/OrderDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import OrderTrackingTimeline from '../components/OrderTrackingTimeline';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const statusLabels = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
  };

  const getStatusLabel = (status) => {
    return statusLabels[status] || status; // Fallback to original status if undefined
  };

  useEffect(() => {
    // Initial fetch on component mount
    fetchOrderDetails();

    // Set up auto-refresh interval (every 20 seconds for faster updates on detail page)
    const refreshInterval = setInterval(() => {
      fetchOrderDetails(false); // Silent refresh without loading spinner
    }, 20000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [id]);

  const fetchOrderDetails = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await orderAPI.getOrderById(id);
      setOrder(response.data);
      setError('');
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setRefreshing(false);
      if (showLoader) setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-red-800">{error || 'Order not found'}</p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="text-pink-600 font-semibold hover:underline"
        >
          ← Back to Orders
        </button>
      </div>
    );
  }

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
        return 'bg-blue-100 text-blue-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="text-pink-600 font-semibold hover:underline mb-4 flex items-center gap-2"
        >
          ← Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Details</h1>
            <p className="text-gray-600">Order #{order.id}</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdated}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusIcon(order.status)} {getStatusLabel(order.status)}
            </span>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className={`px-3 py-2 rounded-lg font-semibold text-white transition-colors ${
                refreshing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
              title="Refresh order details"
            >
              {refreshing ? '⏳' : '🔄'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tracking Timeline */}
          <OrderTrackingTimeline status={order.status} isSeller={false} />

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/96x96?text=No+Image'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{item.productName}</h3>
                        <p className="text-sm text-gray-600 mb-2">Category: {item.category}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">
                              Quantity: <span className="font-semibold">{item.quantity}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: <span className="font-semibold">₹{parseFloat(item.price).toFixed(2)}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Item Total</p>
                            <p className="text-xl font-bold text-pink-600">
                              ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No items in this order</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 h-fit space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>

            {/* Order Info */}
            <div className="space-y-4 pb-6 border-b">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-xl font-bold text-gray-800">#{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Time</p>
                <p className="font-semibold text-gray-800">
                  {new Date(order.createdAt).toLocaleTimeString('en-IN')}
                </p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-3 pb-6 border-b">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold">₹{order.totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping:</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-pink-600">₹{order.totalPrice}</span>
              </div>
            </div>

            {/* Items Count */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Items Ordered</p>
              <p className="text-3xl font-bold text-gray-800">{order.items?.length || 0}</p>
            </div>

            {/* Status */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-2 font-semibold">Current Status</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getStatusIcon(order.status)}</span>
                <p className="text-lg font-bold text-blue-900">{order.status}</p>
              </div>
            </div>

            {/* Help */}
            {order.status !== 'Delivered' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  💬 Your order is on its way. Check the timeline above for updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
