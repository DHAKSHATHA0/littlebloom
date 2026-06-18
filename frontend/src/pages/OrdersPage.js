// frontend/src/pages/OrdersPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { OrderNotificationContext } from '../context/OrderNotificationContext';
import '../styles.css';

export default function OrdersPage() {
  const { markOrdersAsViewed } = useContext(OrderNotificationContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const statusLabels = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
  };

  const getStatusLabel = (status) => {
    return statusLabels[status] || status;
  };

  useEffect(() => {
    fetchOrders();
    // Mark orders as viewed when page loads
    markOrdersAsViewed();
    
    const refreshInterval = setInterval(() => {
      fetchOrders(false);
    }, 5000);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await orderAPI.getBuyerOrdersAll();
      setOrders(response.data);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setRefreshing(false);
      if (showLoader) setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'OUT_FOR_DELIVERY':
        return 'status-shipping';
      case 'DELIVERED':
        return 'status-delivered';
      default:
        return 'status-default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return '📦';
      case 'CONFIRMED':
        return '✓';
      case 'OUT_FOR_DELIVERY':
        return '🚚';
      case 'DELIVERED':
        return '✅';
      default:
        return '•';
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container">
        <h1 className="page-title">📋 My Orders</h1>
        <div className="empty-state card">
          <p className="empty-text">No Active Orders</p>
          <p className="empty-subtext">You don't have any pending orders. Start shopping to place an order!</p>
          <Link to="/menu" className="btn btn-primary btn-large">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <div>
            <h1 className="page-title">📋 My Orders</h1>
            <p className="orders-count">Total Orders: {orders.length}</p>
            {lastUpdated && (
              <p className="last-updated">Last updated: {lastUpdated}</p>
            )}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn btn-primary"
          >
            {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card card">
              <div className="order-header">
                <div className="order-grid">
                  <div className="order-col">
                    <p className="order-label">Order ID</p>
                    <p className="order-value">#{order.id}</p>
                  </div>

                  <div className="order-col">
                    <p className="order-label">Product</p>
                    <p className="order-value">{order.items?.[0]?.productName || 'N/A'}</p>
                  </div>

                  <div className="order-col">
                    <p className="order-label">Date</p>
                    <p className="order-value">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="order-col">
                    <p className="order-label">Price</p>
                    <p className="order-value amount">₹{parseFloat(order.totalPrice).toFixed(2)}</p>
                  </div>

                  <div className="order-col status-col">
                    <p className="order-label">Status</p>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="order-col action-col">
                    <p className="order-label">Action</p>
                    {order.items && order.items.length > 0 ? (
                      <Link
                        to={`/product/${order.items[0].productId}`}
                        className="btn-view-details"
                      >
                        View Details
                      </Link>
                    ) : (
                      <span className="no-action">-</span>
                    )}
                  </div>
                </div>
              </div>


            </div>
          ))}
        </div>
      </div>

      <style>{`
        .orders-page {
          min-height: 100vh;
          padding: var(--spacing-xl) var(--spacing-md);
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
        }

        .page-title {
          text-align: center;
          margin-bottom: var(--spacing-lg);
          font-size: 2.5rem;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
          gap: var(--spacing-lg);
        }

        .orders-count {
          color: var(--dark-gray);
          margin: var(--spacing-md) 0 0 0;
        }

        .last-updated {
          font-size: 0.85rem;
          color: var(--gray);
          margin: var(--spacing-sm) 0 0 0;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .order-card {
          padding: 0;
          overflow: hidden;
          border-left: 4px solid var(--primary-pink);
        }

        .order-header {
          padding: var(--spacing-lg);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .order-header:hover {
          background: var(--light-gray);
        }

        .order-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: var(--spacing-md);
          align-items: center;
        }

        .order-col {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .order-label {
          font-size: 0.85rem;
          color: var(--gray);
          margin: 0;
          font-weight: 600;
        }

        .order-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-dark);
          margin: 0;
        }

        .order-value.amount {
          color: var(--primary-pink);
          font-size: 1.1rem;
        }

        .status-col {
          text-align: right;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: var(--radius-lg);
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-pending {
          background: #BBDEFB;
          color: #1565C0;
        }

        .status-confirmed {
          background: #BBDEFB;
          color: #1565C0;
        }

        .status-shipping {
          background: #FFE0B2;
          color: #E65100;
        }

        .status-delivered {
          background: #C8E6C9;
          color: #2E7D32;
        }

        .status-default {
          background: #EEEEEE;
          color: #424242;
        }

        .order-details {
          padding: var(--spacing-lg);
          background: var(--light-gray);
          border-top: 1px solid var(--medium-gray);
        }

        .order-details h3 {
          margin-bottom: var(--spacing-lg);
          font-size: 1.25rem;
        }

        .items-container {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .order-item {
          display: grid;
          grid-template-columns: 80px 1fr 1fr;
          gap: var(--spacing-md);
          align-items: center;
          background: white;
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          border: 1px solid var(--medium-gray);
        }

        .item-image {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--light-gray);
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .item-info h4 {
          margin: 0;
          font-size: 1rem;
          color: var(--text-dark);
        }

        .item-category {
          font-size: 0.85rem;
          color: var(--gray);
          margin: 0;
        }

        .item-details {
          display: flex;
          gap: var(--spacing-md);
          font-size: 0.9rem;
          color: var(--dark-gray);
        }

        .item-subtotal {
          text-align: right;
        }

        .subtotal-label {
          font-size: 0.85rem;
          color: var(--gray);
          margin: 0;
        }

        .subtotal-amount {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--primary-pink);
          margin: 0;
        }

        .no-items {
          text-align: center;
          color: var(--dark-gray);
          padding: var(--spacing-lg);
          margin: 0;
        }

        .order-summary {
          background: white;
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          border: 1px solid var(--medium-gray);
          margin-top: var(--spacing-md);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: var(--spacing-md);
        }

        .summary-amount {
          color: var(--primary-pink);
        }

        .summary-status {
          font-size: 0.95rem;
          color: var(--dark-gray);
          margin-bottom: var(--spacing-md);
        }

        .order-expand-hint {
          padding: var(--spacing-md);
          background: var(--light-gray);
          text-align: right;
          border-top: 1px solid var(--medium-gray);
        }

        .order-expand-hint p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--gray);
        }

        .action-col {
          text-align: center;
        }

        .btn-view-details {
          display: inline-block;
          padding: 8px 16px;
          background: white;
          color: var(--primary-pink);
          border: 2px solid var(--primary-pink);
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-view-details:hover {
          background: var(--primary-pink);
          color: white;
        }

        .no-action {
          color: var(--gray);
          font-size: 0.9rem;
        }

        .orders-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-lg);
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--medium-gray);
          border-top-color: var(--primary-pink);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
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

        @media (max-width: 1024px) {
          .order-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .status-col {
            grid-column: 1 / -1;
            text-align: left;
          }
        }

        @media (max-width: 768px) {
          .orders-header {
            flex-direction: column;
          }

          .page-title {
            font-size: 2rem;
          }

          .order-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--spacing-sm);
          }

          .order-item {
            grid-template-columns: 70px 1fr;
          }

          .item-subtotal {
            grid-column: 1 / -1;
            text-align: left;
            margin-top: var(--spacing-sm);
          }
        }

        @media (max-width: 480px) {
          .orders-page {
            padding: var(--spacing-lg) var(--spacing-md);
          }

          .page-title {
            font-size: 1.75rem;
          }

          .order-header {
            padding: var(--spacing-md);
          }

          .order-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-sm);
          }

          .status-col {
            text-align: left;
          }

          .order-item {
            grid-template-columns: 60px 1fr;
            gap: var(--spacing-sm);
          }

          .item-image {
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
}
