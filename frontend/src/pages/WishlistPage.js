// frontend/src/pages/WishlistPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import { CartContext } from '../context/CartContext';
import Loading from '../components/Loading';
import '../styles.css';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      setWishlistItems(response.data || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      displayMessage('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlistItems(wishlistItems.filter(item => item.productId !== productId));
      displayMessage('Removed from wishlist', 'success');
    } catch (error) {
      displayMessage('Failed to remove from wishlist', 'error');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      setAddingToCart(item.productId);
      await addToCart(item.productId, 1);
      displayMessage(`${item.productName} added to cart!`, 'success');
    } catch (error) {
      displayMessage(error.response?.data?.message || 'Failed to add to cart', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  const displayMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return null;
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        {message && (
          <div className={`message-alert message-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="wishlist-header">
          <h1 className="page-title"> My Wishlist</h1>
          <p className="wishlist-count">
            {wishlistItems.length === 0 
              ? 'Your wishlist is empty' 
              : `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} in your wishlist`}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist card">
            <p className="empty-icon">❤️</p>
            <p className="empty-text">Your wishlist is empty</p>
            <p className="empty-subtext">Add baby products you love to your wishlist to save them for later</p>
            <Link to="/menu" className="btn btn-primary btn-large">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item.id} className="wishlist-card card">
                <Link to={`/product/${item.productId}`} className="card-image-link">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="card-image"
                  />
                </Link>

                <div className="card-body">
                  <Link 
                    to={`/product/${item.productId}`}
                    className="card-title-link"
                  >
                    <h3 className="card-title">{item.productName}</h3>
                  </Link>
                  
                  <p className="card-category">{item.category}</p>

                  <p className="card-date">
                    Added {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  <div className="card-actions">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={addingToCart === item.productId}
                      className="btn btn-primary btn-large"
                    >
                      {addingToCart === item.productId ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId)}
                      className="btn btn-secondary btn-large"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .wishlist-page {
          min-height: 100vh;
          padding: var(--spacing-xl) var(--spacing-md);
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
        }

        .wishlist-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .page-title {
          text-align: center;
          margin-bottom: var(--spacing-md);
          font-size: 2.5rem;
        }

        .wishlist-count {
          color: var(--dark-gray);
          font-size: 1rem;
          margin: 0;
        }

        .message-alert {
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          margin-bottom: var(--spacing-lg);
          font-weight: 600;
        }

        .message-success {
          background: #C8E6C9;
          color: #2E7D32;
        }

        .message-error {
          background: #FFCDD2;
          color: #C62828;
        }

        .message-info {
          background: #BBDEFB;
          color: #1565C0;
        }

        .empty-wishlist {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }

        .empty-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: var(--spacing-md);
        }

        .empty-subtext {
          color: var(--dark-gray);
          margin-bottom: var(--spacing-lg);
          text-align: center;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-lg);
        }

        .wishlist-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .wishlist-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .card-image-link {
          display: block;
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: var(--light-gray);
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .card-image-link:hover .card-image {
          transform: scale(1.05);
        }

        .card-body {
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          flex: 1;
        }

        .card-title-link {
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
        }

        .card-title-link:hover {
          color: var(--primary-pink);
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-category {
          font-size: 0.85rem;
          color: var(--gray);
          margin: 0;
        }

        .card-date {
          font-size: 0.8rem;
          color: var(--gray);
          margin: 0;
        }

        .card-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-top: auto;
        }

        @media (max-width: 1024px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-md);
          }

          .card-body {
            padding: var(--spacing-md);
          }
        }

        @media (max-width: 480px) {
          .wishlist-page {
            padding: var(--spacing-lg) var(--spacing-md);
          }

          .page-title {
            font-size: 1.75rem;
          }

          .wishlist-grid {
            grid-template-columns: 1fr;
          }

          .card-image-link {
            height: 150px;
          }

          .empty-wishlist {
            padding: var(--spacing-lg);
          }
        }
      `}</style>
    </div>
  );
}
