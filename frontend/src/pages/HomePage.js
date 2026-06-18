import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCT_CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories';
import '../styles.css';

export default function HomePage() {
  const categoriesRef = useRef(null);
  const footerRef = useRef(null);

  const categories = PRODUCT_CATEGORIES.map((name, index) => ({
    id: index + 1,
    name: name,
    description: `Explore our collection of ${name.toLowerCase()}`,
    color: CATEGORY_COLORS[name],
    icon: CATEGORY_ICONS[name]
  }));

  const handleShopNow = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLearnMore = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page-new">
      {/* Hero Section */}
      <section className="hero-section-new">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title-new">
              Everything Your
              <span className="hero-highlight"> Baby Needs</span>
            </h1>
            <p className="hero-description">
              Discover premium quality baby products with love and care. From clothing to toys, we have everything to make your little one's journey comfortable and joyful.
            </p>
            <div className="hero-buttons">
              <button className="btn-shop-now" onClick={handleShopNow}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Shop Now
              </button>
              <button className="btn-learn-more" onClick={handleLearnMore}>
                Learn More
              </button>
            </div>
          </div>
          
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section-new" ref={categoriesRef}>
        <div className="container">
          <h2 className="section-title-new">Shop by Category</h2>
          <p className="section-subtitle">Explore our carefully curated collections designed with love for your precious little one</p>
          
          <div className="categories-grid-large">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/search?category=${encodeURIComponent(category.name)}`} 
                className="category-card-new"
              >
                <div className="category-badge-large" style={{ backgroundColor: category.color }}>
                  {category.icon}
                </div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <span className="explore-link">Explore Collection →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Reference */}
      <div ref={footerRef} style={{ height: '1px' }}></div>

      <style>{`
        .home-page-new {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .hero-section-new {
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
          padding: 60px 20px;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .hero-title-new {
          font-size: 3.5rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
          margin: 0;
        }

        .hero-highlight {
          color: #F06292;
        }

        .hero-description {
          font-size: 1.1rem;
          color: #555;
          line-height: 1.8;
          margin: 0;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .btn-shop-now {
          background: #F06292;
          color: white;
          padding: 14px 32px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-shop-now:hover {
          background: #EC407A;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(240, 98, 146, 0.3);
        }

        .btn-learn-more {
          background: white;
          color: #333;
          padding: 14px 32px;
          border-radius: 50px;
          border: 2px solid #ddd;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-learn-more:hover {
          border-color: #F06292;
          color: #F06292;
        }

        .hero-right {
          display: flex;
          justify-content: center;
        }

        .hero-image {
          width: 100%;
          max-width: 500px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .hero-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .categories-section-new {
          padding: 80px 20px;
          background: white;
        }

        .recommendations-section-home {
          padding: 60px 20px;
          background: #f8f9fa;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-title-new {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          text-align: center;
          margin: 0 0 12px 0;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #666;
          text-align: center;
          margin: 0 0 48px 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .categories-grid-large {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .category-card-new {
          background: #FFE4E1;
          border-radius: 16px;
          padding: 32px 24px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 2px solid transparent;
        }

        .category-card-new:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          border-color: #F06292;
          background: #FFCCCB;
        }

        .category-badge-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease;
        }

        .category-card-new:hover .category-badge-large {
          transform: scale(1.1);
        }

        .category-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .category-description {
          font-size: 0.9rem;
          color: #666;
          margin: 0 0 16px 0;
          flex-grow: 1;
          line-height: 1.5;
        }

        .explore-link {
          color: #F06292;
          font-weight: 600;
          display: inline-block;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .category-card-new:hover .explore-link {
          color: #EC407A;
          transform: translateX(4px);
        }

        @media (max-width: 1200px) {
          .categories-grid-large {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .hero-title-new {
            font-size: 2.5rem;
          }

          .categories-grid-large {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .hero-section-new {
            padding: 40px 16px;
          }

          .hero-title-new {
            font-size: 2rem;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .btn-shop-now,
          .btn-learn-more {
            width: 100%;
            justify-content: center;
          }

          .categories-section-new {
            padding: 60px 16px;
          }

          .section-title-new {
            font-size: 2rem;
          }

          .categories-grid-large {
            grid-template-columns: repeat(2, 1fr);
          }

          .category-card-new {
            padding: 24px 16px;
          }

          .category-badge-large {
            width: 64px;
            height: 64px;
            font-size: 32px;
          }

          .category-name {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .hero-title-new {
            font-size: 1.75rem;
          }

          .hero-description {
            font-size: 0.95rem;
          }

          .section-title-new {
            font-size: 1.5rem;
          }

          .categories-grid-large {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .category-card-new {
            padding: 20px 16px;
          }

          .category-badge-large {
            width: 56px;
            height: 56px;
            font-size: 28px;
          }

          .category-name {
            font-size: 1rem;
          }

          .category-description {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
