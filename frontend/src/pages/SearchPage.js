import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import Loading from '../components/Loading';
import { CartContext } from '../context/CartContext';
import '../styles.css';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSearchTerm(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts(0, 20);
      setProducts(response.data.content || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        {/* Search Section */}
        <section className="search-section">
          <div className="search-header">
            <h1 className="search-title">Search Products</h1>
            <p className="search-subtitle">Find the perfect baby products</p>
          </div>
          
          <div className="search-bar-wrapper">
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-large"
            />
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
        </section>

        {/* Results Section */}
        <section className="results-section">
          <div className="results-header">
            <h2 className="results-title">
              {searchTerm ? `Results for "${searchTerm}"` : 'All Products'}
            </h2>
            <span className="results-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </span>
          </div>

          {loading ? (
            <Loading />
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid-compact">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card-compact">
                  {/* Product Image */}
                  <div className="product-image-compact">
                    <img 
                      src={product.imageUrl || 'https://via.placeholder.com/200x150?text=No+Image'} 
                      alt={product.name}
                      onClick={() => navigate(`/product/${product.id}`)}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="product-info-compact">
                    {/* Product Name */}
                    <h3 className="product-name-compact">{product.name}</h3>

                    {/* Price and Stock */}
                    <div className="price-stock-row">
                      <span className="product-price-compact">₹{product.price}</span>
                      <span className="product-stock-compact">Stock: {product.quantity}</span>
                    </div>

                    {/* Category Badge */}
                    <div className="category-badge-compact">
                      {product.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <svg className="no-results-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <h3 className="no-results-title">No Products Found</h3>
              <p className="no-results-text">Try searching with different keywords or browse all products</p>
              <button 
                className="btn-browse-all"
                onClick={() => setSearchTerm('')}
              >
                View All Products
              </button>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .search-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-section {
          margin-bottom: 60px;
        }

        .search-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .search-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #780815;
          margin: 0 0 8px 0;
        }

        .search-subtitle {
          font-size: 1.1rem;
          color: #666;
          margin: 0;
        }

        .search-bar-wrapper {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-input-large {
          width: 100%;
          padding: 16px 20px 16px 48px;
          border: 2px solid #ddd;
          border-radius: 50px;
          font-size: 1rem;
          background: white;
          color: #333;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .search-input-large::placeholder {
          color: #999;
        }

        .search-input-large:focus {
          outline: none;
          border-color: #F06292;
          box-shadow: 0 4px 16px rgba(240, 98, 146, 0.2);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          pointer-events: none;
        }

        .results-section {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .results-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .results-count {
          font-size: 1rem;
          color: #999;
          font-weight: 500;
        }

        .products-grid-compact {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .product-card-compact {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid #f0f0f0;
        }

        .product-card-compact:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .product-image-compact {
          width: 100%;
          height: 140px;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image-compact img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card-compact:hover .product-image-compact img {
          transform: scale(1.05);
        }

        .product-info-compact {
          padding: 16px;
        }

        .product-name-compact {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 12px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .price-stock-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.85rem;
        }

        .product-price-compact {
          font-size: 1.1rem;
          font-weight: 700;
          color: #F06292;
        }

        .product-stock-compact {
          color: #999;
          font-size: 0.8rem;
        }

        .category-badge-compact {
          display: inline-block;
          background: #FFE4E1;
          color: #F06292;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .no-results {
          text-align: center;
          padding: 60px 20px;
        }

        .no-results-icon {
          color: #ddd;
          margin-bottom: 24px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .no-results-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .no-results-text {
          font-size: 1rem;
          color: #666;
          margin: 0 0 24px 0;
        }

        .btn-browse-all {
          background: #F06292;
          color: white;
          padding: 12px 28px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .btn-browse-all:hover {
          background: #EC407A;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(240, 98, 146, 0.3);
        }

        @media (max-width: 1400px) {
          .products-grid-compact {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .products-grid-compact {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .search-page {
            padding: 24px 16px;
          }

          .search-title {
            font-size: 2rem;
          }

          .results-section {
            padding: 24px;
          }

          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .products-grid-compact {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .product-image-compact {
            height: 120px;
          }

          .product-info-compact {
            padding: 12px;
          }

          .product-name-compact {
            font-size: 0.9rem;
            margin-bottom: 8px;
          }
        }

        @media (max-width: 480px) {
          .search-title {
            font-size: 1.5rem;
          }

          .results-title {
            font-size: 1.25rem;
          }

          .products-grid-compact {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .product-image-compact {
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
}
