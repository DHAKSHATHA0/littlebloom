// frontend/src/pages/SellerOrdersPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { OrderNotificationContext } from '../context/OrderNotificationContext';
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

export default function SellerOrdersPage() {
  const { user } = useContext(AuthContext);
  const { markOrdersAsViewed } = useContext(OrderNotificationContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [orderRatings, setOrderRatings] = useState({});

  useEffect(() => {
    if (user && user.role !== 'SELLER') {
      navigate('/');
    }
    fetchSellerOrders();
    markOrdersAsViewed(); // Clear notifications when page loads
  }, [user, navigate]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/seller/all');
      setOrders(response.data || []);
      
      // Fetch ratings for delivered orders
      const deliveredOrders = (response.data || []).filter(order => 
        order.status?.toUpperCase() === 'DELIVERED'
      );
      
      deliveredOrders.forEach(order => {
        fetchOrderRating(order.orderId || order.id, order.productId);
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderRating = async (orderId, productId) => {
    try {
      const response = await api.get(`/reviews/order/${orderId}/product/${productId}`);
      setOrderRatings(prev => ({
        ...prev,
        [orderId]: response.data.rating
      }));
    } catch (error) {
      // If no rating found, set as null (expected for unrated orders)
      setOrderRatings(prev => ({
        ...prev,
        [orderId]: null
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'delivered';
      case 'PENDING':
        return 'pending';
      case 'CONFIRMED':
        return 'confirmed';
      case 'OUT_FOR_DELIVERY':
        return 'out-for-delivery';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status?.toUpperCase()] || 'Pending';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'OUT_FOR_DELIVERY',
      'OUT_FOR_DELIVERY': 'DELIVERED',
      'DELIVERED': null,
      'CANCELLED': null
    };
    return statusFlow[currentStatus?.toUpperCase()];
  };

  const getNextStatusLabel = (currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    return nextStatus ? getStatusLabel(nextStatus) : null;
  };

  const handleStatusUpdate = async (orderItemId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) {
      toast.info('Order is already in final status');
      return;
    }

    setUpdatingId(orderItemId);
    try {
      const response = await api.put(`/orders/item/${orderItemId}/status`, {
        status: nextStatus
      });

      console.log('Status update response:', response.data);
      toast.success(`Order status updated to ${getStatusLabel(nextStatus)}`);
      
      // Update local state immediately
      setOrders(orders.map(order => 
        order.id === orderItemId 
          ? { ...order, status: nextStatus }
          : order
      ));
      
      // Fetch fresh data after a short delay
      setTimeout(() => {
        fetchSellerOrders();
      }, 500);
    } catch (error) {
      console.error('Failed to update order status:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const canUpdateStatus = (status) => {
    const finalStatuses = ['DELIVERED', 'CANCELLED'];
    return !finalStatuses.includes(status?.toUpperCase());
  };

  const renderRating = (orderId, status) => {
    // Only show rating for delivered orders
    if (status?.toUpperCase() !== 'DELIVERED') {
      return <span className="no-rating">-</span>;
    }
    
    const rating = orderRatings[orderId];
    if (rating === null || rating === undefined) {
      return <span className="no-rating">No Rating</span>;
    }
    
    return (
      <div className="rating-display">
        <div className="stars">
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
              ★
            </span>
          ))}
        </div>
        <span className="rating-value">({rating})</span>
      </div>
    );
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status?.toUpperCase() === filter.toUpperCase());

  if (loading) {
    return null;
  }

  return (
    <div className="seller-orders-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <h1 className="orders-title">📦 Latest Orders</h1>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed
            </button>
            <button 
              className={`filter-btn ${filter === 'out_for_delivery' ? 'active' : ''}`}
              onClick={() => setFilter('out_for_delivery')}
            >
              Out for Delivery
            </button>
            <button 
              className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-section">
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Buyer ID</th>
                  <th>Buyer Name</th>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="order-row">
                      <td className="buyer-id">
                        <span className="buyer-id-badge">
                          {order.buyerIdFormatted || 'N/A'}
                        </span>
                      </td>
                      <td className="buyer-name">{order.buyerName || 'Unknown'}</td>
                      <td className="order-id">{order.orderId || order.id}</td>
                      <td className="product-name">{order.productName || 'N/A'}</td>
                      <td className="category">{order.category || 'N/A'}</td>
                      <td className="quantity">{order.quantity || 0}</td>
                      <td className="price">₹{order.price || 0}</td>
                      <td className="date">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="rating">
                        {renderRating(order.orderId || order.id, order.status)}
                      </td>
                      <td className="status">
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="action">
                        {canUpdateStatus(order.status) ? (
                          <button
                            className="action-btn update-btn"
                            onClick={() => handleStatusUpdate(order.id, order.status)}
                            disabled={updatingId === order.id}
                            title={`Update to ${getNextStatusLabel(order.status)}`}
                          >
                            {updatingId === order.id ? (
                              <>
                                <span className="spinner-small"></span>
                                Updating...
                              </>
                            ) : (
                              <>
                                ✓ {getNextStatusLabel(order.status)}
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="action-complete">✓ Complete</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="no-data">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="orders-summary">
          <div className="summary-card">
            <p className="summary-label">Total Orders</p>
            <p className="summary-value">{orders.length}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Pending</p>
            <p className="summary-value">{orders.filter(o => o.status?.toUpperCase() === 'PENDING').length}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Confirmed</p>
            <p className="summary-value">{orders.filter(o => o.status?.toUpperCase() === 'CONFIRMED').length}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Delivered</p>
            <p className="summary-value">{orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length}</p>
          </div>
        </div>
      </div>

      <style>{`
        .seller-orders-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
          padding: 40px 20px;
        }

        .orders-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #F06292;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-small {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 6px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .orders-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .orders-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .orders-title {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-btn {
          background: white;
          border: 2px solid #E5E7EB;
          color: #666;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #F06292;
          color: #F06292;
        }

        .filter-btn.active {
          background: #F06292;
          color: white;
          border-color: #F06292;
        }

        .orders-section {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
          border: 2px solid #D1E7F7;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table thead {
          background: #F0F8FF;
          border-bottom: 2px solid #D1E7F7;
        }

        .orders-table th {
          padding: 16px;
          text-align: left;
          font-weight: 700;
          color: #333;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .orders-table td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          color: #333;
        }

        .orders-table tbody tr:hover {
          background: #F8FBFF;
        }

        .buyer-id {
          font-weight: 600;
          color: #F06292;
        }

        .buyer-id-badge {
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .buyer-name {
          font-weight: 500;
          color: #333;
        }

        .order-id {
          font-weight: 600;
          color: #333;
        }

        .product-name {
          font-weight: 500;
        }

        .category {
          color: #666;
        }

        .quantity {
          text-align: center;
          font-weight: 600;
        }

        .price {
          font-weight: 700;
          color: #F06292;
        }

        .date {
          color: #666;
        }

        .rating {
          text-align: center;
        }

        .rating-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stars {
          display: flex;
          gap: 1px;
        }

        .star {
          font-size: 14px;
          color: #ddd;
        }

        .star.filled {
          color: #FFB300;
        }

        .rating-value {
          font-size: 11px;
          color: #666;
          font-weight: 500;
        }

        .no-rating {
          font-size: 12px;
          color: #999;
          font-style: italic;
        }

        .status {
          text-align: center;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-badge.pending {
          background: #FFF3CD;
          color: #856404;
        }

        .status-badge.confirmed {
          background: #D1ECF1;
          color: #0C5460;
        }

        .status-badge.out-for-delivery {
          background: #E2E3E5;
          color: #383D41;
        }

        .status-badge.delivered {
          background: #D4EDDA;
          color: #155724;
        }

        .status-badge.cancelled {
          background: #F8D7DA;
          color: #721C24;
        }

        .action {
          text-align: center;
        }

        .action-btn {
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
        }

        .action-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .action-complete {
          color: #10B981;
          font-weight: 600;
          font-size: 12px;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 60px 16px !important;
          font-size: 16px;
        }

        .orders-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          text-align: center;
          border-left: 4px solid #F06292;
        }

        .summary-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-value {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .orders-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .filter-buttons {
            width: 100%;
          }

          .orders-table {
            font-size: 13px;
          }

          .orders-table th,
          .orders-table td {
            padding: 12px;
          }

          .action-btn {
            padding: 6px 12px;
            font-size: 11px;
          }
        }

        @media (max-width: 768px) {
          .seller-orders-page {
            padding: 20px 12px;
          }

          .orders-title {
            font-size: 24px;
          }

          .filter-buttons {
            gap: 8px;
          }

          .filter-btn {
            padding: 6px 12px;
            font-size: 12px;
          }

          .orders-section {
            padding: 16px;
          }

          .orders-table {
            font-size: 12px;
          }

          .orders-table th,
          .orders-table td {
            padding: 10px 8px;
          }

          .orders-summary {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .seller-orders-page {
            padding: 16px 8px;
          }

          .orders-title {
            font-size: 20px;
          }

          .filter-buttons {
            flex-direction: column;
            width: 100%;
          }

          .filter-btn {
            width: 100%;
          }

          .orders-table {
            font-size: 11px;
          }

          .orders-table th,
          .orders-table td {
            padding: 8px 6px;
          }

          .action-btn {
            padding: 6px 10px;
            font-size: 10px;
          }

          .orders-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
