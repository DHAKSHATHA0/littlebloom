// frontend/src/pages/MenuPage.js
import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import '../styles.css';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else if (search) {
      searchProducts();
    } else {
      fetchProducts();
    }
  }, [selectedCategory, search]);

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAllProducts(0, 20);
      setProducts(response.data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (category) => {
    setLoading(true);
    try {
      const response = await productAPI.getProductsByCategory(category, 0, 20);
      setProducts(response.data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!search.trim()) return fetchProducts();

    setLoading(true);
    try {
      const response = await productAPI.searchProducts(search, 0, 20);
      setProducts(response.data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-page">
      <div className="container">
        <h1 className="page-title">🛍️ Browse Products</h1>

        {/* Search Bar */}
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Categories */}
        <div className="categories-section">
          <h3 className="categories-title">Categories</h3>
          <div className="categories-list">
            <button
              onClick={() => setSelectedCategory('')}
              className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        {loading ? (
          null
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="no-products card">
            <p className="no-products-icon">🔍</p>
            <p className="no-products-text">Product Not Found</p>
            <p className="no-products-subtext">Try searching with different keywords</p>
          </div>
        )}
      </div>

      <style>{`
        .menu-page {
          min-height: 100vh;
          padding: var(--spacing-xl) var(--spacing-md);
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
        }

        .page-title {
          text-align: center;
          margin-bottom: var(--spacing-xl);
          font-size: 2.5rem;
        }

        .search-section {
          margin-bottom: var(--spacing-xl);
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid var(--medium-gray);
          border-radius: var(--radius-lg);
          font-size: 1rem;
          background: white;
          color: var(--text-dark);
          transition: all 0.3s ease;
        }

        .search-input::placeholder {
          color: var(--gray);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-pink);
          box-shadow: 0 0 0 3px rgba(240, 98, 146, 0.1);
        }

        .categories-section {
          margin-bottom: var(--spacing-xl);
        }

        .categories-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: var(--spacing-lg);
        }

        .categories-list {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 10px 20px;
          border: 2px solid var(--medium-gray);
          border-radius: var(--radius-lg);
          background: white;
          color: var(--text-dark);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .category-btn:hover {
          border-color: var(--primary-pink);
          background: var(--very-light-pink);
        }

        .category-btn.active {
          background: linear-gradient(135deg, var(--primary-pink) 0%, #EC407A 100%);
          color: white;
          border-color: var(--primary-pink);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-lg);
        }

        .no-products {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .no-products-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }

        .no-products-text {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: var(--spacing-sm);
        }

        .no-products-subtext {
          color: var(--dark-gray);
          margin: 0;
        }

        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .categories-list {
            gap: var(--spacing-sm);
          }

          .category-btn {
            padding: 8px 16px;
            font-size: 0.9rem;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .menu-page {
            padding: var(--spacing-lg) var(--spacing-md);
          }

          .page-title {
            font-size: 1.75rem;
          }

          .categories-list {
            flex-direction: column;
          }

          .category-btn {
            width: 100%;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
