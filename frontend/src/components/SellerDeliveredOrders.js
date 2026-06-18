import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

export default function SellerDeliveredOrders() {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderRatings, setOrderRatings] = useState({});

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/seller/all');
      const delivered = response.data.filter(order => order.status?.toUpperCase() === 'DELIVERED');
      setDeliveredOrders(delivered);
      
      // Fetch ratings for each delivered order
      delivered.forEach(order => {
        fetchOrderRating(order.orderId, order.productId);
      });
    } catch (error) {
      console.error('Failed to fetch delivered orders:', error);
      toast.error('Failed to load delivered orders');
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
      // If no rating found, don't log error as it's expected for unrated orders
      setOrderRatings(prev => ({
        ...prev,
        [orderId]: null
      }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBuyerId = (buyerIdFormatted) => {
    return buyerIdFormatted || 'Not assigned';
  };

  const formatOrderId = (orderId) => {
    return `ORD-${String(orderId).padStart(4, '0')}`;
  };

  const formatPrice = (price) => {
    return `₹${price?.toLocaleString('en-IN') || 0}`;
  };

  const renderRating = (orderId) => {
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

  return (
    <div className="seller-delivered-orders">
      <div className="delivered-header">
        <h2 className="delivered-title">📦 Latest Orders</h2>
      </div>

      {loading ? (
        <div className="loading-state">Loading orders...</div>
      ) : deliveredOrders.length > 0 ? (
        <div className="table-container">
          <table className="delivered-table">
            <thead>
              <tr>
                <th>Buyer ID</th>
                <th>Order ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Date</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveredOrders.map((order) => (
                <tr key={order.id} className="order-row">
                  <td className="buyer-id">{formatBuyerId(order.buyerIdFormatted)}</td>
                  <td className="order-id">{formatOrderId(order.id)}</td>
                  <td className="product-name">{order.productName || 'N/A'}</td>
                  <td className="category">{order.category || 'N/A'}</td>
                  <td className="quantity">{order.quantity || 0}</td>
                  <td className="price">{formatPrice(order.price)}</td>
                  <td className="date">{order.deliveredAt ? formatDate(order.deliveredAt) : (order.updatedAt ? formatDate(order.updatedAt) : formatDate(order.createdAt))}</td>
                  <td className="rating">{renderRating(order.orderId)}</td>
                  <td className="status">
                    <span className="status-badge delivered">Delivered</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-orders-state">
          <p>No delivered orders yet</p>
        </div>
      )}

      <style>{`
        .seller-delivered-orders {
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
        }

        .delivered-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .delivered-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .table-container {
          overflow-x: auto;
        }

        .delivered-table {
          width: 100%;
          border-collapse: collapse;
        }

        .delivered-table thead {
          background: #F0F8FF;
          border-bottom: 2px solid #D1E7F7;
        }

        .delivered-table th {
          padding: 16px;
          text-align: left;
          font-weight: 700;
          color: #333;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .delivered-table td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          color: #333;
        }

        .delivered-table tbody tr:hover {
          background: #F8FBFF;
        }

        .buyer-id {
          font-weight: 600;
          color: #F06292;
        }

        .order-id {
          font-weight: 600;
          color: #333;
        }

        .product-name {
          font-weight: 500;
          color: #333;
        }

        .category {
          color: #666;
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
        }

        .status-badge.delivered {
          background: #D4EDDA;
          color: #155724;
        }

        .loading-state {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 14px;
        }

        .no-orders-state {
          text-align: center;
          padding: 40px;
          color: #999;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .seller-delivered-orders {
            padding: 16px;
          }

          .delivered-table th,
          .delivered-table td {
            padding: 12px;
            font-size: 12px;
          }

          .delivered-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
