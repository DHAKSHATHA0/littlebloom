// frontend/src/components/SellerOrderUpdateForm.js
import React, { useState } from 'react';
import { orderAPI } from '../services/api';

export default function SellerOrderUpdateForm({ orderItem, onStatusUpdated }) {
  const [newStatus, setNewStatus] = useState(orderItem.status);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const statusOptions = ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  // Status label mapping - Display labels without changing backend values
  const statusLabels = {
    PENDING: '📦 New Order',
    CONFIRMED: '✓ Confirmed',
    OUT_FOR_DELIVERY: '🚚 Shipped',
    DELIVERED: '✅ Delivered',
  };

  const getStatusLabel = (status) => {
    
    return statusLabels[status] || status; // Fallback to original status if undefined
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-50 border-blue-200';
      case 'CONFIRMED':
        return 'bg-purple-50 border-purple-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-50 border-yellow-200';
      case 'DELIVERED':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleStatusChange = async () => {
    if (newStatus === orderItem.status) {
      setMessage('Please select a different status');
      setMessageType('info');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setLoading(true);
    try {
      await orderAPI.updateOrderItemStatus(orderItem.id, { status: newStatus });
      setMessage(`Status updated to ${newStatus}!`);
      setMessageType('success');
      
      // Call callback to refresh order list
      if (onStatusUpdated) {
        onStatusUpdated(orderItem.id, newStatus);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update status';
      setMessage(errorMsg);
      setMessageType('error');
      console.error('Update error:', error);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Determine available next statuses
  const getAvailableStatuses = () => {
    const currentIndex = statusOptions.indexOf(orderItem.status);
    if (currentIndex === -1) return statusOptions;
    return statusOptions.slice(currentIndex);
  };

  const availableStatuses = getAvailableStatuses();
  const canUpdate = newStatus !== orderItem.status && availableStatuses.includes(newStatus);

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusColor(orderItem.status)}`}>
      {/* Header */}
      <h4 className="font-bold text-gray-800 mb-3">
        {orderItem.productName}
        <span className="ml-2 text-sm font-normal text-gray-600">(Qty: {orderItem.quantity})</span>
      </h4>

      {/* Message */}
      {message && (
        <div
          className={`mb-3 p-2 rounded text-sm font-medium text-center ${
            messageType === 'success'
              ? 'bg-green-100 text-green-700'
              : messageType === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Current Status */}
      <div className="mb-4 p-3 bg-white rounded border border-gray-200">
        <p className="text-sm text-gray-600 mb-1">Current Status</p>
        <div className="flex items-center gap-2">
          <span className="text-xl">{getStatusLabel(orderItem.status).split(' ')[0]}</span>
          <p className="font-semibold text-gray-800">{getStatusLabel(orderItem.status)}</p>
        </div>
      </div>

      {/* Status Update Section */}
      {orderItem.status !== 'DELIVERED' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 disabled:bg-gray-100"
            >
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStatusChange}
            disabled={loading || !canUpdate}
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              canUpdate
                ? 'bg-pink-600 text-white hover:bg-pink-700'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            } ${loading ? 'opacity-75' : ''}`}
          >
            {loading ? '⏳ Updating...' : '✓ Update Status'}
          </button>

          {/* Status Progression Info */}
          <div className="mt-3 text-xs text-gray-600">
            <p className="font-semibold mb-1">Status Progression:</p>
            <div className="flex items-center gap-1">
              {statusOptions.map((status, idx) => {
                const isCompleted = statusOptions.indexOf(orderItem.status) >= idx;
                const isCurrent = status === orderItem.status;
                return (
                  <React.Fragment key={status}>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        isCurrent
                          ? 'bg-gray-400 text-white'
                          : isCompleted
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </span>
                    {idx < statusOptions.length - 1 && <span className="text-gray-400">→</span>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Delivered Badge */}
      {orderItem.status === 'DELIVERED' && (
        <div className="text-center py-3">
          <p className="text-green-700 font-bold text-lg">✅ Delivered</p>
          <p className="text-sm text-green-600">Order has been successfully delivered</p>
        </div>
      )}
    </div>
  );
}
