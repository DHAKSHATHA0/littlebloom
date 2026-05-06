// frontend/src/pages/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container flex-between">
          <div className="logo-section">
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
            <h2 className="logo-text">Little Bloom</h2>
          </div>
          <div className="nav-links">
            <button 
              className="btn btn-primary btn-small"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to Little Bloom</h1>
            <p className="hero-subtitle">
              Discover premium baby products from trusted sellers
            </p>
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate('/login')}
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="grid grid-cols-3">
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Quality Products</h3>
              <p>Verified products from trusted sellers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable shipping</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Easy Payment</h3>
              <p>Secure payment options</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="shop-by-category">
        <div className="container">
          <h2 className="category-title">Shop by Category</h2>
          <div className="category-grid">
            <div className="category-card" onClick={() => navigate('/login')}>
              <div className="category-icon clothing-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 4h12v2H6z"></path>
                  <path d="M6 6h2v10H6z"></path>
                  <path d="M16 6h2v10h-2z"></path>
                  <path d="M8 16h8v4H8z"></path>
                </svg>
              </div>
              <h3 className="category-name">Clothing</h3>
            </div>

            <div className="category-card" onClick={() => navigate('/login')}>
              <div className="category-icon gifts-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 12v8H4v-8"></path>
                  <rect x="2" y="5" width="20" height="3"></rect>
                  <path d="M12 9v3"></path>
                  <path d="M9 5v4h6V5"></path>
                </svg>
              </div>
              <h3 className="category-name">Gifts</h3>
            </div>

            <div className="category-card" onClick={() => navigate('/login')}>
              <div className="category-icon footwear-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 20h4v-8H5z"></path>
                  <path d="M15 20h4v-8h-4z"></path>
                  <path d="M5 12h14v2H5z"></path>
                </svg>
              </div>
              <h3 className="category-name">Footwear</h3>
            </div>

            <div className="category-card" onClick={() => navigate('/login')}>
              <div className="category-icon essentials-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="9" r="2"></circle>
                  <path d="M12 14c-1.5 1-2 2-2 3s.5 2 2 2 2-.5 2-2c0-1-.5-2-2-3z"></path>
                </svg>
              </div>
              <h3 className="category-name">Essentials</h3>
            </div>

            <div className="category-card" onClick={() => navigate('/login')}>
              <div className="category-icon toys-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8"></circle>
                  <circle cx="8" cy="9" r="1.5"></circle>
                  <circle cx="16" cy="9" r="1.5"></circle>
                  <path d="M9 15c1 1 2 1 3 1s2 0 3-1"></path>
                </svg>
              </div>
              <h3 className="category-name">Toys</h3>
            </div>

            <div className="category-card" onClick={() => navigate('/login')}>
              <div className="category-icon feeding-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20"></path>
                  <path d="M4 8h16"></path>
                  <path d="M6 14h12"></path>
                  <circle cx="12" cy="12" r="8"></circle>
                </svg>
              </div>
              <h3 className="category-name">Feeding</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      <style>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Navbar */
        .navbar {
          background: white;
          box-shadow: var(--shadow-sm);
          padding: var(--spacing-md) 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .logo-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 1.5rem;
          background: linear-gradient(135deg, var(--primary-pink) 0%, #EC407A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }

        .nav-links {
          display: flex;
          gap: var(--spacing-md);
          align-items: center;
        }

        /* Hero Section */
        .hero {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl) var(--spacing-md);
          text-align: center;
        }

        .hero-content {
          max-width: 600px;
        }

        .hero-title {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
          color: var(--text-dark);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--dark-gray);
          margin-bottom: var(--spacing-lg);
          line-height: 1.6;
        }

        /* Features Section */
        .features {
          padding: var(--spacing-xl) var(--spacing-md);
          background: white;
          margin-top: var(--spacing-xl);
        }

        .feature-card {
          background: var(--very-light-pink);
          padding: var(--spacing-lg);
          border-radius: var(--radius-xl);
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-md);
        }

        .feature-card h3 {
          margin-bottom: var(--spacing-sm);
          color: var(--text-dark);
        }

        .feature-card p {
          color: var(--dark-gray);
          margin: 0;
        }

        /* Shop by Category Section */
        .shop-by-category {
          padding: var(--spacing-xl) var(--spacing-md);
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
        }

        .category-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-dark);
          margin: 0 0 var(--spacing-xl) 0;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-lg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .category-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--spacing-lg);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .category-icon {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .clothing-icon {
          background: #FFE4E1;
        }

        .gifts-icon {
          background: #E3F2FD;
        }

        .footwear-icon {
          background: #F3E5F5;
        }

        .essentials-icon {
          background: #E8F5E9;
        }

        .toys-icon {
          background: #FFF3E0;
        }

        .feeding-icon {
          background: #FCE4EC;
        }

        .category-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0;
        }

        .category-card:hover .category-icon {
          transform: scale(1.1);
        }



        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .nav-links {
            gap: var(--spacing-sm);
          }
        }

        @media (max-width: 480px) {
          .logo-text {
            display: none;
          }

          .hero-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}
