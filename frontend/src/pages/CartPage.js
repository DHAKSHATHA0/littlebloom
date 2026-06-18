import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import Loading from '../components/Loading';
import '../styles.css';

export default function CartPage() {
  const { cart, loading, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!cart || cart.items.length === 0)) {
      // Cart is empty
    }
  }, [cart, loading]);

  if (loading) {
    return null;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart-wrapper">
        <div className="empty-cart-container">
          <div className="empty-cart-icon-circle">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9C6BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2h12c1.1 0 2 .9 2 2v2h2c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h2V4c0-1.1.9-2 2-2z"></path>
              <path d="M9 6v2h6V6" fill="none" stroke="#9C6BA8" strokeWidth="1.5"></path>
            </svg>
          </div>
          <h1 className="empty-cart-heading">Your Cart is Empty</h1>
          <p className="empty-cart-text">Start shopping to add items to your cart</p>
          <button 
            onClick={() => navigate('/home')}
            className="empty-cart-button"
          >
            Start Shopping
          </button>
        </div>

        <style>{`
          .empty-cart-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            width: 100%;
          }

          .empty-cart-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 24px;
          }

          .empty-cart-icon-circle {
            width: 140px;
            height: 140px;
            background: rgba(156, 107, 168, 0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .empty-cart-heading {
            font-size: 2.2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
            letter-spacing: -0.5px;
          }

          .empty-cart-text {
            font-size: 1.05rem;
            color: #666;
            margin: 0;
            line-height: 1.6;
            max-width: 400px;
          }

          .empty-cart-button {
            background: #F06292;
            color: white;
            border: none;
            padding: 14px 48px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
            margin-top: 8px;
          }

          .empty-cart-button:hover {
            background: #EC407A;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(240, 98, 146, 0.4);
          }

          .empty-cart-button:active {
            transform: translateY(0);
          }

          @media (max-width: 768px) {
            .empty-cart-wrapper {
              padding: 24px 16px;
            }

            .empty-cart-icon-circle {
              width: 120px;
              height: 120px;
            }

            .empty-cart-heading {
              font-size: 1.8rem;
            }

            .empty-cart-text {
              font-size: 1rem;
            }
          }

          @media (max-width: 480px) {
            .empty-cart-wrapper {
              padding: 20px;
            }

            .empty-cart-icon-circle {
              width: 100px;
              height: 100px;
            }

            .empty-cart-heading {
              font-size: 1.5rem;
            }

            .empty-cart-text {
              font-size: 0.95rem;
            }

            .empty-cart-button {
              padding: 12px 40px;
              font-size: 0.95rem;
            }
          }
        `}</style>
      </div>
    );
  }

  const calculateSubtotal = () => {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1 className="page-title">Shopping Cart</h1>
        </div>

        <div className="cart-grid">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            <div className="items-list">
              {cart.items.map(item => (
                <div key={item.id} className="cart-item">
                  {/* Item Image */}
                  <div className="item-image">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image'}
                      alt={item.productName}
                    />
                  </div>

                  {/* Item Details */}
                  <div className="item-details">
                    <h3 className="item-title">{item.productName}</h3>
                    <p className="item-price">₹{parseFloat(item.price).toFixed(2)}</p>
                  </div>

                  {/* Quantity Control */}
                  <div className="quantity-section">
                    <label>Qty:</label>
                    <div className="qty-control">
                      <button
                        onClick={async () => {
                          if (item.quantity > 1) {
                            await updateQuantity(item.productId, item.quantity - 1);
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className="qty-btn qty-btn-minus"
                        title={item.quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        onClick={async () => {
                          await updateQuantity(item.productId, item.quantity + 1);
                        }}
                        className="qty-btn qty-btn-plus"
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="item-subtotal">
                    <p className="subtotal-label">Subtotal</p>
                    <p className="subtotal-amount">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary Section */}
          <div className="cart-summary-section">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal()}</span>
                </div>
                <div className="breakdown-row">
                  <span>Shipping:</span>
                  <span className="text-success">FREE</span>
                </div>
                <div className="breakdown-row">
                  <span>Tax:</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="summary-total">
                <div className="total-row">
                  <span>Total:</span>
                  <span className="total-amount">₹{cart.totalPrice}</span>
                </div>
              </div>

              <div className="summary-actions">
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn-checkout"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="btn-continue"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="security-info">
                <p>🔒 Secure checkout with encrypted payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: #F8E8F0;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .cart-header {
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
        }

        .cart-items-section {
          display: flex;
          flex-direction: column;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .cart-item {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: grid;
          grid-template-columns: 100px 1fr 120px 120px 120px 100px;
          gap: 24px;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .cart-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .item-image {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.3;
        }

        .item-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #F06292;
          margin: 0;
        }

        .quantity-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .quantity-section label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #666;
        }

        .qty-control {
          display: flex;
          align-items: center;
          border: 2px solid #ddd;
          border-radius: 6px;
          background: white;
        }

        .qty-btn {
          background: none;
          border: none;
          padding: 8px 12px;
          font-size: 1.2rem;
          font-weight: 700;
          color: #F06292;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 4px;
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qty-btn:hover:not(:disabled) {
          background: #FCE4EC;
          color: #EC407A;
          transform: scale(1.1);
        }

        .qty-btn:active:not(:disabled) {
          transform: scale(0.95);
          background: #F8BBD0;
        }

        .qty-btn:disabled {
          color: #BDBDBD;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .qty-btn-minus:disabled {
          background: #F5F5F5;
        }

        .qty-value {
          padding: 6px 12px;
          font-weight: 600;
          color: #1a1a1a;
          min-width: 40px;
          text-align: center;
        }

        .item-subtotal {
          text-align: center;
        }

        .subtotal-label {
          font-size: 0.8rem;
          color: #999;
          margin: 0 0 4px 0;
        }

        .subtotal-amount {
          font-size: 1.1rem;
          font-weight: 700;
          color: #F06292;
          margin: 0;
        }

        .btn-remove {
          background: linear-gradient(135deg, #FFCDD2 0%, #FFAB91 100%);
          border: 2px solid #812540;
          color: #922848;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.3s ease;
          padding: 8px 16px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2);
          position: relative;
          overflow: hidden;
        }

        .btn-remove:hover {
          background: linear-gradient(135deg, #812540 0%, #D32F2F 100%);
          color: white;
          border-color: #812540;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
        }

        .btn-remove:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(244, 67, 54, 0.2);
        }

        

        .cart-summary-section {
          display: flex;
          flex-direction: column;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .summary-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 24px 0;
        }

        .summary-breakdown {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: #666;
        }

        .text-success {
          color: #2E7D32;
          font-weight: 600;
        }

        .summary-total {
          background: #FCE4EC;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .total-amount {
          color: #F06292;
        }

        .summary-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .btn-checkout {
          background: #F06292;
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-checkout:hover {
          background: #EC407A;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
        }

        .btn-continue {
          background: white;
          color: #F06292;
          border: 2px solid #F06292;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-continue:hover {
          background: #FCE4EC;
        }

        .security-info {
          background: #E3F2FD;
          border: 1px solid #1565C0;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }

        .security-info p {
          margin: 0;
          font-weight: 600;
          color: #1565C0;
          font-size: 0.9rem;
        }

        @media (max-width: 1024px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }

          .summary-card {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .cart-page {
            padding: 24px 16px;
          }

          .page-title {
            font-size: 2rem;
          }

          .cart-item {
            grid-template-columns: 80px 1fr;
            gap: 16px;
          }

          .quantity-section,
          .item-subtotal,
          .btn-remove {
            grid-column: 1 / -1;
          }

          .quantity-section {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .item-subtotal {
            text-align: left;
          }
        }

        @media (max-width: 480px) {
          .cart-header {
            gap: 12px;
          }

          .page-title {
            font-size: 1.75rem;
          }

          .cart-item {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .item-image {
            width: 100%;
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
}
