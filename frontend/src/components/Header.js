import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { OrderNotificationContext } from '../context/OrderNotificationContext';
import '../styles.css';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const { newOrderCount, hasNewOrders } = useContext(OrderNotificationContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const isSeller = user?.role === 'SELLER';

  if (!user) {
    return null;
  }

  return (
    <header className="header-new">
      <div className="container header-container">
        {/* Back Arrow + Logo Group */}
        <div className="logo-group">
          <button 
            onClick={handleGoBack}
            className="back-arrow-btn"
            title="Go Back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          <Link to={isSeller ? '/seller/dashboard' : '/home'} className="logo-link">
            <div className="logo-icon">
              <svg width="50" height="50" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Circle */}
                <circle cx="100" cy="100" r="95" stroke="#333" strokeWidth="2" fill="none"/>
                
                {/* Inner Circle */}
                <circle cx="100" cy="100" r="75" stroke="#333" strokeWidth="1.5" fill="none"/>
                
                {/* Text on outer circle - LITTLE BLOOM */}
                <path id="topCurve" d="M 40 100 A 60 60 0 0 1 160 100" fill="none"/>
                <text fontSize="14" fontWeight="600" fill="#9C6BA8" letterSpacing="2">
                  <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
                    LITTLE BLOOM
                  </textPath>
                </text>
                
                {/* Text on outer circle - ONLY for babies */}
                <path id="bottomCurve" d="M 160 100 A 60 60 0 0 1 40 100" fill="none"/>
                <text fontSize="14" fontWeight="600" fill="#9C6BA8" letterSpacing="2">
                  <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
                    Only for babies
                  </textPath>
                </text>
                
                {/* Left Star */}
                <g transform="translate(50, 100)">
                  <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#F4A5A5"/>
                </g>
                
                {/* Right Star */}
                <g transform="translate(150, 100)">
                  <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#F4A5A5"/>
                </g>
                
                {/* Flower - Center */}
                <circle cx="100" cy="100" r="12" fill="#F06292"/>
                
                {/* Flower Petals */}
                <circle cx="100" cy="70" r="14" fill="#F4A5A5"/>
                <circle cx="130" cy="85" r="14" fill="#F4A5A5"/>
                <circle cx="130" cy="115" r="14" fill="#F4A5A5"/>
                <circle cx="100" cy="130" r="14" fill="#F4A5A5"/>
                <circle cx="70" cy="115" r="14" fill="#F4A5A5"/>
                <circle cx="70" cy="85" r="14" fill="#F4A5A5"/>
              </svg>
            </div>
            <span className="logo-name">Little Bloom</span>
          </Link>
        </div>

        {/* Right Section - All Icons */}
        <div className="header-right-new">
          {isSeller && (
            <>
              <span className="seller-badge">Seller</span>
              <Link to="/seller/dashboard" className="nav-item" title="Dashboard Home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </Link>
              <Link to="/seller/products" className="nav-item" title="My Products">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2h12c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z"></path>
                  <path d="M9 2v4h6V2"></path>
                </svg>
              </Link>
              <Link to="/seller/orders" className="nav-item" title="My Orders">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                {newOrderCount > 0 && <span className="order-count">{newOrderCount}</span>}
              </Link>
            </>
          )}
          
          {!isSeller && (
            <>
              <Link to="/home" className="nav-item" title="Home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </Link>

              <Link to="/search" className="nav-item" title="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </Link>

            

              <Link to="/wishlist" className="nav-item" title="Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </Link>

              <Link to="/cart" className="nav-item" title="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>

              <Link to="/orders" className="nav-item" title="Orders">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                {hasNewOrders && <span className="order-notification-dot"></span>}
              </Link>
            </>
          )}

          <Link to="/profile" className="profile-btn" title="My Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>

          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .header-new {
          background: white;
          border-bottom: 2px solid #f0f0f0;
          padding: 12px 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0;
          padding: 8px 0;
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 0;
          flex-shrink: 0;
        }

        .back-arrow-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 4px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          border-radius: 6px;
          flex-shrink: 0;
          margin: 0;
        }

        .back-arrow-btn:hover {
          color: #F06292;
          background: rgba(240, 98, 146, 0.08);
          transform: scale(1.05);
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .logo-link:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-name {
          font-size: 30px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
          letter-spacing: 0.5px;
        }

        .header-right-new {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-shrink: 0;
        }

        .seller-badge {
          background: #F06292;
          color: white;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
        }

        .nav-item {
          color: #333;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px 8px;
          border-radius: 6px;
          height: 32px;
        }

        .nav-item:hover {
          color: #F06292;
          background: rgba(240, 98, 146, 0.08);
          transform: none;
        }



        .cart-count {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #F06292;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          box-shadow: none;
        }

        .order-count {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #FF6B35;
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
        }

        .order-notification-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #FF4444;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(255, 68, 68, 0.3);
        }

        .profile-btn,
        .logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          text-decoration: none;
          border-radius: 6px;
        }

        .profile-btn:hover,
        .logout-btn:hover {
          color: #F06292;
          background: rgba(240, 98, 146, 0.08);
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .header-container {
            gap: 0;
          }

          .header-right-new {
            gap: 16px;
          }

          .logo-name {
            display: none;
          }

          .logo-icon {
            width: 36px;
            height: 36px;
            font-size: 24px;
          }

          .logo-link {
            gap: 4px;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            gap: 0;
          }

          .header-right-new {
            gap: 12px;
          }

          .nav-item {
            font-size: 16px;
          }

          .seller-badge {
            display: none;
          }

          .back-arrow-btn {
            padding: 4px 2px;
          }
        }
      `}</style>
    </header>
  );
}
