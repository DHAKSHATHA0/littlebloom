// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  getCurrentUser: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

// Product APIs
export const productAPI = {
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  getProductById: (id) => api.get(`/api/products/${id}`),
  getAllProducts: (page = 0, size = 10) => 
    api.get(`/api/products?page=${page}&size=${size}`),
  searchProducts: (search, page = 0, size = 10) => 
    api.get(`/api/products/search?search=${search}&page=${page}&size=${size}`),
  getProductsByCategory: (category, page = 0, size = 10) =>
    api.get(`/api/products/category/${category}?page=${page}&size=${size}`),
  getSellerProducts: (sellerId) =>
    api.get(`/api/products/seller/${sellerId}`),
  getAllCategories: () =>
    api.get('/api/products/categories/all'),
};

// Cart APIs
export const cartAPI = {
  addToCart: (data) => api.post('/api/cart/add', data),
  getCart: () => api.get('/api/cart'),
  removeFromCart: (productId) => api.delete(`/api/cart/remove/${productId}`),
  updateCartQuantity: (productId, quantity) =>
    api.put(`/api/cart/update/${productId}?quantity=${quantity}`),
  clearCart: () => api.delete('/api/cart/clear'),
};

// Order APIs
export const orderAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData), // ✅ pass orderData
  getBuyerOrders: (page = 0, size = 10) =>
    api.get(`/api/orders?page=${page}&size=${size}`),
  getUserOrders: (page = 0, size = 10) =>
    api.get(`/api/orders?page=${page}&size=${size}`),
  getBuyerOrdersAll: () =>
    api.get('/api/orders/all'),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  getSellerOrdersAll: () =>
    api.get('/api/orders/seller/all'),
  getSellerOrdersPaginated: (page = 0, size = 10) =>
    api.get(`/api/orders/seller/paginated?page=${page}&size=${size}`),
  updateOrderItemStatus: (itemId, status) =>
    api.put(`/api/orders/item/${itemId}/status`, { status }),
  updateOrderStatus: (orderId, status) =>
    api.put(`/api/orders/${orderId}/status`, { status }),
};

// Review APIs
export const reviewAPI = {
  createReview: (data) => api.post('/api/reviews', data),
  getProductReviews: (productId) =>
    api.get(`/api/reviews/product/${productId}`),
  getUserReviews: () =>
    api.get('/api/reviews/user'),
  getProductAverageRating: (productId) =>
    api.get(`/api/reviews/product/${productId}/rating`),
  getProductReviewCount: (productId) =>
    api.get(`/api/reviews/product/${productId}/count`),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: () => api.get('/api/notifications'),
  getUnreadNotifications: () =>
    api.get('/api/notifications/unread'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
};

// Wishlist APIs
export const wishlistAPI = {
  addToWishlist: (data) => api.post('/api/wishlist', data),
  removeFromWishlist: (productId) =>
    api.delete(`/api/wishlist/${productId}`),
  getWishlist: () => api.get('/api/wishlist'),
  isInWishlist: (productId) =>
    api.get(`/api/wishlist/${productId}/check`),
};

// Analytics APIs (Unified Endpoint)
export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
  getSalesLast30Days: () => api.get('/api/analytics/sales/last-30-days'),
  getSalesThisWeek: () => api.get('/api/analytics/sales/week'),
  getSalesThisMonth: () => api.get('/api/analytics/sales/month'),
  getDailySalesChart: (days = 7) => api.get(`/api/analytics/sales/daily?days=${days}`),
  predictNextMonthSales: () => api.get('/api/analytics/prediction/next-month'),
  getTrendAnalysis: (windowSize = 7) => api.get(`/api/analytics/trend-analysis?windowSize=${windowSize}`),
  getTimeBasedDashboard: () => api.get('/api/analytics/time/dashboard'),
  getProductAnalytics: () => api.get('/api/analytics/time/product'),
  getProductRatings: (productId) => api.get(`/api/analytics/product/${productId}/ratings`),
  getSmartRecommendations: (category) => api.get(`/api/analytics/recommendations?category=${category}`),
  predictDeliveryTime: (data) => api.post('/api/analytics/predict/delivery', data),
  analyzeSentiment: (feedback) => api.post('/api/analytics/sentiment/analyze', { feedback }),
  getPythonDashboard: () => api.get('/api/analytics/python/dashboard'),
  getVolatility: () => api.get('/api/analytics/volatility'),
  detectAnomalies: () => api.get('/api/analytics/anomalies'),
  getARIMAForecast: () => api.get('/api/analytics/arima-forecast'),
  getCorrelation: () => api.get('/api/analytics/correlation'),
  healthCheck: () => api.get('/api/analytics/health'),
};

export default api;
