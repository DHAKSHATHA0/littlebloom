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
  const [analyticsData, setAnalyticsData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [productSalesData, setProductSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('daily');
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState(null);

  // Colors for charts
  const COLORS = ['#F06292', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA'];

  useEffect(() => {
    if (user && user.role === 'SELLER') {
      loadAnalyticsData();
      loadProductData();
      loadProductSalesAnalysis();
    } else {
      setError('Please login as a seller to view analytics');
      setLoading(false);
    }
  }, [sellerId, user]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !user || user.role !== 'SELLER') {
        throw new Error('Authentication required - please login as a seller');
      }
      
      console.log('Fetching seller orders for analytics...');
      
      // Fetch actual seller orders from database
      const ordersResponse = await fetch('/api/orders/seller/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
      }
      
      const orders = await ordersResponse.json();
      console.log('Orders fetched:', orders.length);
      
      // Transform orders data for Python DS analysis
      const ordersForAnalysis = orders.map(order => ({
        date: new Date(order.createdAt).toISOString().split('T')[0],
        amount: parseFloat(order.price || 0),
        quantity: order.quantity || 1,
        orderId: order.id
      }));
      
      console.log('Sending data to Python analytics...');
      
      // Send to Python analytics endpoint for data science processing
      const analyticsResponse = await fetch('http://localhost:5000/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orders: ordersForAnalysis
        })
      });
      
      if (analyticsResponse.ok) {
        const analysisResult = await analyticsResponse.json();
        console.log('Analytics result from Python:', analysisResult);
        
        // Transform Python DS output to component format
        const analyticsData = {
          daily: transformDailyData(orders),
          weekly: analysisResult.weekly || [],
          monthly: analysisResult.monthly || [],
          yearly: analysisResult.yearly || [],
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.price || 0), 0),
          status: 'success',
          pythonAnalysis: analysisResult
        };
        
        setAnalyticsData(analyticsData);
        setError(null);
      } else {
        // If Python DS fails, use fallback local analysis
        console.warn('Python analytics unavailable, using local analysis');
        const fallbackAnalytics = {
          daily: transformDailyData(orders),
          weekly: transformWeeklyData(orders),
          monthly: transformMonthlyData(orders),
          yearly: transformYearlyData(orders),
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.price || 0), 0),
          status: 'fallback'
        };
        setAnalyticsData(fallbackAnalytics);
        setError(null);
      }
    } catch (err) {
      console.error('Analytics loading error:', err);
      setError(err.message);
      setAnalyticsData(createFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for local data transformation
  const transformDailyData = (orders) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyStats = {};
    
    // Initialize daily stats
    weekdays.forEach(day => {
      dailyStats[day] = { orders: 0, revenue: 0 };
    });
    
    // Aggregate orders by day of week
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const dayOfWeek = weekdays[date.getDay()];
      dailyStats[dayOfWeek].orders += 1;
      dailyStats[dayOfWeek].revenue += parseFloat(order.price || 0);
    });
    
    return weekdays.map(day => ({
      label: day,
      orders: dailyStats[day].orders,
      revenue: Math.round(dailyStats[day].revenue * 100) / 100
    }));
  };

  const transformWeeklyData = (orders) => {
    const weeklyStats = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekLabel = `Week of ${weekStart.toLocaleDateString()}`;
      
      if (!weeklyStats[weekLabel]) {
        weeklyStats[weekLabel] = { orders: 0, revenue: 0 };
      }
      weeklyStats[weekLabel].orders += 1;
      weeklyStats[weekLabel].revenue += parseFloat(order.price || 0);
    });
    
    return Object.keys(weeklyStats).map(week => ({
      label: week,
      orders: weeklyStats[week].orders,
      revenue: Math.round(weeklyStats[week].revenue * 100) / 100
    }));
  };

  const transformMonthlyData = (orders) => {
    const monthlyStats = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyStats[monthLabel]) {
        monthlyStats[monthLabel] = { orders: 0, revenue: 0 };
      }
      monthlyStats[monthLabel].orders += 1;
      monthlyStats[monthLabel].revenue += parseFloat(order.price || 0);
    });
    
    return Object.keys(monthlyStats).map(month => ({
      label: month,
      orders: monthlyStats[month].orders,
      revenue: Math.round(monthlyStats[month].revenue * 100) / 100
    }));
  };

  const transformYearlyData = (orders) => {
    const yearlyStats = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const year = date.getFullYear().toString();
      
      if (!yearlyStats[year]) {
        yearlyStats[year] = { orders: 0, revenue: 0 };
      }
      yearlyStats[year].orders += 1;
      yearlyStats[year].revenue += parseFloat(order.price || 0);
    });
    
    return Object.keys(yearlyStats).map(year => ({
      label: year,
      orders: yearlyStats[year].orders,
      revenue: Math.round(yearlyStats[year].revenue * 100) / 100
    }));
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      
      // Test 1: Check if backend is running
      const healthResponse = await fetch('/api/time-analytics/health');
      console.log('Health check:', healthResponse.status);
      
      // Test 2: Check database data (without auth)
      const dbResponse = await fetch('/api/debug/database-check');
      const dbData = await dbResponse.json();
      console.log('Database data:', dbData);
      
      // Test 3: Check seller data (without auth)
      const sellerResponse = await fetch(`/api/debug/seller/${user?.id || 1}`);
      const sellerData = await sellerResponse.json();
      console.log('Seller data:', sellerData);
      
      setTestResults({
        health: healthResponse.status,
        database: dbData,
        seller: sellerData
      });
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
    }
  };

  const loadProductData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setProductData({ products: [] });
        return;
      }
      
      // Fetch seller products
      const response = await fetch('/api/products/seller', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProductData(data);
      } else {
        setProductData({ products: [] });
      }
    } catch (err) {
      console.error('Product data error:', err);
      setProductData({ products: [] });
    }
  };

  const loadProductSalesAnalysis = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        setProductSalesData([]);
        return;
      }
      
      console.log('Fetching orders for product sales analysis...');
      
      // Fetch all orders from the database
      const ordersResponse = await fetch('/api/orders/seller/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!ordersResponse.ok) {
        setProductSalesData([]);
        return;
      }
      
      const orders = await ordersResponse.json();
      
      // Fetch seller products to get ratings
      const productsResponse = await fetch('/api/products/seller', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let productsMap = {};
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        if (productsData.products) {
          productsData.products.forEach(product => {
            productsMap[product.id] = product;
          });
        }
      }
      
      // Analyze product sales using data science approach
      const productSalesMap = {};
      
      orders.forEach(order => {
        const productId = order.productId;
        const productName = order.productName || 'Unknown Product';
        
        if (!productSalesMap[productId]) {
          productSalesMap[productId] = {
            productId: productId,
            productName: productName,
            quantitySold: 0,
            totalRevenue: 0,
            averagePrice: 0,
            rating: 0, // Will be populated with actual user reviews
            reviewCount: 0,
            salesCount: 0, // Number of customers who purchased (popularity)
            revenuePerUnit: 0
          };
        }
        
        const quantity = order.quantity || 1;
        const price = parseFloat(order.price || 0);
        
        productSalesMap[productId].quantitySold += quantity;
        productSalesMap[productId].totalRevenue += price;
        productSalesMap[productId].salesCount += 1;
      });
      
      // Fetch actual user-given ratings from reviews API
      const productRatingsMap = {};
      
      // For each product, fetch its reviews
      for (const productId of Object.keys(productSalesMap)) {
        try {
          const reviewsResponse = await fetch(`/api/reviews/product/${productId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (reviewsResponse.ok) {
            const reviews = await reviewsResponse.json();
            console.log(`Reviews for product ${productId}:`, reviews);
            
            if (Array.isArray(reviews) && reviews.length > 0) {
              const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
              const avgRating = totalRating / reviews.length;
              
              productRatingsMap[productId] = {
                averageRating: Math.round(avgRating * 10) / 10,
                reviewCount: reviews.length
              };
              
              console.log(`Product ${productId} average rating: ${avgRating} from ${reviews.length} reviews`);
            }
          }
        } catch (err) {
          console.warn(`Could not fetch reviews for product ${productId}:`, err);
        }
      }
      
      // Update product sales map with actual review ratings
      Object.keys(productSalesMap).forEach(productId => {
        if (productRatingsMap[productId]) {
          productSalesMap[productId].rating = productRatingsMap[productId].averageRating;
          productSalesMap[productId].reviewCount = productRatingsMap[productId].reviewCount;
        } else {
          productSalesMap[productId].rating = 0;
          productSalesMap[productId].reviewCount = 0;
        }
      });
      
      // Calculate derived metrics
      const productSalesArray = Object.values(productSalesMap).map(product => ({
        ...product,
        averagePrice: product.quantitySold > 0 ? Math.round(product.totalRevenue / product.quantitySold * 100) / 100 : 0,
        revenuePerUnit: product.quantitySold > 0 ? Math.round(product.totalRevenue / product.quantitySold * 100) / 100 : 0
      }));
      
      // Sort by revenue (highest first)
      const rankedProducts = productSalesArray.sort((a, b) => b.totalRevenue - a.totalRevenue);
      
      console.log('Product sales analysis complete:', rankedProducts);
      setProductSalesData(rankedProducts);
      
    } catch (err) {
      console.error('Product sales analysis error:', err);
      setProductSalesData([]);
    }
  };

  const createFallbackData = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      daily: weekdays.map(day => ({ label: day, orders: 0, revenue: 0 })),
      weekly: [],
      monthly: [],
      yearly: [],
      totalOrders: 0,
      totalRevenue: 0,
      status: 'fallback'
    };
  };

  const getCurrentData = () => {
    if (!analyticsData) return [];
    return analyticsData[activeView] || [];
  };

  const getTableHeaders = () => {
    switch (activeView) {
      case 'daily': return ['Day', 'Orders', 'Revenue'];
      case 'weekly': return ['Week', 'Orders', 'Revenue'];
      case 'monthly': return ['Month', 'Orders', 'Revenue'];
      case 'yearly': return ['Year', 'Orders', 'Revenue'];
      default: return ['Period', 'Orders', 'Revenue'];
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

  const currentData = getCurrentData();
  const totalOrders = currentData.reduce((sum, item) => sum + (item.orders || 0), 0);
  const totalRevenue = currentData.reduce((sum, item) => sum + (item.revenue || 0), 0);

  return (
    <div className="time-based-analytics">
      <div className="analytics-header">
        <h2>📊 Sales Analytics Dashboard</h2>
        <p>Complete time-based analysis with interactive charts</p>
        {error && <div className="error-message">⚠️ {error} (showing fallback data)</div>}
      </div>

      <div className="toggle-buttons">
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

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Orders</h3>
          <p className="metric-value">{totalOrders}</p>
          <span className="metric-period">{activeView} view</span>
        </div>
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="metric-value">{formatCurrency(totalRevenue)}</p>
          <span className="metric-period">{activeView} view</span>
        </div>
        <div className="summary-card">
          <h3>Average Order Value</h3>
          <p className="metric-value">
            {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '₹0'}
          </p>
          <span className="metric-period">{activeView} view</span>
        </div>
      </div>

      <div className="chart-container">
        <h3>📈 {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="label" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              yAxisId="orders"
              orientation="left"
              stroke="#42A5F5"
              fontSize={12}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="right"
              stroke="#F06292"
              fontSize={12}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="orders"
              dataKey="orders" 
              fill="#42A5F5" 
              name="Orders"
              radius={[4, 4, 0, 0]}
            />
            <Line 
              yAxisId="revenue"
              type="monotone" 
              dataKey="revenue" 
              stroke="#F06292" 
              strokeWidth={3}
              name="Revenue (₹)"
              dot={{ fill: '#F06292', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table-container">
        <h3>📋 {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Data Table</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {getTableHeaders().map(header => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.label}</td>
                    <td>{item.orders}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="no-data">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {productSalesData && productSalesData.length > 0 && (
        <div className="product-analysis">
          <h3>🥧 Product Sales Analysis</h3>
          
          <div className="product-analysis-grid">
            <div className="pie-chart-section">
              <h4>📊 Top Products by Sales</h4>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={productSalesData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ productName, quantitySold, percent }) => 
                      `${productName.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="quantitySold"
                  >
                    {productSalesData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} units`, 'Quantity Sold']}
                    labelFormatter={(label) => `Product Sales`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="product-sales-table-section">
              <h4>📈 Detailed Product Sales</h4>
              <div className="product-table-wrapper">
                <table className="product-sales-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Quantity Sold</th>
                      <th>Total Revenue</th>
                      <th>Avg Price</th>
                      <th>Rating</th>
                      <th>Popularity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productSalesData.map((product, index) => (
                      <tr key={product.productId} className={index < 3 ? 'top-product' : ''}>
                        <td className="product-name">{product.productName}</td>
                        <td className="quantity">{product.quantitySold}</td>
                        <td className="revenue">{formatCurrency(product.totalRevenue)}</td>
                        <td className="avg-price">{formatCurrency(product.revenuePerUnit)}</td>
                        <td className="rating">
                          {product.rating > 0 ? (
                            <span className="rating-badge">
                              {'⭐'.repeat(Math.floor(product.rating))} {product.rating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="rating-badge no-rating">
                              No ratings yet
                            </span>
                          )}
                        </td>
                        <td className="sales-count">{product.salesCount} sales</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

        .analytics-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .error-message {
          background: #fff3cd;
          color: #856404;
          padding: 8px 12px;
          border-radius: 6px;
          margin-top: 8px;
          font-size: 12px;
        }

        .toggle-buttons {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .toggle-btn {
          padding: 10px 20px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .toggle-btn:hover {
          border-color: #F06292;
          color: #F06292;
        }

        .toggle-btn.active {
          background: #F06292;
          border-color: #F06292;
          color: white;
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
          font-weight: 500;
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

        .tooltip-label {
          margin: 0 0 4px 0;
          font-weight: bold;
          color: #333;
        }

        .tooltip-orders {
          margin: 0 0 2px 0;
          color: #42A5F5;
          font-size: 14px;
        }

        .tooltip-revenue {
          margin: 0;
          color: #F06292;
          font-size: 14px;
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

        .no-data {
          text-align: center;
          color: #888;
          font-style: italic;
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

        .product-analysis-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
          align-items: start;
        }

        .pie-chart-section {
          background: white;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e0e0e0;
        }

        .pie-chart-section h4 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .product-sales-table-section {
          background: white;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e0e0e0;
        }

        .product-sales-table-section h4 {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .product-table-wrapper {
          overflow-x: auto;
          max-height: 450px;
          overflow-y: auto;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .product-sales-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-size: 13px;
        }

        .product-sales-table th {
          background: #f8f9fa;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .product-sales-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #f0f0f0;
          color: #555;
        }

        .product-sales-table tr {
          transition: background-color 0.2s ease;
        }

        .product-sales-table tr:hover {
          background: #f8f9fa;
        }

        .product-sales-table tr.top-product {
          background: #fff3e0;
        }

        .product-sales-table tr.top-product:hover {
          background: #ffe0b2;
        }

        .product-sales-table .product-name {
          font-weight: 500;
          max-width: 120px;
          word-break: break-word;
        }

        .product-sales-table .quantity {
          text-align: center;
          font-weight: 600;
          color: #42A5F5;
        }

        .product-sales-table .revenue {
          color: #F06292;
          font-weight: 600;
        }

        .product-sales-table .avg-price {
          color: #66BB6A;
        }

        .product-sales-table .rating {
          text-align: center;
        }

        .rating-badge {
          background: #fff3e0;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          display: inline-block;
        }

        .rating-badge.no-rating {
          background: #f5f5f5;
          color: #999;
          font-style: italic;
        }

        .product-sales-table .sales-count {
          text-align: center;
          color: #888;
          font-size: 12px;
        }

        .pie-chart-container {
          display: flex;
          justify-content: center;
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
            margin: 10px 0;
          }

          .toggle-buttons {
            justify-content: center;
          }

          .toggle-btn {
            padding: 8px 16px;
            font-size: 12px;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .chart-container {
            padding: 16px;
          }

          .product-analysis-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .product-sales-table {
            font-size: 11px;
          }

          .product-sales-table th,
          .product-sales-table td {
            padding: 8px 4px;
          }

          .product-sales-table th {
            font-size: 11px;
          }

          .product-table-wrapper {
            max-height: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default TimeBasedSellerAnalytics;