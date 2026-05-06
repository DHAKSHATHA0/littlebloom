import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-new">
      <div className="container footer-container">
        {/* Left Section - Logo & Description */}
        <div className="footer-section footer-about">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span className="footer-logo-text">Little Bloom</span>
          </div>
          <p className="footer-description">
            Bringing joy and comfort to your little ones with premium quality baby products.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon" title="Facebook">f</a>
            <a href="#" className="social-icon" title="Instagram">📷</a>
            <a href="#" className="social-icon" title="Twitter">𝕏</a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/menu">Shop All</Link></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>New Arrivals</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Best Sellers</a></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footer-section">
          <h4 className="footer-title">Customer Care</h4>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Shipping Info</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Returns</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>FAQ</a></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-section footer-contact">
          <h4 className="footer-title">Contact Us</h4>
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <div>
              <p>123 Baby Street, Suite 100</p>
              <p>San Francisco, CA 94102</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <p>hello@littlebloom.com</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p className="copyright">
          © {currentYear} Little Bloom. All rights reserved. Made with love for your little ones.
        </p>
      </div>

      <style>{`
        .footer-new {
          background: #f9f9f9;
          padding: 48px 0 24px;
          margin-top: 80px;
          border-top: 1px solid #e0e0e0;
        }

        .footer-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 48px;
          margin-bottom: 48px;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-about {
          grid-column: 1;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .footer-logo-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .footer-logo-text {
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-description {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .footer-socials {
          display: flex;
          gap: 16px;
          margin-top: 8px;
        }

        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          border: 2px solid #F06292;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F06292;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 16px;
        }

        .social-icon:hover {
          background: #F06292;
          color: white;
        }

        .footer-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links li {
          margin: 0;
        }

        .footer-links a {
          color: #666;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .footer-links a:hover {
          color: #F06292;
        }

        .footer-contact {
          grid-column: 4;
        }

        .contact-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 14px;
          color: #666;
        }

        .contact-icon {
          font-size: 18px;
          flex-shrink: 0;
          color: #F06292;
        }

        .contact-item p {
          margin: 0;
          line-height: 1.5;
        }

        .footer-bottom {
          border-top: 1px solid #e0e0e0;
          padding-top: 24px;
          text-align: center;
        }

        .copyright {
          font-size: 13px;
          color: #999;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .footer-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px;
          }

          .footer-about {
            grid-column: 1 / -1;
          }

          .footer-contact {
            grid-column: auto;
          }
        }

        @media (max-width: 768px) {
          .footer-new {
            padding: 32px 0 16px;
            margin-top: 48px;
          }

          .footer-container {
            grid-template-columns: 1fr;
            gap: 24px;
            margin-bottom: 24px;
          }

          .footer-about {
            grid-column: auto;
          }

          .footer-contact {
            grid-column: auto;
          }

          .footer-title {
            font-size: 15px;
          }

          .footer-links a {
            font-size: 13px;
          }

          .contact-item {
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .footer-new {
            padding: 24px 0 12px;
            margin-top: 32px;
          }

          .footer-container {
            gap: 16px;
            margin-bottom: 16px;
          }

          .footer-title {
            font-size: 14px;
          }

          .footer-description {
            font-size: 13px;
          }

          .footer-links a {
            font-size: 12px;
          }

          .contact-item {
            font-size: 12px;
          }

          .copyright {
            font-size: 12px;
          }
        }
      `}</style>
    </footer>
  );
}
