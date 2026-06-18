// frontend/src/components/OrderTrackingSteps.js
import React from 'react';

export default function OrderTrackingSteps({ status, title = 'Order Status' }) {
  const steps = [
    { key: 'PENDING', label: 'Pending', icon: '📦' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: '✓' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚚' },
    { key: 'DELIVERED', label: 'Delivered', icon: '✅' },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === status);
  };

  const currentStepIndex = getCurrentStepIndex();
  const isValidStatus = currentStepIndex !== -1;

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStepIndex) {
      return 'completed'; // Completed steps
    } else if (stepIndex === currentStepIndex) {
      return 'current'; // Current step
    } else {
      return 'pending'; // Pending steps
    }
  };

  const getStepColor = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return 'bg-green-600 text-white';
      case 'current':
        return 'bg-blue-600 text-white ring-4 ring-blue-200';
      case 'pending':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-gray-200 text-gray-400';
    }
  };

  const getLineColor = (stepIndex) => {
    if (stepIndex < currentStepIndex) {
      return 'bg-green-600'; // Completed line
    } else if (stepIndex === currentStepIndex) {
      return 'bg-gradient-to-r from-green-600 to-blue-600'; // Transition line
    } else {
      return 'bg-gray-300'; // Pending line
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-800 mb-6">{title}</h3>

      {/* Steps Container */}
      <div className="relative">
        {/* Horizontal Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-300 rounded-full" />
        <div
          className={`absolute top-6 left-0 h-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-full transition-all duration-500`}
          style={{
            width: isValidStatus ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%',
          }}
        />

        {/* Steps */}
        <div className="flex justify-between relative z-10">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(index);
            const isCompleted = stepStatus === 'completed';
            const isCurrent = stepStatus === 'current';

            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${getStepColor(
                    stepStatus
                  )} ${
                    isCurrent ? 'animate-pulse shadow-lg' : ''
                  } bg-white border-4 ${
                    isCompleted ? 'border-green-600' : isCurrent ? 'border-blue-600' : 'border-gray-300'
                  }`}
                >
                  {isCompleted ? '✓' : isCurrent ? step.icon : '○'}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      isCompleted
                        ? 'text-green-600'
                        : isCurrent
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      {!isValidStatus && (
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">⚠️ Invalid order status</p>
        </div>
      )}

      {isValidStatus && currentStepIndex === steps.length - 1 && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">✅ Order delivered successfully!</p>
        </div>
      )}
    </div>
  );
}
