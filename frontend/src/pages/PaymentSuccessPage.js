// frontend/src/pages/PaymentSuccessPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get order from session storage or location state
    const orderData = location.state?.order || {
      id: sessionStorage.getItem('lastOrderId'),
      totalPrice: sessionStorage.getItem('lastOrderTotal'),
      items: Array(parseInt(sessionStorage.getItem('lastOrderItems') || 0))
    };
    
    if (orderData && orderData.id) {
      setOrder(orderData);
    } else {
      // Redirect to orders if no order data
      navigate('/orders');
      return;
    }

    // Countdown to auto-redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup session storage on component unmount
    return () => {
      clearInterval(timer);
      sessionStorage.removeItem('lastOrderId');
      sessionStorage.removeItem('lastOrderTotal');
      sessionStorage.removeItem('lastOrderItems');
    };
  }, [navigate, location.state]);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="animate-bounce mb-4">
              <svg
                className="w-16 h-16 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ✓ Payment Successful!
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Your order has been confirmed and placed successfully.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-pink-600">#{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-semibold text-gray-800">
                {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Items Ordered</p>
            <p className="text-2xl font-bold text-gray-800">
              {order.items?.length || parseInt(sessionStorage.getItem('lastOrderItems') || 0)}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{order.totalPrice}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm font-medium text-blue-900 mb-2">📧 What's Next?</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Order confirmation sent to your email</li>
            <li>✓ Seller will process your order</li>
            <li>✓ You'll get shipping updates soon</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Auto Redirect Message */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Redirecting to orders in <span className="font-bold">{countdown}s</span>
        </p>
      </div>
    </div>
  );
}
