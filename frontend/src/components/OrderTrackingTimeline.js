// frontend/src/components/OrderTrackingTimeline.js
import React from 'react';

export default function OrderTrackingTimeline({ status, isSeller = false }) {
  const statusLabels = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
  };

  const getStatusLabel = (statusValue) => {
    return statusLabels[statusValue] || statusValue; // Fallback to original status if undefined
  };

  const getBuyerStages = () => [
    { key: 'PENDING', label: '📦 Order Placed', description: 'Your order has been placed' },
    { key: 'CONFIRMED', label: '✓ Confirmed', description: 'Seller confirmed your order' },
    { key: 'OUT_FOR_DELIVERY', label: '🚚 Out for Delivery', description: 'Your item is on the way' },
    { key: 'DELIVERED', label: '✅ Delivered', description: 'Delivered to you' },
  ];

  const getSellerStages = () => [
    { key: 'PENDING', label: '📦 New Order', description: 'Order received' },
    { key: 'CONFIRMED', label: '✓ Confirmed', description: 'Order accepted' },
    { key: 'OUT_FOR_DELIVERY', label: '🚚 Shipped', description: 'Item dispatched' },
    { key: 'DELIVERED', label: '✅ Delivered', description: 'Delivered to buyer' },
  ];

  const stages = isSeller ? getSellerStages() : getBuyerStages();

  const getStatusIndex = (currentStatus) => {
    return stages.findIndex(stage => stage.key === currentStatus);
  };

  const currentIndex = getStatusIndex(status);
  const isCompleted = currentIndex !== -1;

  const getProgressPercentage = () => {
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const getStatusColor = (stageIndex) => {
    if (stageIndex < currentIndex) {
      return 'bg-green-600'; // Completed
    } else if (stageIndex === currentIndex) {
      return 'bg-blue-600'; // Current
    } else {
      return 'bg-gray-300'; // Pending
    }
  };

  const getTextColor = (stageIndex) => {
    if (stageIndex < currentIndex) {
      return 'text-green-600';
    } else if (stageIndex === currentIndex) {
      return 'text-blue-600';
    } else {
      return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">📍 Order Tracking</h3>
        <p className="text-sm text-gray-600">
          Current Status: <span className="font-semibold text-blue-600">{getStatusLabel(status)}</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200" />

        {/* Timeline Items */}
        <div className="space-y-8">
          {stages.map((stage, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={stage.key} className="relative pl-20">
                {/* Timeline Dot */}
                <div
                  className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${getStatusColor(
                    index
                  )} ${
                    isActive ? 'ring-4 ring-offset-2 ring-blue-300 animate-pulse' : ''
                  }`}
                >
                  {isCompleted && '✓'}
                  {isActive && '•'}
                  {!isCompleted && !isActive && <span className="text-xs">○</span>}
                </div>

                {/* Stage Content */}
                <div
                  className={`transition-opacity duration-300 ${
                    getTextColor(index).replace('text-', '')
                  }`}
                >
                  <h4
                    className={`font-bold text-lg ${getTextColor(
                      index
                    )} transition-colors duration-300`}
                  >
                    {stage.label}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{stage.description}</p>

                  {/* Status Indicator */}
                  {isActive && (
                    <div className="mt-2 inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 font-semibold">
                      Currently here
                    </div>
                  )}
                  {isCompleted && (
                    <div className="mt-2 inline-block px-3 py-1 bg-green-50 border border-green-200 rounded-full text-xs text-green-700 font-semibold">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          {status === 'DELIVERED'
            ? '✓ Your order has been successfully delivered!'
            : '📬 Please allow some time for your order to progress through each stage.'}
        </p>
      </div>
    </div>
  );
}
