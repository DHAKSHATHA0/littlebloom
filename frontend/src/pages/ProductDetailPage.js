import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, orderAPI, reviewAPI, wishlistAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Loading from '../components/Loading';
import '../styles.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const recommendationsRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [dsRecommendations, setDsRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [userOrders, setUserOrders] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [showDsRecommendations, setShowDsRecommendations] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchProduct();
    if (user) {
      fetchUserOrders();
      checkWishlistStatus();
    }
  }, [id, user]);

  // Refresh product data when page becomes visible (for stock updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchProduct(); // Refresh stock when user returns to page
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchRecommendedProducts();
    }
  }, [product]);

  // Scroll listener for showing DS recommendations
  useEffect(() => {
    const handleScroll = () => {
      if (recommendationsRef.current) {
        const element = recommendationsRef.current;
        const rect = element.getBoundingClientRect();
        
        // Show recommendations when element comes into view
        if (rect.top < window.innerHeight && !showDsRecommendations && !loadingRecommendations) {
          setShowDsRecommendations(true);
          fetchDSRecommendations();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [product, showDsRecommendations, loadingRecommendations]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getProductById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      displayMessage('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const response = await productAPI.getAllProducts(0, 50);
      const allProducts = response.data.content || [];
      
      const recommended = allProducts.filter(p => 
        p.id !== product.id && 
        (p.category === product.category || p.sellerId === product.sellerId)
      ).slice(0, 5);
      
      setRecommendedProducts(recommended);
    } catch (error) {
      console.error('Failed to fetch recommended products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const [reviewsRes, avgRatingRes, countRes] = await Promise.all([
        reviewAPI.getProductReviews(id),
        reviewAPI.getProductAverageRating(id),
        reviewAPI.getProductReviewCount(id)
      ]);
      setReviews(reviewsRes.data || []);
      setAverageRating(avgRatingRes.data || 0);
      setReviewCount(countRes.data || 0);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders();
      const orders = Array.isArray(response.data) ? response.data : response.data.orders || [];
      const ordersWithProduct = orders.filter(order =>
        order.items && order.items.some(item => item.productId === parseInt(id)) &&
        order.status === 'Delivered'
      );
      setUserOrders(ordersWithProduct);
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.isInWishlist(id);
      setIsInWishlist(response.data);
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const fetchDSRecommendations = async () => {
    if (!product) return;
    
    setLoadingRecommendations(true);
    try {
      // Get all products for the recommendation engine
      const allProductsRes = await productAPI.getAllProducts(0, 100);
      const allProducts = allProductsRes.data.content || [];
      
      // Call Python recommendation API
      const response = await fetch('http://localhost:5000/recommendations/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: product.category,
          allProducts: allProducts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0,
            quantity: p.quantity || 0,
            imageUrl: p.imageUrl
          })),
          excludeId: parseInt(id),
          limit: 6
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDsRecommendations(result.data);
        }
      } else {
        console.error('Failed to fetch DS recommendations:', response.status);
        // Fallback to basic recommendations if Python API fails
        const fallback = allProducts
          .filter(p => p.category === product.category && p.id !== parseInt(id))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        setDsRecommendations(fallback);
      }
    } catch (error) {
      console.error('Failed to fetch data science recommendations:', error);
      // Fallback: get all products and filter by category
      try {
        const allProductsRes = await productAPI.getAllProducts(0, 100);
        const allProducts = allProductsRes.data.content || [];
        const basic = allProducts
          .filter(p => p.category === product.category && p.id !== parseInt(id))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        setDsRecommendations(basic);
      } catch (fallbackError) {
        console.error('Fallback recommendation failed:', fallbackError);
      }
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      displayMessage('Please login to add to wishlist', 'info');
      return;
    }

    setSavingWishlist(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(parseInt(id));
        displayMessage('Removed from wishlist', 'success');
      } else {
        await wishlistAPI.addToWishlist({ productId: parseInt(id) });
        displayMessage('Added to wishlist!', 'success');
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      displayMessage(error.response?.data?.message || 'Failed to update wishlist', 'error');
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      displayMessage('Please login to add items to cart', 'info');
      navigate('/login');
      return false;
    }

    try {
      await addToCart(product.id, quantity);
      displayMessage('Added to cart successfully!', 'success');
      setQuantity(1);
      // Refresh product data to show updated stock
      await fetchProduct();
      return true;
    } catch (error) {
      displayMessage(error.response?.data?.message || 'Failed to add to cart', 'error');
      return false;
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      displayMessage('Please login to buy items', 'info');
      navigate('/login');
      return;
    }
    navigate('/checkout', {
      state: {
        buyNowItem: {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: quantity,
          imageUrl: product.imageUrl
        }
      }
    });
  };

  const displayMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 3000);
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return null;
  }

  if (!product) {
    return (
      <div className="container">
        <div className="not-found">
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {message && (
          <div className={`message-alert message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Product Detail Section */}
        <div className="product-detail-container">
          {/* Left - Product Image */}
          <div className="product-image-section">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image"
            />
          </div>

          {/* Right - Product Info */}
          <div className="product-info-section">
            {/* Product Title */}
            <h1 className="product-title">{product.name}</h1>

            {/* Rating */}
            <div className="rating-section">
              {renderStars(Math.round(averageRating))}
              <span className="rating-value">{averageRating.toFixed(1)}</span>
              <span className="review-count">({reviewCount} reviews)</span>
            </div>

            {/* Description */}
            <p className="product-description">{product.description}</p>

            {/* Category & Stock */}
            <div className="product-meta">
              <div className="meta-item">
                <p className="meta-label">Category</p>
                <p className="meta-value">{product.category}</p>
              </div>
              <div className="meta-item">
                <p className="meta-label">Stock Available</p>
                <p className={`meta-value ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.quantity > 0 ? `${product.quantity} units` : 'Out of stock'}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="price-section">
              <p className="product-price">₹{product.price}</p>
            </div>

            {/* Quantity */}
            <div className="quantity-section">
              <label>Quantity:</label>
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="qty-btn"
                >
                  −
                </button>
                <span className="qty-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  disabled={quantity >= product.quantity}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className="btn-add-to-cart"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2h12c1.1 0 2 .9 2 2v2h2c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h2V4c0-1.1.9-2 2-2z"></path>
                  <path d="M9 6v2h6V6" fill="none" stroke="currentColor" strokeWidth="2"></path>
                </svg>
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.quantity <= 0}
                className="btn-buy-now"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26H22L17.82 12.46L19.91 18.72L12 14.54L4.09 18.72L6.18 12.46L2 8.26H8.91L12 2Z"></path>
                </svg>
                Buy Now
              </button>
              <button
                onClick={toggleWishlist}
                disabled={savingWishlist}
                className={`btn-wishlist ${isInWishlist ? 'active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <p className="badge-item">✓ Safe for babies - trusted brand</p>
              <p className="badge-item">✓ Quality certified products</p>
              <p className="badge-item">✓ Easy returns and refunds</p>
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        {recommendedProducts.length > 0 && (
          <div className="recommended-section">
            <h2 className="section-title">Recommended for you</h2>
            <div className="recommended-grid">
              {recommendedProducts.map((recProduct) => (
                <div 
                  key={recProduct.id} 
                  className="recommended-card"
                  onClick={() => navigate(`/product/${recProduct.id}`)}
                >
                  <div className="rec-image">
                    <img src={recProduct.imageUrl} alt={recProduct.name} />
                  </div>
                  <div className="rec-info">
                    <h4 className="rec-name">{recProduct.name}</h4>
                    <p className="rec-price">₹{recProduct.price}</p>
                    <span className="rec-category">{recProduct.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Science Recommendations Section - Appears on Scroll */}
        <div ref={recommendationsRef}>
          {loadingRecommendations && (
            <div className="ds-recommendations-section">
              <h2 className="section-title">
                🤖 AI-Powered Recommendations from Same Category
              </h2>
              <div className="recommendations-loader">
                <div className="spinner"></div>
                <p>Finding the best matches for you...</p>
              </div>
            </div>
          )}

          {!loadingRecommendations && dsRecommendations.length > 0 && (
            <div className="ds-recommendations-section">
              <h2 className="section-title">
                🤖 AI-Powered Recommendations from {product.category}
              </h2>
              <p className="recommendations-subtitle">
                Based on data science analysis of ratings, availability, and category similarity
              </p>
              <div className="ds-recommendations-grid">
                {dsRecommendations.map((recProduct) => (
                  <div 
                    key={recProduct.id} 
                    className="ds-recommendation-card"
                    onClick={() => navigate(`/product/${recProduct.id}`)}
                  >
                    <div className="ds-rec-image">
                      <img src={recProduct.imageUrl} alt={recProduct.name} />
                      {recProduct.quantity > 0 && (
                        <span className="in-stock-badge">In Stock</span>
                      )}
                    </div>
                    <div className="ds-rec-info">
                      <h4 className="ds-rec-name">{recProduct.name}</h4>
                      <div className="ds-rec-rating">
                        <span className="stars">
                          {'★'.repeat(Math.round(recProduct.rating || 0))}
                          {'☆'.repeat(5 - Math.round(recProduct.rating || 0))}
                        </span>
                        <span className="rating-count">
                          {recProduct.rating ? recProduct.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                      <p className="ds-rec-price">₹{recProduct.price}</p>
                      <button 
                        className="ds-rec-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${recProduct.id}`);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .product-detail-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
        }

        .message-alert {
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
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

        .product-detail-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 80px;
          align-items: flex-start;
        }

        .product-image-section {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .product-image {
          width: 100%;
          max-width: 450px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          background: white;
          padding: 20px;
        }

        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .product-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stars-container {
          display: flex;
          gap: 4px;
        }

        .star {
          font-size: 1.5rem;
          color: #BDBDBD;
        }

        .star.filled {
          color: #FFC107;
        }

        .rating-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .review-count {
          color: #999;
          font-size: 0.95rem;
        }

        .product-description {
          color: #555;
          line-height: 1.6;
          margin: 0;
          font-size: 1rem;
        }

        .product-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-label {
          font-size: 0.85rem;
          color: #999;
          margin: 0;
          font-weight: 600;
        }

        .meta-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .meta-value.in-stock {
          color: #2E7D32;
        }

        .meta-value.out-of-stock {
          color: #C62828;
        }

        .price-section {
          display: flex;
          align-items: center;
        }

        .product-price {
          font-size: 2.5rem;
          font-weight: 700;
          color: #F06292;
          margin: 0;
        }

        .quantity-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .quantity-section label {
          font-weight: 600;
          color: #1a1a1a;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
        }

        .qty-btn {
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 1.2rem;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-display {
          padding: 8px 16px;
          font-weight: 600;
          color: #1a1a1a;
          min-width: 50px;
          text-align: center;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-add-to-cart,
        .btn-buy-now,
        .btn-wishlist {
          padding: 14px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1rem;
          border: 2px solid transparent;
        }

        .btn-add-to-cart {
          flex: 1;
          background: white;
          color: #F06292;
          border: 2px solid #F06292;
        }

        .btn-add-to-cart:hover {
          background: #FCE4EC;
        }

        .btn-buy-now {
          flex: 1;
          background: #F06292;
          color: white;
        }

        .btn-buy-now:hover {
          background: #EC407A;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(240, 98, 146, 0.3);
        }

        .btn-wishlist {
          width: 50px;
          background: white;
          color: #F06292;
          border: 2px solid #F06292;
          padding: 14px;
        }

        .btn-wishlist:hover {
          background: #FCE4EC;
        }

        .btn-wishlist.active {
          background: #FFCDD2;
          color: #C62828;
          border-color: #C62828;
        }

        .trust-badges {
          background: #E3F2FD;
          border: 1px solid #1565C0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .badge-item {
          margin: 0;
          color: #1565C0;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .recommended-section {
          margin-top: 80px;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 32px 0;
        }

        .recommended-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }

        .recommended-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .recommended-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .rec-image {
          width: 100%;
          height: 140px;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rec-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .recommended-card:hover .rec-image img {
          transform: scale(1.05);
        }

        .rec-info {
          padding: 16px;
        }

        .rec-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rec-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: #F06292;
          margin: 0 0 8px 0;
        }

        .rec-category {
          display: inline-block;
          background: #FFE4E1;
          color: #F06292;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .not-found {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 1024px) {
          .product-detail-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .recommended-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .product-detail-page {
            padding: 24px 16px;
          }

          .product-title {
            font-size: 2rem;
          }

          .product-price {
            font-size: 2rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-wishlist {
            width: 100%;
          }

          .recommended-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .section-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .product-detail-container {
            gap: 24px;
            margin-bottom: 40px;
          }

          .product-title {
            font-size: 1.5rem;
          }

          .product-price {
            font-size: 1.75rem;
          }

          .recommended-grid {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 1.25rem;
          }
        }

        /* Data Science Recommendations Styles */
        .ds-recommendations-section {
          margin-top: 80px;
          padding: 40px;
          background: linear-gradient(135deg, #F3E5F5 0%, #FCE4EC 100%);
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(240, 98, 146, 0.15);
        }

        .recommendations-subtitle {
          color: #999;
          font-size: 0.95rem;
          margin: 8px 0 0 0;
          text-align: center;
        }

        .ds-recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 24px;
          margin-top: 30px;
        }

        .ds-recommendation-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
        }

        .ds-recommendation-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 28px rgba(240, 98, 146, 0.2);
        }

        .ds-rec-image {
          width: 100%;
          height: 180px;
          background: #f5f5f5;
          position: relative;
          overflow: hidden;
        }

        .ds-rec-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .ds-recommendation-card:hover .ds-rec-image img {
          transform: scale(1.08);
        }

        .in-stock-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #2E7D32;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .ds-rec-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
        }

        .ds-rec-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ds-rec-rating {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stars {
          font-size: 0.8rem;
          color: #FFC107;
        }

        .rating-count {
          font-size: 0.75rem;
          color: #999;
          font-weight: 500;
        }

        .ds-rec-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: #F06292;
          margin: 8px 0 0 0;
        }

        .ds-rec-button {
          padding: 10px 16px;
          background: #F06292;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .ds-rec-button:hover {
          background: #EC407A;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
        }

        .recommendations-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #F06292;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .recommendations-loader p {
          color: #999;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .ds-recommendations-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
          }

          .ds-recommendations-section {
            padding: 24px;
            margin-top: 40px;
          }

          .ds-rec-image {
            height: 140px;
          }

          .ds-rec-info {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
