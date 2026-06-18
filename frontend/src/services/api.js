// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Product APIs
export const productAPI = {
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getProductById: (id) => api.get(`/products/${id}`),
  getAllProducts: (page = 0, size = 10) => 
    api.get(`/products?page=${page}&size=${size}`),
  searchProducts: (search, page = 0, size = 10) => 
    api.get(`/products/search?search=${search}&page=${page}&size=${size}`),
  getProductsByCategory: (category, page = 0, size = 10) =>
    api.get(`/products/category/${category}?page=${page}&size=${size}`),
  getSellerProducts: (sellerId) =>
    api.get(`/products/seller/${sellerId}`),
  getAllCategories: () =>
    api.get('/products/categories/all'),
};

// Cart APIs
export const cartAPI = {
  addToCart: (data) => api.post('/cart/add', data),
  getCart: () => api.get('/cart'),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  updateCartQuantity: (productId, quantity) =>
    api.put(`/cart/update/${productId}?quantity=${quantity}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Order APIs
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData), // ✅ pass orderData
  getBuyerOrders: (page = 0, size = 10) =>
    api.get(`/orders?page=${page}&size=${size}`),
  getUserOrders: (page = 0, size = 10) =>
    api.get(`/orders?page=${page}&size=${size}`),
  getBuyerOrdersAll: () =>
    api.get('/orders/all'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getSellerOrdersAll: () =>
    api.get('/orders/seller/all'),
  getSellerOrdersPaginated: (page = 0, size = 10) =>
    api.get(`/orders/seller/paginated?page=${page}&size=${size}`),
  updateOrderItemStatus: (itemId, status) =>
    api.put(`/orders/item/${itemId}/status`, { status }),
  updateOrderStatus: (orderId, status) =>
    api.put(`/orders/${orderId}/status`, { status }),
};

// Review APIs
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getProductReviews: (productId) =>
    api.get(`/reviews/product/${productId}`),
  getUserReviews: () =>
    api.get('/reviews/user'),
  getProductAverageRating: (productId) =>
    api.get(`/reviews/product/${productId}/rating`),
  getProductReviewCount: (productId) =>
    api.get(`/reviews/product/${productId}/count`),
};

// Notification APIs
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  getUnreadNotifications: () =>
    api.get('/notifications/unread'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// Wishlist APIs
export const wishlistAPI = {
  addToWishlist: (data) => api.post('/wishlist', data),
  removeFromWishlist: (productId) =>
    api.delete(`/wishlist/${productId}`),
  getWishlist: () => api.get('/wishlist'),
  isInWishlist: (productId) =>
    api.get(`/wishlist/${productId}/check`),
};

export default api;
