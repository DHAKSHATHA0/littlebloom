import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { orderAPI, reviewAPI } from '../services/api';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState({});
  const [submittingRating, setSubmittingRating] = useState({});
  const [productRatings, setProductRatings] = useState({});
  const [submittedRatings, setSubmittedRatings] = useState({});
  const [existingReviews, setExistingReviews] = useState({});
  const [sellerDeliveredOrders, setSellerDeliveredOrders] = useState([]);
  const [orderRatings, setOrderRatings] = useState({});
  const [orderFeedback, setOrderFeedback] = useState({});

  useEffect(() => {
    if (user?.role === 'BUYER') {
      fetchDeliveredOrders();
    } else if (user?.role === 'SELLER') {
      fetchSellerDeliveredOrders();
    }
  }, [user]);

  const fetchDeliveredOrders = async () => {
    try {
      const response = await orderAPI.getBuyerOrdersAll();
      const delivered = response.data.filter(order => order.status === 'DELIVERED');
      setDeliveredOrders(delivered);
      
      // Fetch existing reviews for each delivered order
      delivered.forEach(order => {
        if (order.items && order.items.length > 0) {
          fetchProductRating(order.items[0].productId);
          fetchExistingReview(order.id, order.items[0].productId);
        }
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchExistingReview = async (orderId, productId) => {
    try {
      const response = await api.get(`/reviews/order/${orderId}/product/${productId}`);
      if (response.data) {
        setExistingReviews(prev => ({
          ...prev,
          [orderId]: {
            rating: response.data.rating,
            feedback: response.data.feedback
          }
        }));
      }
    } catch (error) {
      // No existing review found, which is normal
      console.log(`No existing review for order ${orderId}`);
    }
  };

  const fetchSellerDeliveredOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get('/orders/seller/all');
      const delivered = response.data.filter(order => order.status?.toUpperCase() === 'DELIVERED');
      
      console.log('Delivered orders from API:', delivered);
      console.log('Sample order data:', delivered[0]);
      
      setSellerDeliveredOrders(delivered);
      
      // Fetch ratings for each delivered order
      delivered.forEach(order => {
        fetchOrderRating(order.orderId, order.productId);
      });
    } catch (error) {
      console.error('Failed to fetch seller delivered orders:', error);
      toast.error('Failed to load delivered orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrderRating = async (orderId, productId) => {
    try {
      const response = await api.get(`/reviews/order/${orderId}/product/${productId}`);
      setOrderRatings(prev => ({
        ...prev,
        [orderId]: response.data.rating
      }));
      setOrderFeedback(prev => ({
        ...prev,
        [orderId]: response.data.feedback
      }));
    } catch (error) {
      // If no rating found, don't log error as it's expected for unrated orders
      setOrderRatings(prev => ({
        ...prev,
        [orderId]: null
      }));
      setOrderFeedback(prev => ({
        ...prev,
        [orderId]: null
      }));
    }
  };

  const fetchProductRating = async (productId) => {
    try {
      const response = await reviewAPI.getProductAverageRating(productId);
      setProductRatings(prev => ({
        ...prev,
        [productId]: response.data
      }));
    } catch (error) {
      console.error('Failed to fetch product rating:', error);
    }
  };

  const handleRating = (orderId, rating) => {
    setRatings(prev => ({
      ...prev,
      [orderId]: rating
    }));
  };

  const handleFeedback = (orderId, feedbackText) => {
    setFeedback(prev => ({
      ...prev,
      [orderId]: feedbackText
    }));
  };

  const submitRating = async (orderId, productId, rating) => {
    if (!productId) {
      toast.error('Product information not available');
      return;
    }

    if (!orderId) {
      toast.error('Order information not available');
      return;
    }

    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingRating(prev => ({
      ...prev,
      [orderId]: true
    }));

    try {
      const feedbackText = feedback[orderId] || '';
      console.log('Feedback for order', orderId, ':', feedbackText);
      
      const reviewData = {
        productId: parseInt(productId),
        orderId: parseInt(orderId),
        rating: parseInt(rating),
        feedback: feedbackText.trim() || `Rated ${rating} stars`
      };

      console.log('Submitting review with feedback:', reviewData);
      const response = await reviewAPI.createReview(reviewData);
      
      toast.success('Your rating and feedback have been submitted!');
      
      // Update existing reviews state
      setExistingReviews(prev => ({
        ...prev,
        [orderId]: {
          rating: rating,
          feedback: feedbackText.trim() || `Rated ${rating} stars`
        }
      }));
      
      // Clear form data
      setRatings(prev => {
        const newRatings = { ...prev };
        delete newRatings[orderId];
        return newRatings;
      });
      
      setFeedback(prev => {
        const newFeedback = { ...prev };
        delete newFeedback[orderId];
        return newFeedback;
      });
      
      // Refresh product rating
      fetchProductRating(productId);
      
    } catch (error) {
      console.error('Failed to submit rating:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to submit rating. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmittingRating(prev => ({
        ...prev,
        [orderId]: false
      }));
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star-icon ${star <= Math.round(rating) ? 'filled' : ''}`}>
            ★
          </span>
        ))}
        <span className="rating-value">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatBuyerId = (buyerIdFormatted) => {
    return buyerIdFormatted || 'Not assigned';
  };

  const formatPrice = (price) => {
    return `₹${price?.toLocaleString('en-IN') || 0}`;
  };

  const renderOrderRating = (orderId) => {
    const rating = orderRatings[orderId];
    if (rating === null || rating === undefined) {
      return <span className="no-rating">No Rating</span>;
    }
    return (
      <div className="rating-display-table">
        <div className="stars-table">
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={`star-table ${star <= rating ? 'filled' : ''}`}>
              ★
            </span>
          ))}
        </div>
        <span className="rating-value-table">({rating})</span>
      </div>
    );
  };

  return (
    <div className="profile-page">
      <div className="container profile-container">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account and view your orders</p>
        </div>

        <div className="profile-grid">
          <div className="profile-info-section">
            <div className="profile-card">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="avatar-badge">✓</div>
              </div>

              <div className="user-details">
                <div className="detail-item">
                  <span className="detail-icon">👤</span>
                  <div>
                    <p className="detail-label">Name</p>
                    <p className="detail-value">{user?.name}</p>
                  </div>
                </div>

                {user?.role === 'BUYER' && (
                  <div className="detail-item">
                    <span className="detail-icon">🆔</span>
                    <div>
                      <p className="detail-label">Buyer ID</p>
                      <p className="detail-value">{user?.buyerId || 'Not assigned'}</p>
                    </div>
                  </div>
                )}

                {user?.role === 'SELLER' && (
                  <div className="detail-item">
                    <span className="detail-icon">🆔</span>
                    <div>
                      <p className="detail-label">Seller ID</p>
                      <p className="detail-value">{user?.sellerId || 'Not assigned'}</p>
                    </div>
                  </div>
                )}

                <div className="detail-item">
                  <span className="detail-icon">✉️</span>
                  <div>
                    <p className="detail-label">Email</p>
                    <p className="detail-value">{user?.email}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <div>
                    <p className="detail-label">Address</p>
                    <p className="detail-value">{user?.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <div>
                    <p className="detail-label">Role</p>
                    <p className="detail-value role-badge">{user?.role}</p>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  onClick={() => navigate(user?.role === 'SELLER' ? '/seller/orders' : '/orders')}
                  className="btn-view-all"
                >
                  📦 View All Orders
                </button>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  className="btn-logout"
                >
                  ↪️ Logout
                </button>
              </div>
            </div>
          </div>

          <div className="delivered-orders-section">
            {user?.role === 'SELLER' ? (
              <>
                <div className="orders-header">
                  <h2 className="orders-title">📦 Delivered Orders with Ratings</h2>
                </div>

                {loadingOrders ? (
                  <div className="loading">Loading orders...</div>
                ) : sellerDeliveredOrders.length > 0 ? (
                  <div className="seller-orders-table-container">
                    <div className="table-wrapper">
                      <table className="seller-orders-table">
                        <thead>
                          <tr>
                            <th>Buyer ID</th>
                            <th>Buyer Name</th>
                            <th>Order ID</th>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Delivered Date</th>
                            <th>Rating</th>
                            <th>Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sellerDeliveredOrders.map((order) => {
                            console.log(`Order ${order.id} dates:`, {
                              deliveredAt: order.deliveredAt,
                              updatedAt: order.updatedAt,
                              createdAt: order.createdAt
                            });
                            
                            let deliveryDate = 'Not Available';
                            
                            // Priority 1: Use deliveredAt if available (exact delivery timestamp)
                            if (order.deliveredAt) {
                              deliveryDate = formatDate(order.deliveredAt);
                              console.log(`Using deliveredAt for order ${order.id}:`, deliveryDate);
                            }
                            // Priority 2: Use updatedAt as fallback (for existing orders)
                            else if (order.updatedAt) {
                              deliveryDate = formatDate(order.updatedAt);
                              console.log(`Using updatedAt for order ${order.id}:`, deliveryDate);
                            }
                            // Priority 3: Use createdAt as last resort
                            else if (order.createdAt) {
                              deliveryDate = formatDate(order.createdAt);
                              console.log(`Using createdAt for order ${order.id}:`, deliveryDate);
                            }
                            
                            return (
                              <tr key={order.id} className="seller-order-row">
                                <td>
                                  <span className="buyer-id-badge">
                                    {formatBuyerId(order.buyerIdFormatted)}
                                  </span>
                                </td>
                                <td className="buyer-name">{order.buyerName || 'Unknown'}</td>
                                <td>{order.orderId || order.id}</td>
                                <td>{order.productName || 'N/A'}</td>
                                <td>{order.productCategory || order.category || 'N/A'}</td>
                                <td className="quantity">{order.quantity || 0}</td>
                                <td className="price">{formatPrice(order.price)}</td>
                                <td className="delivery-date">
                                  <span className={order.deliveredAt ? 'exact-date' : 'fallback-date'}>
                                    {deliveryDate}
                                  </span>
                                  {!order.deliveredAt && (
                                    <small className="date-note">*Estimated</small>
                                  )}
                                </td>
                                <td className="rating-cell">{renderOrderRating(order.orderId)}</td>
                                <td className="feedback-cell">
                                  {orderFeedback[order.orderId] ? (
                                    <span className="feedback-text" title={orderFeedback[order.orderId]}>
                                      {orderFeedback[order.orderId].length > 30 
                                        ? `${orderFeedback[order.orderId].substring(0, 30)}...` 
                                        : orderFeedback[order.orderId]}
                                    </span>
                                  ) : (
                                    <span className="no-feedback">No feedback</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="no-orders">
                    <p>No delivered orders yet</p>
                    <button
                      onClick={() => navigate('/seller/products')}
                      className="btn-shop-now"
                    >
                      Manage Products
                    </button>
                  </div>
                )}

                <div className="seller-quick-actions">
                  <button
                    onClick={() => navigate('/seller/products')}
                    className="btn-quick-action"
                  >
                    📦 Manage Products
                  </button>
                  <button
                    onClick={() => navigate('/seller/orders')}
                    className="btn-quick-action"
                  >
                    📋 View All Orders
                  </button>
                  <button
                    onClick={() => navigate('/seller/dashboard')}
                    className="btn-quick-action"
                  >
                    📈 Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="orders-header">
                  <h2 className="orders-title">📦 Latest Orders</h2>
                </div>

                {loadingOrders ? (
                  <div className="loading">Loading orders...</div>
                ) : deliveredOrders.length > 0 ? (
                  <div className="orders-list">
                    {deliveredOrders.map(order => (
                      <div key={order.id} className="order-card-compact">
                        <div className="order-row-1">
                          <div className="order-id-left">
                            <span className="order-id-tick">✓</span>
                            <span className="order-id-value">#{order.id}</span>
                          </div>
                          <div className="order-date-right">
                            <span className="order-date-label">Date</span>
                            <span className="order-date-value">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="order-row-2">
                          <div className="product-name-left">
                            <span className="product-label">Product</span>
                            <span className="product-name-value">
                              {order.items && order.items.length > 0 ? order.items[0].productName : 'N/A'}
                            </span>
                          </div>

                          <div className="rating-center">
                            <p className="rating-label">Rate this product</p>
                            <small className="rating-hint">💡 Add your thoughts to help other buyers!</small>
                            {existingReviews[order.id] ? (
                              <div className="existing-review">
                                <div className="submitted-rating">
                                  {renderStars(existingReviews[order.id].rating)}
                                </div>
                                <div className="submitted-feedback">
                                  <small>Your feedback:</small>
                                  <p className="feedback-display">
                                    {existingReviews[order.id].feedback && existingReviews[order.id].feedback.trim() 
                                      ? existingReviews[order.id].feedback 
                                      : `Rated ${existingReviews[order.id].rating} stars`}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="stars-compact">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      className={`star-compact ${ratings[order.id] >= star ? 'filled' : ''}`}
                                      onClick={() => handleRating(order.id, star)}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                                {ratings[order.id] && (
                                  <div className="feedback-input-section">
                                    <textarea
                                      className="feedback-input"
                                      placeholder="Share your experience... (e.g., 'Great product, fast delivery!')"
                                      value={feedback[order.id] || ''}
                                      onChange={(e) => handleFeedback(order.id, e.target.value)}
                                      rows={3}
                                      maxLength={200}
                                    />
                                    <div className="feedback-counter">
                                      {(feedback[order.id] || '').length}/200 characters
                                    </div>
                                    <button
                                      className="btn-submit-rating"
                                      onClick={() => submitRating(order.id, order.items[0].productId, ratings[order.id])}
                                      disabled={submittingRating[order.id]}
                                    >
                                      {submittingRating[order.id] ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          <div className="view-details-right">
                            <button 
                              onClick={() => handleViewDetails(order.items[0].productId)}
                              className="view-details-btn"
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-orders">
                    <p>No delivered orders yet</p>
                    <Link to="/home" className="btn-shop-now">
                      Start Shopping
                    </Link>
                  </div>
                )}

                {deliveredOrders.length > 0 && (
                  <Link to="/orders" className="view-all-orders">
                    View All Orders →
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
        }

        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-header {
          margin-bottom: 40px;
        }

        .profile-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .profile-subtitle {
          font-size: 1rem;
          color: #666;
          margin: 0;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 32px;
        }

        .profile-info-section {
          display: flex;
          flex-direction: column;
        }

        .profile-card {
          background: white;
          border-radius: 16px;
          padding: 32px 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .profile-avatar {
          position: relative;
          margin-bottom: 24px;
        }

        .avatar-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
        }

        .avatar-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          background: #4CAF50;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          border: 3px solid white;
        }

        .user-details {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
          text-align: left;
        }

        .detail-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .detail-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .detail-label {
          font-size: 0.85rem;
          color: #999;
          margin: 0 0 4px 0;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          word-break: break-word;
        }

        .role-badge {
          display: inline-block;
          background: #E3F2FD;
          color: #1565C0;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
        }

        .profile-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-view-all,
        .btn-logout {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: block;
          text-align: center;
        }

        .btn-view-all {
          background: #F06292;
          color: white;
        }

        .btn-view-all:hover {
          background: #EC407A;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
        }

        .btn-logout {
          background: #f5f5f5;
          color: #666;
        }

        .btn-logout:hover {
          background: #eeeeee;
        }

        .delivered-orders-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .seller-info-section {
          display: flex;
          flex-direction: column;
        }

        .seller-info-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .info-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .info-description {
          font-size: 1rem;
          color: #666;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .quick-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-quick-action {
          background: #F06292;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-quick-action:hover {
          background: #EC407A;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
        }

        .orders-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .orders-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-card-compact {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .order-row-1 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-id-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .order-id-tick {
          font-size: 1.2rem;
          color: #4CAF50;
          font-weight: bold;
        }

        .order-id-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .order-date-right {
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: right;
        }

        .order-date-label {
          font-size: 0.75rem;
          color: #999;
          font-weight: 500;
        }

        .order-date-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .order-row-2 {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .product-name-left {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
          text-align: left;
        }

        .product-label {
          font-size: 0.75rem;
          color: #999;
          font-weight: 500;
        }

        .product-name-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1a1a1a;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rating-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          background: #F3E5F5;
          border-radius: 6px;
          padding: 10px;
        }

        .rating-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .rating-hint {
          font-size: 0.7rem;
          color: #666;
          font-style: italic;
          margin-bottom: 4px;
        }

        .stars-compact {
          display: flex;
          gap: 4px;
          justify-content: center;
        }

        .star-compact {
          background: none;
          border: none;
          font-size: 20px;
          color: #ddd;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .star-compact:hover,
        .star-compact.filled {
          color: #FFB300;
          transform: scale(1.1);
        }

        .btn-submit-rating {
          background: #F06292;
          color: white;
          border: none;
          padding: 4px 10px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-submit-rating:hover:not(:disabled) {
          background: #EC407A;
        }

        .btn-submit-rating:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submitted-rating {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .stars-display {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .star-icon {
          font-size: 14px;
          color: #ddd;
        }

        .star-icon.filled {
          color: #FFB300;
        }

        .rating-value {
          font-size: 0.7rem;
          color: #666;
          margin-left: 2px;
        }

        .view-details-right {
          flex: 0 0 auto;
        }

        .view-details-btn {
          background: none;
          border: none;
          color: #F06292;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .view-details-btn:hover {
          color: #EC407A;
        }

        .no-orders {
          background: white;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .no-orders p {
          font-size: 1rem;
          color: #666;
          margin: 0 0 20px 0;
        }

        .btn-shop-now {
          display: inline-block;
          background: #F06292;
          color: white;
          padding: 10px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-shop-now:hover {
          background: #EC407A;
        }

        .view-all-orders {
          text-align: center;
          color: #F06292;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          display: block;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .view-all-orders:hover {
          color: #EC407A;
        }

        .loading {
          background: white;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          color: #666;
        }

        /* Seller Orders Table Styles */
        .seller-orders-table-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .seller-orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .seller-orders-table thead {
          background: #F0F8FF;
          border-bottom: 2px solid #D1E7F7;
        }

        .seller-orders-table th {
          padding: 16px;
          text-align: left;
          font-weight: 700;
          color: #333;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .seller-orders-table td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          color: #333;
        }

        .seller-orders-table tbody tr:hover {
          background: #F8FBFF;
        }

        .buyer-id-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 12px;
          display: inline-block;
          min-width: 65px;
          text-align: center;
          letter-spacing: 0.5px;
        }

        .buyer-name {
          font-weight: 500;
          color: #333;
          min-width: 100px;
        }

        .quantity {
          text-align: center;
          font-weight: 600;
          color: #333;
        }

        .price {
          font-weight: 700;
          color: #F06292;
        }

        .rating-cell {
          text-align: center;
        }

        .rating-display-table {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stars-table {
          display: flex;
          gap: 1px;
        }

        .star-table {
          font-size: 14px;
          color: #ddd;
        }

        .star-table.filled {
          color: #FFB300;
        }

        .rating-value-table {
          font-size: 11px;
          color: #666;
          font-weight: 500;
        }

        .no-rating {
          font-size: 12px;
          color: #999;
          font-style: italic;
        }

        .seller-quick-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 24px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        /* Delivery Date Styling */
        .delivery-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .exact-date {
          color: #27ae60;
          font-weight: 600;
        }

        .fallback-date {
          color: #f39c12;
          font-weight: 500;
        }

        .date-note {
          font-size: 10px;
          color: #999;
          font-style: italic;
        }

        /* Feedback Styling */
        .feedback-cell {
          max-width: 200px;
          word-wrap: break-word;
        }

        .feedback-text {
          color: #666;
          font-size: 13px;
          line-height: 1.4;
          display: block;
          padding: 6px;
          background: #f9f9f9;
          border-radius: 4px;
          border-left: 3px solid #f06292;
        }

        .no-feedback {
          color: #ccc;
          font-weight: 500;
          font-size: 13px;
          font-style: italic;
        }

        /* Buyer Rating Interface */
        .existing-review {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .submitted-feedback {
          text-align: center;
        }

        .submitted-feedback small {
          color: #666;
          font-size: 11px;
        }

        .feedback-display {
          margin: 4px 0 0 0;
          padding: 6px;
          background: #f0f8ff;
          border-radius: 4px;
          font-size: 12px;
          color: #333;
          border-left: 3px solid #4CAF50;
        }

        .feedback-input-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          align-items: center;
        }

        .feedback-input {
          width: 100%;
          max-width: 200px;
          padding: 8px;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 12px;
          resize: vertical;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .feedback-input:focus {
          outline: none;
          border-color: #F06292;
          box-shadow: 0 0 0 3px rgba(240, 98, 146, 0.15);
          transform: scale(1.02);
        }

        .feedback-input::placeholder {
          color: #999;
          font-style: italic;
        }

        .feedback-counter {
          font-size: 11px;
          color: #999;
          text-align: right;
          margin-top: -4px;
        }

        @media (max-width: 1024px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .profile-page {
            padding: 24px 16px;
          }

          .profile-title {
            font-size: 2rem;
          }

          .profile-grid {
            gap: 24px;
          }

          .order-card-compact {
            padding: 12px;
          }

          .order-row-1 {
            margin-bottom: 12px;
            padding-bottom: 10px;
          }

          .order-date-value {
            font-size: 0.9rem;
          }

          .order-id-value {
            font-size: 0.9rem;
          }

          .product-name-value {
            font-size: 0.85rem;
            max-width: 120px;
          }

          .star-compact {
            font-size: 18px;
          }

          .rating-center {
            padding: 8px;
          }
        }

        @media (max-width: 480px) {
          .order-row-2 {
            flex-direction: column;
            gap: 10px;
          }

          .product-name-left,
          .view-details-right {
            width: 100%;
          }

          .product-name-left {
            text-align: left;
          }

          .rating-center {
            width: 100%;
          }

          .order-date-value,
          .order-id-value {
            font-size: 0.85rem;
          }

          .product-name-value {
            font-size: 0.8rem;
            max-width: 100%;
          }

          .star-compact {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
