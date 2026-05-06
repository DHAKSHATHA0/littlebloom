// frontend/src/pages/SellerDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import TimeBasedSellerAnalytics from '../components/TimeBasedSellerAnalytics';
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

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [deliveredOrdersWithRatings, setDeliveredOrdersWithRatings] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [dailySales, setDailySales] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
    fetchEnhancedDashboardData();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUserInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const fetchEnhancedDashboardData = async () => {
    try {
      console.log('Fetching enhanced dashboard data...');
      
      // Fetch orders data
      const ordersRes = await api.get('/orders/seller/all');
      const orders = ordersRes.data || [];
      console.log('All seller orders:', orders.length);
      
      // Filter pending orders - orders already contain buyer information
      const pendingOrders = orders.filter(order => order.status === 'PENDING') || [];
      setSellerOrders(pendingOrders);
      console.log('Pending orders:', pendingOrders.length);
      
      // Filter delivered orders
      const deliveredOrders = orders.filter(order => order.status === 'DELIVERED') || [];
      console.log('Delivered orders:', deliveredOrders.length, deliveredOrders);
      
      // Fetch reviews for delivered orders
      const ordersWithRatings = await Promise.all(
        deliveredOrders.map(async (order) => {
          try {
            console.log(`Fetching reviews for order ${order.orderId}, product ${order.productId}, buyer ${order.buyerId}`);
            console.log('Order data:', order);
            
            // Fetch reviews for this specific order and product combination
            const reviewsRes = await api.get(`/reviews/order/${order.orderId}/product/${order.productId}`);
            const review = reviewsRes.data;
            
            console.log(`Review found for order ${order.orderId}:`, review);
            
            // Use deliveredAt as delivery date (when seller clicked "Mark as Delivered")
            let deliveryDate = 'Unknown';
            
            if (order.deliveredAt) {
              console.log('Raw deliveredAt value:', order.deliveredAt, typeof order.deliveredAt);
              try {
                // Handle LocalDateTime format from backend (e.g., "2024-01-15T10:30:00")
                const date = new Date(order.deliveredAt);
                if (!isNaN(date.getTime())) {
                  deliveryDate = date.toLocaleDateString('en-US');
                  console.log('Parsed delivery date:', deliveryDate);
                } else {
                  console.error('Invalid date from deliveredAt:', order.deliveredAt);
                  deliveryDate = 'Invalid Date';
                }
              } catch (e) {
                console.error('Error parsing deliveredAt:', e);
                deliveryDate = 'Parse Error';
              }
            } else if (order.updatedAt) {
              console.log('Using updatedAt as fallback:', order.updatedAt);
              try {
                const date = new Date(order.updatedAt);
                if (!isNaN(date.getTime())) {
                  deliveryDate = date.toLocaleDateString('en-US');
                }
              } catch (e) {
                console.error('Error parsing updatedAt:', e);
              }
            } else if (order.createdAt) {
              console.log('Using createdAt as fallback:', order.createdAt);
              try {
                const date = new Date(order.createdAt);
                if (!isNaN(date.getTime())) {
                  deliveryDate = date.toLocaleDateString('en-US');
                }
              } catch (e) {
                console.error('Error parsing createdAt:', e);
              }
            }
            
            console.log('Final delivery date:', deliveryDate);
            
            return {
              ...order,
              rating: review?.rating || null,
              feedback: review?.feedback || null,
              hasRating: !!review?.rating,
              deliveryDate: deliveryDate
            };
          } catch (error) {
            console.error(`Error fetching review for order ${order.orderId}:`, error);
            
            // Try to get delivery date even if review fetch fails
            let deliveryDate = 'Unknown';
            
            if (order.deliveredAt) {
              try {
                const date = new Date(order.deliveredAt);
                if (!isNaN(date.getTime())) {
                  deliveryDate = date.toLocaleDateString('en-US');
                } else {
                  deliveryDate = 'Invalid Date';
                }
              } catch (e) {
                deliveryDate = 'Parse Error';
              }
            } else if (order.updatedAt) {
              try {
                const date = new Date(order.updatedAt);
                if (!isNaN(date.getTime())) {
                  deliveryDate = date.toLocaleDateString('en-US');
                } else {
                  deliveryDate = 'Invalid Date';
                }
              } catch (e) {
                deliveryDate = 'Parse Error';
              }
            } else if (order.createdAt) {
              try {
                const date = new Date(order.createdAt);
                if (!isNaN(date.getTime())) {
                  deliveryDate = date.toLocaleDateString('en-US');
                }
              } catch (e) {
                deliveryDate = 'Parse Error';
              }
            }
            
            return {
              ...order,
              rating: null,
              feedback: null,
              hasRating: false,
              deliveryDate: deliveryDate
            };
          }
        })
      );
      
      console.log('Orders with ratings processed:', ordersWithRatings);
      setDeliveredOrdersWithRatings(ordersWithRatings);
      
      // Calculate this month stats from orders
      const thisMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      });
      
      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + parseFloat(order.price || 0), 0);
      const thisMonthItems = thisMonthOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);
      
      setDashboard({
        thisMonth: {
          totalRevenue: thisMonthRevenue,
          totalOrders: thisMonthOrders.length,
          totalItems: thisMonthItems,
          averageOrderValue: thisMonthOrders.length > 0 ? thisMonthRevenue / thisMonthOrders.length : 0
        },
        monthlyChart: []
      });
      
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return null;
  }



  return (
    <div className="seller-dashboard">
      {/* Left Sidebar - Stats Cards */}
      <div className="dashboard-container">
        <div className="sidebar-stats">
          {/* This Month Card */}
          <div className="stat-card this-month">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <p className="stat-label">This Month</p>
              <p className="stat-value">₹{dashboard?.thisMonth?.totalRevenue?.toLocaleString() || '0'}</p>
              <p className="stat-subtext">{dashboard?.thisMonth?.totalOrders || 0} orders</p>
            </div>
          </div>

          {/* Avg Order Value Card */}
          <div className="stat-card avg-order">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <p className="stat-label">Avg Order Value</p>
              <p className="stat-value">₹{Math.round(dashboard?.thisMonth?.averageOrderValue || 0)}</p>
              <p className="stat-subtext">This month</p>
            </div>
          </div>

          {/* Items Sold Card */}
          <div className="stat-card items-sold">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <p className="stat-label">Items Sold</p>
              <p className="stat-value">{dashboard?.thisMonth?.totalItems || 0}</p>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="stat-card pending-orders">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <p className="stat-label">Pending Orders</p>
              <p className="stat-value">{sellerOrders.length}</p>
              <p className="stat-subtext">Require your attention</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Pending Orders Table */}
          <div className="section pending-orders-section">
            <h2 className="section-title">⏱️ Pending Orders Details</h2>
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerOrders.length > 0 ? (
                    sellerOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <span className="buyer-id-badge">
                            {order.buyerIdFormatted || 'N/A'}
                          </span>
                        </td>
                        <td className="buyer-name">{order.buyerName || 'Unknown'}</td>
                        <td>{order.orderId || order.id}</td>
                        <td>{order.productName || 'N/A'}</td>
                        <td>{order.productCategory || order.category || 'N/A'}</td>
                        <td>{order.quantity || 0}</td>
                        <td>₹{order.price || 0}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td><span className="status-badge pending">Pending</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="no-data">No pending orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Time-Based Analytics Component */}
          {userInfo && (
            <TimeBasedSellerAnalytics sellerId={userInfo.id} />
          )}

          {/* Debug Section - Remove in production */}
          <div className="debug-section">
            <button 
              className="debug-btn"
              onClick={() => {
                console.log('Manual refresh triggered');
                fetchEnhancedDashboardData();
              }}
            >
              🔄 Refresh Dashboard Data
            </button>
            <p className="debug-info">
              Delivered Orders: {deliveredOrdersWithRatings.length} | 
              Check console for detailed logs
            </p>
          </div>



          {/* Add Product Button */}
          <div className="add-product-section">
            <button 
              className="add-product-btn"
              onClick={() => navigate('/seller/products')}
            >
              <span className="plus-icon">+</span>
              Add New Product
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .seller-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
          padding: 40px 20px;
        }

        .dashboard-loading {
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dashboard-container {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .sidebar-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          grid-template-rows: auto;
        }

        .stat-card:nth-child(4) {
          grid-column: 4;
          grid-row: 1;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          min-height: 100px;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .stat-card.this-month {
          border-color: #FFE0E6;
          background: linear-gradient(135deg, #FFF5F8 0%, #FFE8F0 100%);
        }

        .stat-card.avg-order {
          border-color: #D1E7F7;
          background: linear-gradient(135deg, #F0F8FF 0%, #E6F2FF 100%);
        }

        .stat-card.items-sold {
          border-color: #D1F2EB;
          background: linear-gradient(135deg, #F0FDFB 0%, #E6FBEF 100%);
        }

        .stat-card.pending-orders {
          border-color: #FFF3CD;
          background: linear-gradient(135deg, #FFFBF0 0%, #FFF8E6 100%);
        }

        .stat-icon {
          font-size: 28px;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 700;
          color: #666;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-sublabel {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }

        .stat-subtext {
          font-size: 11px;
          color: #999;
          margin: 0;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #333;
          margin: 0 0 18px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pending-orders-section {
          border: 2px solid #FFF3CD;
          background: linear-gradient(135deg, #FFFBF0 0%, #FFF8E6 100%);
          width: 100%;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table thead {
          background: #FFF8E6;
          border-bottom: 2px solid #FFE0B2;
        }

        .orders-table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #333;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .orders-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          color: #333;
        }

        .orders-table tbody tr:hover {
          background: #FFFAF0;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.pending {
          background: #FFF3CD;
          color: #856404;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 40px 16px !important;
        }

        .charts-row:nth-of-type(2) {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          position: relative;
        }

        .chart-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .no-data-message {
          color: #666;
          font-size: 14px;
          margin: 0;
          text-align: center;
        }

        .chart-title {
          font-size: 16px;
          font-weight: 700;
          color: #333;
          margin: 0 0 18px 0;
        }

        .no-chart-data {
          text-align: center;
          color: #999;
          padding: 40px 20px;
          margin: 0;
        }

        .analytics-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .monthly-analytics {
          border: 2px solid #D1E7F7;
          background: linear-gradient(135deg, #F0F8FF 0%, #E6F2FF 100%);
        }

        .trend-analysis {
          border: 2px solid #D1F2EB;
          background: linear-gradient(135deg, #F0FDFB 0%, #E6FBEF 100%);
        }

        .trend-description {
          font-size: 14px;
          color: #666;
          margin: 0 0 20px 0;
        }

        .add-product-section {
          display: flex;
          justify-content: center;
          padding: 30px 20px;
        }

        .add-product-btn {
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          color: white;
          border: none;
          padding: 16px 40px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(240, 98, 146, 0.3);
        }

        .add-product-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(240, 98, 146, 0.4);
        }

        .plus-icon {
          font-size: 20px;
          font-weight: bold;
        }

        @media (max-width: 1400px) {
          .sidebar-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }

          .stat-card:nth-child(4) {
            grid-column: 3;
            grid-row: 1;
          }
        }

        @media (max-width: 1024px) {
          .sidebar-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-card:nth-child(4) {
            grid-column: 2;
            grid-row: 1;
          }

          .stat-card {
            padding: 14px;
            min-height: 90px;
          }

          .stat-value {
            font-size: 20px;
          }
        }

        @media (max-width: 768px) {
          .seller-dashboard {
            padding: 20px 12px;
          }

          .dashboard-container {
            gap: 20px;
          }

          .sidebar-stats {
            grid-template-columns: 1fr;
            gap: 12px;
            grid-template-rows: auto;
          }

          .pending-orders-section {
            grid-column: 1;
            grid-row: auto;
          }

          .stat-card:nth-child(4) {
            grid-column: 1;
            grid-row: auto;
          }

          .stat-card {
            padding: 12px;
            min-height: 80px;
          }

          .stat-icon {
            font-size: 24px;
          }

          .stat-value {
            font-size: 18px;
          }

          .stat-label {
            font-size: 10px;
          }

          .section {
            padding: 16px;
          }

          .section-title {
            font-size: 16px;
            margin-bottom: 14px;
          }

          .chart-title {
            font-size: 14px;
            margin-bottom: 14px;
          }

          .orders-table {
            font-size: 12px;
          }

          .orders-table th,
          .orders-table td {
            padding: 10px 8px;
          }

          .charts-row {
            gap: 16px;
            grid-template-columns: 1fr;
          }

          .analytics-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .seller-dashboard {
            padding: 16px 8px;
          }

          .dashboard-container {
            gap: 16px;
          }

          .sidebar-stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .pending-orders-section {
            grid-column: 1;
            grid-row: auto;
          }

          .stat-card {
            padding: 10px;
            min-height: 70px;
          }

          .stat-card:nth-child(4) {
            grid-column: 1;
            grid-row: auto;
          }

          .stat-icon {
            font-size: 20px;
          }

          .stat-value {
            font-size: 16px;
          }

          .stat-label {
            font-size: 9px;
          }

          .section-title {
            font-size: 14px;
          }

          .chart-title {
            font-size: 13px;
          }

          .add-product-btn {
            padding: 12px 24px;
            font-size: 14px;
          }

          .charts-row {
            grid-template-columns: 1fr;
          }
        }

        /* Buyer ID Badge Styling */
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

        /* Delivered Orders Section */
        .delivered-orders-section {
          margin-top: 32px;
          border-top: 2px solid rgba(240, 98, 146, 0.1);
          padding-top: 24px;
        }

        .delivered-orders-section .section-title {
          color: #27ae60;
        }

        /* Rating Badge Styling */
        .rating-badge {
          background: #fff3e0;
          color: #e67e22;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          white-space: nowrap;
        }

        .rating-badge.no-review {
          background: #f0f0f0;
          color: #999;
          font-style: italic;
        }

        /* Feedback Cell Styling */
        .feedback-cell {
          max-width: 200px;
          word-wrap: break-word;
          padding: 12px 16px !important;
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
        }

        /* Row Highlighting */
        .orders-table tbody tr.has-rating {
          background: rgba(39, 174, 96, 0.05);
        }

        .orders-table tbody tr.has-rating:hover {
          background: rgba(39, 174, 96, 0.1);
        }

        .orders-table tbody tr.no-rating {
          background: rgba(244, 208, 63, 0.05);
        }

        .orders-table tbody tr.no-rating:hover {
          background: rgba(244, 208, 63, 0.1);
        }

        /* Debug Section Styles */
        .debug-section {
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          text-align: center;
        }

        .debug-btn {
          background: #17a2b8;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .debug-btn:hover {
          background: #138496;
        }

        .debug-info {
          margin: 0;
          font-size: 12px;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
}
