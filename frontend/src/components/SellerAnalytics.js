import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SellerAnalytics = ({ sellerId, registrationDate }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sellerId) {
      fetchAnalytics();
    }
  }, [sellerId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/orders/seller/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const orders = await response.json();
        processAnalytics(orders);
      }
    } catch (error) {
      console.error('Failed to fetch seller analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (orders) => {
    if (!orders || orders.length === 0) {
      setAnalytics({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        monthlyData: []
      });
      return;
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by month
    const monthlyGroups = orders.reduce((groups, order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = { orders: 0, revenue: 0 };
      }
      
      groups[monthKey].orders += 1;
      groups[monthKey].revenue += parseFloat(order.price) || 0;
      
      return groups;
    }, {});

    const monthlyData = Object.entries(monthlyGroups)
      .map(([month, data]) => ({
        month,
        orders: data.orders,
        revenue: data.revenue
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    setAnalytics({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      monthlyData
    });
  };

  if (loading) {
    return (
      <div className="seller-analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="seller-analytics-error">
        <p>Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="seller-analytics">
      <div className="analytics-header">
        <h3>📊 Seller Analytics Overview</h3>
        <p>Your performance since {new Date(registrationDate).toLocaleDateString()}</p>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <h4>Total Orders</h4>
          <p className="summary-value">{analytics.totalOrders}</p>
        </div>
        <div className="summary-card">
          <h4>Total Revenue</h4>
          <p className="summary-value">₹{analytics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>Average Order Value</h4>
          <p className="summary-value">₹{Math.round(analytics.averageOrderValue)}</p>
        </div>
      </div>

      {analytics.monthlyData.length > 0 && (
        <div className="analytics-chart">
          <h4>Monthly Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Bar dataKey="orders" fill="#42A5F5" name="Orders" />
              <Bar dataKey="revenue" fill="#F06292" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`
        .seller-analytics {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .analytics-header {
          margin-bottom: 24px;
        }

        .analytics-header h3 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 20px;
        }

        .analytics-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .analytics-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .summary-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e0e0e0;
        }

        .summary-card h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .summary-value {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .analytics-chart {
          margin-top: 32px;
        }

        .analytics-chart h4 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
        }

        .seller-analytics-loading,
        .seller-analytics-error {
          text-align: center;
          padding: 40px;
        }

        .seller-analytics-loading .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #F06292;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .seller-analytics {
            padding: 16px;
            margin: 10px 0;
          }

          .analytics-summary {
            grid-template-columns: 1fr;
          }

          .summary-value {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerAnalytics;