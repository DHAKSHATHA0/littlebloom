// frontend/src/pages/SignupPage.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles.css';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Address is required');
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        password: formData.password,
        role: formData.role,
      });

      if (result.success) {
        toast.success('Account created successfully!');
        // Check role and navigate accordingly
        if (formData.role === 'SELLER') {
          navigate('/seller/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        toast.error(result.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button 
        onClick={() => navigate('/')}
        className="auth-back-arrow"
        title="Go Back"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div className="auth-container">
        {/* Logo Section */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="60" height="60" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <h1>Little Bloom</h1>
          <p>Create your account</p>
        </div>

        {/* Signup Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label>I am a...</label>
              <div className="role-selector">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="BUYER"
                    checked={formData.role === 'BUYER'}
                    onChange={handleChange}
                  />
                  <span className="role-label">👶 Buyer</span>
                  <span className="role-desc">Shop for baby products</span>
                </label>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="SELLER"
                    checked={formData.role === 'SELLER'}
                    onChange={handleChange}
                  />
                  <span className="role-label">🏪 Seller</span>
                  <span className="role-desc">Sell baby products</span>
                </label>
              </div>
            </div>

            {/* Address Field */}
            <div className="form-group">
              <label htmlFor="address">📍 Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address (Street, City, State, Postal Code)"
                required
                rows="3"
                className="address-textarea"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-large"
              style={{ width: '100%' }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Sign In Link */}
          <div className="auth-footer">
            <p>Already have an account?</p>
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-md);
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
          position: relative;
        }

        .auth-back-arrow {
          position: absolute;
          top: 20px;
          left: 20px;
          background: white;
          border: none;
          cursor: pointer;
          padding: 8px 12px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .auth-back-arrow:hover {
          color: #F06292;
          background: rgba(240, 98, 146, 0.08);
          transform: scale(1.05);
        }

        .auth-container {
          width: 100%;
          max-width: 480px;
          animation: fadeIn 0.5s ease-in-out;
        }

        /* Header */
        .auth-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .auth-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--spacing-lg);
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          border: 3px solid #F06292;
        }

        .auth-header h1 {
          font-size: 2rem;
          margin-bottom: var(--spacing-sm);
          background: linear-gradient(135deg, var(--primary-pink) 0%, #EC407A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-header p {
          color: var(--dark-gray);
          font-size: 1rem;
          margin: 0;
        }

        /* Card */
        .auth-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--spacing-xl);
          box-shadow: var(--shadow-lg);
        }

        /* Form */
        .auth-form {
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

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"],
        .address-textarea {
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
        .address-textarea::placeholder {
          color: var(--gray);
        }

        .form-group input:focus,
        .address-textarea:focus {
          outline: none;
          border-color: var(--primary-pink);
          background: white;
          box-shadow: 0 0 0 3px rgba(240, 98, 146, 0.1);
        }

        .address-textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* Role Selector */
        .role-selector {
          display: flex;
          gap: var(--spacing-md);
        }

        .role-option {
          flex: 1;
          position: relative;
          cursor: pointer;
        }

        .role-option input[type="radio"] {
          display: none;
        }

        .role-option input[type="radio"] + .role-label {
          display: block;
          padding: var(--spacing-md);
          border: 2px solid var(--medium-gray);
          border-radius: var(--radius-lg);
          background: var(--light-gray);
          text-align: center;
          font-weight: 600;
          color: var(--text-dark);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .role-option input[type="radio"]:checked + .role-label {
          border-color: var(--primary-pink);
          background: var(--very-light-pink);
          color: var(--primary-pink);
        }

        .role-label {
          display: block;
          margin-bottom: var(--spacing-xs);
        }

        .role-desc {
          display: block;
          font-size: 0.75rem;
          color: var(--gray);
          font-weight: 400;
          margin-top: var(--spacing-xs);
        }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin: var(--spacing-lg) 0;
          color: var(--gray);
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--medium-gray);
        }

        .auth-divider span {
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Footer */
        .auth-footer {
          text-align: center;
        }

        .auth-footer p {
          color: var(--dark-gray);
          margin-bottom: var(--spacing-sm);
          font-size: 0.95rem;
        }

        .auth-link {
          color: var(--primary-pink);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .auth-link:hover {
          color: #EC407A;
          transform: translateY(-2px);
        }

        /* Animations */
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

        /* Responsive */
        @media (max-width: 480px) {
          .auth-container {
            max-width: 100%;
          }

          .auth-card {
            padding: var(--spacing-lg);
          }

          .auth-header h1 {
            font-size: 1.75rem;
          }

          .auth-logo {
            width: 70px;
            height: 70px;
            font-size: 2rem;
          }

          .role-selector {
            flex-direction: column;
          }

          .address-textarea {
            min-height: 70px;
          }

          .auth-back-arrow {
            top: 16px;
            left: 16px;
          }
        }
      `}</style>
    </div>
  );
}
