import React, { useState, useEffect, useContext } from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AuthContext } from '../context/AuthContext';

const TimeBasedSellerAnalytics = ({ sellerId }) => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [productSalesData, setProductSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);

  const COLORS = ['#F06292', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA'];

  useEffect(() => {
    if (user && user.role === 'SELLER') {
      loadAllData();
    } else {
      setError('Please login as a seller to view analytics');
      setLoading(false);
    }
  }, [activeView, selectedYear, user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !user || user.role !== 'SELLER') {
        throw new Error('Authentication required');
      }

      const actualSellerId = sellerId || user.id;

      // 1. Fetch dashboard data from Spring Boot
      const dashResponse = await fetch(
        `/api/analytics/dashboard?sellerId=${actualSellerId}&year=${selectedYear}&period=${activeView}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!dashResponse.ok) throw new Error('Failed to fetch dashboard data');
      const dashData = await dashResponse.json();
      setDashboardData(dashData);

      // 2. Fetch predictions from Python
      await fetchPredictions(dashData, token, actualSellerId);

      // 3. Fetch trends from Python
      await fetchTrends(token, actualSellerId);

      // 4. Fetch recommendations from Python
      await fetchRecommendations(token, actualSellerId);

      // 5. Fetch product sales
      await fetchProductSales(token);

      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictions = async (dashData, token, sellerId) => {
    try {
      const predResponse = await fetch('http://localhost:5000/api/analytics/predict/next-month', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sellerId: sellerId,
          historicalData: dashData.chartData || []
        })
      });

      if (predResponse.ok) {
        const predData = await predResponse.json();
        setPrediction(predData);
      }
    } catch (err) {
      console.warn('Prediction service unavailable:', err);
    }
  };

  const fetchTrends = async (token, sellerId) => {
    try {
      const trendResponse = await fetch(
        `http://localhost:5000/api/analytics/trends?sellerId=${sellerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (trendResponse.ok) {
        const trendData = await trendResponse.json();
        setTrends(trendData);
      }
    } catch (err) {
      console.warn('Trends service unavailable:', err);
    }
  };

  const fetchRecommendations = async (token, sellerId) => {
    try {
      const recResponse = await fetch(
        `http://localhost:5000/api/analytics/recommendations?sellerId=${sellerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (recResponse.ok) {
        const recData = await recResponse.json();
        setRecommendations(recData);
      }
    } catch (err) {
      console.warn('Recommendations service unavailable:', err);
    }
  };

  const fetchProductSales = async (token) => {
    try {
      const ordersResponse = await fetch('/api/orders/seller/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        const productMap = {};

        orders.forEach(order => {
          const productId = order.productId;
          if (!productMap[productId]) {
            productMap[productId] = {
              productId,
              productName: order.productName || 'Unknown',
              quantitySold: 0,
              totalRevenue: 0,
              salesCount: 0
            };
          }
          const quantity = order.quantity || 1;
          const price = parseFloat(order.price || 0);
          productMap[productId].quantitySold += quantity;
          productMap[productId].totalRevenue += price;
          productMap[productId].salesCount += 1;
        });

        const productArray = Object.values(productMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
        setProductSalesData(productArray);
      }
    } catch (err) {
      console.warn('Product sales error:', err);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-orders">Orders: {payload[0]?.value || 0}</p>
          <p className="tooltip-revenue">Revenue: {formatCurrency(payload[1]?.value || 0)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="error-container">Failed to load analytics data</div>;
  }

  const summary = dashboardData.summary || {};
  const chartData = dashboardData.chartData || [];

  return (
    <div className="time-based-analytics">
      <div className="analytics-header">
        <h2>📊 Sales Analytics Dashboard with ML Insights</h2>
        <p>Real-time data + AI predictions + Trend analysis</p>
        {error && <div className="error-message">⚠️ {error}</div>}
      </div>

      <div className="controls-bar">
        <div className="view-toggle">
          {['daily', 'weekly', 'monthly', 'yearly'].map(view => (
            <button
              key={view}
              className={`toggle-btn ${activeView === view ? 'active' : ''}`}
              onClick={() => setActiveView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        <div className="year-navigation">
          <button onClick={() => setSelectedYear(selectedYear - 1)}>← Previous Year</button>
          <span className="year-display">{selectedYear}</span>
          <button onClick={() => setSelectedYear(selectedYear + 1)}>Next Year →</button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Orders</h3>
          <p className="metric-value">{summary.totalOrders || 0}</p>
          <span className="metric-period">{activeView}</span>
        </div>
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="metric-value">{formatCurrency(summary.totalRevenue || 0)}</p>
          <span className="metric-period">{activeView}</span>
        </div>
        <div className="summary-card">
          <h3>Average Order Value</h3>
          <p className="metric-value">{formatCurrency(summary.averageOrderValue || 0)}</p>
          <span className="metric-period">{activeView}</span>
        </div>
      </div>

      {prediction && (
        <div className="prediction-card">
          <h3>🔮 Next Month Prediction (ML Forecast)</h3>
          <div className="prediction-content">
            <div className="pred-item">
              <span className="label">Predicted Month:</span>
              <span className="value">{prediction.nextMonthName}</span>
            </div>
            <div className="pred-item">
              <span className="label">Predicted Revenue:</span>
              <span className="value">{formatCurrency(prediction.predictedRevenue)}</span>
            </div>
            <div className="pred-item">
              <span className="label">Predicted Orders:</span>
              <span className="value">{prediction.predictedOrders}</span>
            </div>
            <div className="pred-item">
              <span className="label">Confidence:</span>
              <span className="value">{prediction.confidence}%</span>
            </div>
            <div className="pred-item">
              <span className="label">Growth Rate:</span>
              <span className={`trend ${prediction.trend.toLowerCase()}`}>
                {prediction.growthRate}% {prediction.trend}
              </span>
            </div>
            <div className="pred-item full-width">
              <span className="label">Seasonal Factor:</span>
              <span className="value">{prediction.seasonalFactor}x</span>
            </div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <h3>📈 {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" stroke="#666" fontSize={12} />
            <YAxis yAxisId="orders" orientation="left" stroke="#42A5F5" fontSize={12} />
            <YAxis yAxisId="revenue" orientation="right" stroke="#F06292" fontSize={12} 
                   tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="orders" dataKey="orders" fill="#42A5F5" name="Orders" radius={[4, 4, 0, 0]} />
            <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#F06292" strokeWidth={3}
                  name="Revenue (₹)" dot={{ fill: '#F06292', strokeWidth: 2, r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table-container">
        <h3>📋 {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Data Table</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {chartData.length > 0 ? (
                chartData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.label}</td>
                    <td>{item.orders}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="no-data">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {trends && (
        <div className="trends-section">
          <h3>📊 Trends Analysis</h3>
          <div className="trend-item">
            <h4>Revenue Trend</h4>
            <p className={`trend-badge ${trends.revenueTrend?.direction?.toLowerCase()}`}>
              📈 {trends.revenueTrend?.insight || 'Analyzing trend...'}
            </p>
          </div>
          {trends.peakHours && (
            <div className="trend-item">
              <h4>Peak Hours</h4>
              <p>{trends.peakHours.bestHourLabel} is your best time</p>
              <p className="trend-detail">{trends.peakHours.insight}</p>
            </div>
          )}
        </div>
      )}

      {recommendations && (
        <div className="recommendations-section">
          <h3>🎯 AI Recommendations</h3>
          {recommendations.insights && (
            <div className="insights-list">
              <h4>Key Insights</h4>
              {recommendations.insights.map((insight, i) => (
                <p key={i} className="insight-item">💡 {insight}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {productSalesData && productSalesData.length > 0 && (
        <div className="product-analysis">
          <h3>🥧 Top Products</h3>
          <div className="product-grid">
            <div className="product-chart">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={productSalesData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ productName, quantitySold, percent }) => 
                      `${productName.substring(0, 10)} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="quantitySold"
                  >
                    {productSalesData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} units`, 'Sold']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="product-table-section">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productSalesData.slice(0, 10).map((product, idx) => (
                    <tr key={product.productId} className={idx < 3 ? 'top' : ''}>
                      <td className="prod-name">{product.productName}</td>
                      <td>{product.quantitySold}</td>
                      <td className="revenue">{formatCurrency(product.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .time-based-analytics {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .analytics-header {
          margin-bottom: 24px;
        }

        .analytics-header h2 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 24px;
        }

        .error-message {
          background: #fff3cd;
          color: #856404;
          padding: 8px 12px;
          border-radius: 6px;
          margin-top: 8px;
          font-size: 12px;
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .view-toggle, .year-navigation {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .toggle-btn, .year-navigation button {
          padding: 10px 16px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .toggle-btn:hover, .year-navigation button:hover {
          border-color: #F06292;
          color: #F06292;
        }

        .toggle-btn.active {
          background: #F06292;
          border-color: #F06292;
          color: white;
        }

        .year-display {
          font-weight: 600;
          color: #333;
          min-width: 60px;
          text-align: center;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e0e0e0;
        }

        .summary-card h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #666;
        }

        .metric-value {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .metric-period {
          font-size: 12px;
          color: #888;
        }

        .prediction-card {
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border: 2px solid #42A5F5;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .prediction-card h3 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .prediction-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .pred-item {
          background: white;
          padding: 12px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          border-left: 4px solid #42A5F5;
        }

        .pred-item.full-width {
          grid-column: 1 / -1;
        }

        .pred-item .label {
          font-weight: 500;
          color: #666;
        }

        .pred-item .value {
          font-weight: 600;
          color: #333;
        }

        .trend {
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .trend.increasing {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .trend.decreasing {
          background: #ffccbc;
          color: #d84315;
        }

        .trend.stable {
          background: #e0e0e0;
          color: #616161;
        }

        .chart-container {
          background: #fafafa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e0e0e0;
        }

        .chart-container h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
        }

        .custom-tooltip {
          background: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .data-table-container {
          margin-bottom: 24px;
        }

        .data-table-container h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
        }

        .table-wrapper {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .data-table th {
          background: #f8f9fa;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
        }

        .data-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          color: #555;
        }

        .data-table tr:hover {
          background: #f8f9fa;
        }

        .trends-section, .recommendations-section {
          background: #fafafa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e0e0e0;
        }

        .trends-section h3, .recommendations-section h3 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 18px;
        }

        .trend-item {
          background: white;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 12px;
          border-left: 4px solid #F06292;
        }

        .trend-item h4 {
          margin: 0 0 8px 0;
          color: #333;
        }

        .trend-badge {
          background: #e3f2fd;
          padding: 8px 12px;
          border-radius: 6px;
          display: inline-block;
          font-weight: 500;
        }

        .trend-badge.up {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .trend-badge.down {
          background: #ffccbc;
          color: #d84315;
        }

        .insights-list {
          background: white;
          padding: 16px;
          border-radius: 8px;
        }

        .insights-list h4 {
          margin: 0 0 12px 0;
          color: #333;
        }

        .insight-item {
          margin: 8px 0;
          color: #555;
          line-height: 1.5;
        }

        .product-analysis {
          background: #fafafa;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e0e0e0;
        }

        .product-analysis h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 18px;
        }

        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }

        .product-chart {
          background: white;
          border-radius: 8px;
          padding: 16px;
        }

        .product-table-section {
          background: white;
          border-radius: 8px;
          padding: 16px;
          max-height: 400px;
          overflow-y: auto;
        }

        .product-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .product-table th {
          background: #f8f9fa;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #e0e0e0;
        }

        .product-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #f0f0f0;
        }

        .product-table tr.top {
          background: #fff3e0;
        }

        .product-table .prod-name {
          font-weight: 500;
        }

        .product-table .revenue {
          color: #F06292;
          font-weight: 600;
        }

        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #F06292;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .time-based-analytics {
            padding: 16px;
          }

          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .view-toggle, .year-navigation {
            justify-content: center;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .prediction-content {
            grid-template-columns: 1fr;
          }

          .product-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TimeBasedSellerAnalytics;
