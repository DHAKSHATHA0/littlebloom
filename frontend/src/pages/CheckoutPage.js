// frontend/src/pages/CheckoutPage.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { orderAPI } from '../services/api';
import '../styles.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useContext(CartContext);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [gstRate] = useState(Math.floor(Math.random() * 8) + 5);
  const [shippingData, setShippingData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
  });
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    if (location.state?.buyNowItem) {
      setIsBuyNow(true);
      setBuyNowItem(location.state.buyNowItem);
    } else if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [location.state?.buyNowItem]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/orders');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, navigate]);

  const calculateGST = (amount) => {
    return (amount * gstRate) / 100;
  };

  const getCheckoutData = () => {
    if (isBuyNow && buyNowItem) {
      return {
        items: [buyNowItem],
        subtotal: buyNowItem.price * buyNowItem.quantity
      };
    }
    return {
      items: cart?.items || [],
      subtotal: cart?.totalPrice || 0
    };
  };

  const checkoutData = getCheckoutData();
  const subtotal = checkoutData.subtotal;
  const gstAmount = calculateGST(subtotal);
  const finalAmount = subtotal + gstAmount;

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShippingData = () => {
    if (!shippingData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!shippingData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!shippingData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!shippingData.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!shippingData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!shippingData.state.trim()) {
      setError('State is required');
      return false;
    }
    if (!shippingData.pinCode.trim()) {
      setError('PIN code is required');
      return false;
    }
    return true;
  };

  const validateCardDetails = () => {
    const cardNum = cardData.cardNumber.replace(/\s/g, '');
    
    if (!cardNum || cardNum.length !== 16 || !/^\d+$/.test(cardNum)) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (!cardData.cardholderName.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    
    if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      setError('Please enter expiry date in MM/YY format');
      return false;
    }
    
    if (!cardData.cvv || cardData.cvv.length !== 3 || !/^\d+$/.test(cardData.cvv)) {
      setError('Please enter a valid 3-digit CVV');
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateShippingData()) {
      return;
    }

    if (paymentMethod === 'online' && !validateCardDetails()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: isBuyNow && buyNowItem
          ? [{
              productId: buyNowItem.productId,
              quantity: buyNowItem.quantity
            }]
          : cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })),
        totalAmount: finalAmount,
        paymentMethod: paymentMethod.toUpperCase(),
        gstAmount: gstAmount,
        gstRate: gstRate,
        shippingAddress: shippingData
      };

      await orderAPI.createOrder(orderData);
      if (!isBuyNow) {
        await clearCart();
      }
      setShowSuccessPopup(true);

    } catch (err) {
      console.error('Order creation failed:', err);
      const errorMsg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (!isBuyNow && (!cart || cart.items.length === 0)) {
    return null;
  }

  return (
    <div className="checkout-page">
      {showSuccessPopup && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order has been confirmed and will be processed soon.</p>
            <p className="text-muted">Redirecting to your orders...</p>
          </div>
        </div>
      )}

      <div className="container">
        <h1 className="page-title">💳 Checkout</h1>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="checkout-grid">
          {/* Left Section */}
          <div className="checkout-left">
            {/* Shipping Information Section */}
            <div className="card shipping-card">
              <div className="card-body">
                <h2>📦 Shipping Information</h2>
                
                <div className="shipping-form">
                  <div className="form-row-two">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingData.fullName}
                        onChange={handleShippingChange}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={shippingData.phoneNumber}
                        onChange={handleShippingChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingData.email}
                      onChange={handleShippingChange}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="form-group">
                    <label>Shipping Address</label>
                    <textarea
                      name="address"
                      value={shippingData.address}
                      onChange={handleShippingChange}
                      placeholder="Enter your complete address"
                      rows="3"
                    />
                  </div>

                  <div className="form-row-three">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingData.city}
                        onChange={handleShippingChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingData.state}
                        onChange={handleShippingChange}
                        placeholder="State"
                      />
                    </div>
                    <div className="form-group">
                      <label>PIN Code</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={shippingData.pinCode}
                        onChange={handleShippingChange}
                        placeholder="PIN Code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="card payment-card">
              <div className="card-body">
                <h2>💳 Payment Method</h2>
                
                <div className="payment-options">
                  <label className={`payment-option-large ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">💵</span>
                      <div className="payment-text">
                        <span className="payment-title">Cash on Delivery</span>
                        <span className="payment-desc">Pay when your order arrives at your doorstep</span>
                      </div>
                      {paymentMethod === 'cod' && <span className="checkmark">✓</span>}
                    </div>
                  </label>

                  <label className={`payment-option-large ${paymentMethod === 'online' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-icon">💳</span>
                      <div className="payment-text">
                        <span className="payment-title">Online Payment</span>
                        <span className="payment-desc">Pay securely using UPI, Cards, Net Banking, or Wallets</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Card Details Section */}
            {paymentMethod === 'online' && (
              <div className="card payment-card">
                <div className="card-body">
                  <h2>💎 Card Details</h2>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={cardData.cardholderName}
                      onChange={handleCardChange}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Order Summary */}
          <div className="checkout-right">
            <div className="card summary-card">
              <div className="card-body">
                <h2>📦 Order Summary</h2>

                <div className="summary-items">
                  {isBuyNow && buyNowItem ? (
                    <div className="summary-item">
                      <div>
                        <p className="item-name">{buyNowItem.productName}</p>
                        <p className="item-qty">Qty: {buyNowItem.quantity}</p>
                      </div>
                      <p className="item-price">₹{(buyNowItem.price * buyNowItem.quantity).toFixed(2)}</p>
                    </div>
                  ) : (
                    cart.items.map(item => (
                      <div key={item.productId} className="summary-item">
                        <div>
                          <p className="item-name">{item.productName}</p>
                          <p className="item-qty">Qty: {item.quantity}</p>
                        </div>
                        <p className="item-price">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="summary-breakdown">
                  <div className="breakdown-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>GST ({gstRate}%):</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Shipping:</span>
                    <span className="text-success">Free</span>
                  </div>
                </div>

                <div className="summary-total">
                  <div className="total-row">
                    <span>Total Amount</span>
                    <span className="total-amount">₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn btn-primary btn-large"
                  style={{ width: '100%' }}
                >
                  {loading ? '⏳ Processing...' : '📦 Place Order'}
                </button>

                <button
                  onClick={() => navigate('/cart')}
                  className="btn btn-secondary btn-large"
                  style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                >
                  Continue Shopping
                </button>

                <div className="security-info">
                  <p>🔒 Your payment information is secure and encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page {
          min-height: 100vh;
          padding: var(--spacing-xl) var(--spacing-md);
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
        }

        .page-title {
          text-align: center;
          margin-bottom: var(--spacing-xl);
          font-size: 2.5rem;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          font-size: 0.95rem;
          margin-bottom: var(--spacing-lg);
        }

        .alert-error {
          background: #FFCDD2;
          border-left: 4px solid #C62828;
          color: #C62828;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: var(--spacing-xl);
        }

        .checkout-left {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .checkout-right {
          display: flex;
          flex-direction: column;
        }

        .shipping-card,
        .payment-card {
          padding: var(--spacing-lg);
        }

        .shipping-card .card-body h2,
        .payment-card .card-body h2 {
          margin-bottom: var(--spacing-lg);
          font-size: 1.25rem;
          color: var(--text-dark);
        }

        .shipping-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .form-group label {
          font-weight: 600;
          color: var(--text-dark);
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid var(--medium-gray);
          border-radius: var(--radius-lg);
          font-size: 1rem;
          background: var(--light-gray);
          color: var(--text-dark);
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: var(--gray);
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary-pink);
          background: white;
          box-shadow: 0 0 0 3px rgba(240, 98, 146, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-row-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

        .form-row-three {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: var(--spacing-md);
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .payment-option-large {
          display: flex;
          align-items: center;
          padding: var(--spacing-lg);
          border: 2px solid var(--medium-gray);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
        }

        .payment-option-large:hover {
          border-color: var(--primary-pink);
          background: var(--very-light-pink);
        }

        .payment-option-large input[type="radio"] {
          display: none;
        }

        .payment-option-large.active {
          border-color: var(--primary-pink);
          background: var(--very-light-pink);
          box-shadow: 0 0 0 3px rgba(240, 98, 146, 0.1);
        }

        .payment-option-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          flex: 1;
          width: 100%;
        }

        .payment-icon {
          font-size: 1.75rem;
          flex-shrink: 0;
        }

        .payment-text {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          flex: 1;
        }

        .payment-title {
          font-weight: 600;
          color: var(--text-dark);
          display: block;
          font-size: 1rem;
        }

        .payment-desc {
          font-size: 0.85rem;
          color: var(--dark-gray);
          display: block;
        }

        .checkmark {
          font-size: 1.5rem;
          color: var(--primary-pink);
          font-weight: bold;
        }

        .summary-card {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .summary-card .card-body h2 {
          margin-bottom: var(--spacing-lg);
          font-size: 1.25rem;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--medium-gray);
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 0.95rem;
        }

        .item-name {
          font-weight: 600;
          color: var(--text-dark);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .item-qty {
          font-size: 0.85rem;
          color: var(--dark-gray);
          margin: 0;
        }

        .item-price {
          font-weight: 600;
          color: var(--text-dark);
          margin: 0;
        }

        .summary-breakdown {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          padding-bottom: var(--spacing-lg);
          border-bottom: 1px solid var(--medium-gray);
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--dark-gray);
        }

        .text-success {
          color: #2E7D32;
          font-weight: 600;
        }

        .summary-total {
          background: var(--very-light-pink);
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-dark);
        }

        .total-amount {
          color: var(--primary-pink);
          font-size: 1.25rem;
        }

        .security-info {
          background: #E3F2FD;
          border: 1px solid #1565C0;
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          text-align: center;
          margin-top: var(--spacing-md);
        }

        .security-info p {
          margin: 0;
          font-weight: 600;
          color: #1565C0;
          font-size: 0.9rem;
        }

        .text-muted {
          color: var(--gray);
          font-size: 0.85rem;
          margin-top: var(--spacing-xs);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .success-modal {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          text-align: center;
          box-shadow: var(--shadow-lg);
          max-width: 400px;
          animation: fadeIn 0.3s ease-in-out;
        }

        .success-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }

        .success-modal h2 {
          color: var(--primary-pink);
          margin-bottom: var(--spacing-md);
        }

        .success-modal p {
          margin-bottom: var(--spacing-sm);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .form-row-three {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .form-row-two,
          .form-row-three {
            grid-template-columns: 1fr;
          }

          .page-title {
            font-size: 2rem;
          }

          .summary-card {
            position: static;
          }
        }

        @media (max-width: 480px) {
          .checkout-page {
            padding: var(--spacing-lg) var(--spacing-md);
          }

          .page-title {
            font-size: 1.75rem;
          }

          .payment-option-large {
            flex-direction: column;
            text-align: center;
          }

          .payment-option-content {
            flex-direction: column;
            align-items: center;
          }

          .payment-text {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
