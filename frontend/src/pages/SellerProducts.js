// frontend/src/pages/SellerProducts.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { productAPI } from '../services/api';
import ProductUploadForm from '../components/ProductUploadForm';

export default function SellerProducts() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockData, setStockData] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Redirect if not seller
  useEffect(() => {
    if (user && user.role !== 'SELLER') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch seller's products
  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const fetchSellerProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getSellerProducts(user?.id);
      setProducts(response.data);
      console.log('Seller products refreshed:', response.data); // Debug log
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setMessage('Failed to load your products');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = (newProduct) => {
    setProducts([newProduct, ...products]);
    setShowForm(false);
    setMessage('Product added successfully');
    setMessageType('success');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productAPI.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setMessage('Product deleted successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete product');
      setMessageType('error');
      console.error('Delete error:', error);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      size: product.size || '',
      imageUrl: product.imageUrl,
      predictedDeliveryDays: product.predictedDeliveryDays,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? value :
              name === 'quantity' ? parseInt(value) || '' :
              name === 'predictedDeliveryDays' ? parseInt(value) || 3 :
              value
    }));
  };

  const handleSaveEdit = async (productId) => {
    try {
      const response = await productAPI.updateProduct(productId, editFormData);
      setProducts(products.map(p => p.id === productId ? response.data : p));
      setEditingId(null);
      setEditFormData(null);
      setMessage('Product updated successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update product');
      setMessageType('error');
      console.error('Update error:', error);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const fetchStockData = async () => {
    setStockLoading(true);
    try {
      // Fetch products with their ratings
      const productsResponse = await productAPI.getSellerProducts(user?.id);
      const productsData = productsResponse.data;
      
      console.log('Fetched products:', productsData); // Debug log
      
      // Fetch ratings for each product
      const stockDataWithRatings = await Promise.all(
        productsData.map(async (product) => {
          try {
            // Use the same token for authentication
            const token = localStorage.getItem('token');
            const ratingsResponse = await fetch(`http://localhost:8080/api/reviews/product/${product.id}`, {
              headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
              }
            });
            
            console.log(`Ratings response for product ${product.id}:`, ratingsResponse.status); // Debug log
            
            const ratings = ratingsResponse.ok ? await ratingsResponse.json() : [];
            console.log(`Ratings data for product ${product.id}:`, ratings); // Debug log
            
            // Calculate average rating
            let avgRating = 'No ratings';
            let totalReviews = 0;
            
            if (ratings && ratings.length > 0) {
              const sum = ratings.reduce((total, review) => total + (review.rating || 0), 0);
              avgRating = (sum / ratings.length).toFixed(1);
              totalReviews = ratings.length;
            }
            
            return {
              id: product.id,
              name: product.name,
              category: product.category,
              availableStock: product.quantity,
              cumulativeRating: avgRating,
              totalReviews: totalReviews
            };
          } catch (error) {
            console.error(`Failed to fetch ratings for product ${product.id}:`, error);
            return {
              id: product.id,
              name: product.name,
              category: product.category,
              availableStock: product.quantity,
              cumulativeRating: 'No ratings',
              totalReviews: 0
            };
          }
        })
      );
      
      console.log('Final stock data with ratings:', stockDataWithRatings); // Debug log
      setStockData(stockDataWithRatings);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      setMessage('Failed to load stock data');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setStockLoading(false);
    }
  };

  const handleCheckStock = () => {
    setShowStockModal(true);
    fetchStockData();
  };

  if (loading) {
    return null;
  }

  return (
    <div className="seller-products-page">
      {/* Global Message */}
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg font-medium z-50 ${
          messageType === 'success'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="products-container">
        {/* Header Section */}
        <div className="products-header">
          <div className="header-left">
            <h1 className="products-title">
              <span className="title-icon">📦</span>
              My Products
            </h1>
          </div>
          <div className="header-buttons">
            <button 
              className="refresh-products-btn"
              onClick={fetchSellerProducts}
              disabled={loading}
            >
              <span className="refresh-icon">🔄</span>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              className="check-stock-btn"
              onClick={handleCheckStock}
            >
              <span className="stock-icon">📊</span>
              Check Stock
            </button>
            <button 
              className="add-product-btn"
              onClick={() => setShowForm(!showForm)}
            >
              <span className="plus-icon">+</span>
              Add Product
            </button>
          </div>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="form-section">
            <ProductUploadForm onProductAdded={handleProductAdded} />
            <button 
              className="cancel-form-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">No products yet. Start by adding your first product!</p>
            <button
              onClick={() => setShowForm(true)}
              className="add-product-btn"
            >
              <span className="plus-icon">+</span>
              Add Product
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                {editingId === product.id ? (
                  // Edit Mode
                  <div className="edit-mode">
                    <div className="edit-form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        placeholder="Product name"
                      />
                    </div>
                    <div className="edit-form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        placeholder="Price"
                        step="0.01"
                      />
                    </div>
                    <div className="edit-form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={editFormData.quantity}
                        onChange={handleEditChange}
                        placeholder="Quantity"
                      />
                    </div>
                    <div className="edit-form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        placeholder="Description"
                        rows="2"
                      />
                    </div>
                    <div className="edit-buttons">
                      <button
                        onClick={() => handleSaveEdit(product.id)}
                        className="save-btn"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditFormData(null);
                        }}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    {/* Product Image */}
                    <div className="product-image">
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.name}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-price">₹{product.price}</p>
                      <p className="product-stock">Stock: {product.quantity}</p>
                      <span className="product-category">{product.category}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="product-actions">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stock Management Modal */}
        {showStockModal && (
          <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
            <div className="stock-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  <span className="modal-icon">📊</span>
                  Stock Management
                </h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowStockModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                {stockLoading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading stock data...</p>
                  </div>
                ) : (
                  <div className="stock-table-wrapper">
                    <table className="stock-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Available Stock</th>
                          <th>Cumulative Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockData.length > 0 ? (
                          stockData.map((item) => (
                            <tr key={item.id}>
                              <td className="product-name-cell">{item.name}</td>
                              <td className="category-cell">
                                <span className="category-badge">{item.category}</span>
                              </td>
                              <td className="stock-cell">
                                <span className={`stock-badge ${
                                  item.availableStock === 0 ? 'out-of-stock' :
                                  item.availableStock < 10 ? 'low-stock' : 'in-stock'
                                }`}>
                                  {item.availableStock}
                                </span>
                              </td>
                              <td className="rating-cell">
                                {item.cumulativeRating !== 'No ratings' ? (
                                  <div className="rating-display">
                                    <span className="rating-stars">
                                      {'⭐'.repeat(Math.floor(parseFloat(item.cumulativeRating)))}
                                    </span>
                                    <span className="rating-number">
                                      {item.cumulativeRating}/5
                                    </span>
                                    <span className="review-count">
                                      ({item.totalReviews} reviews)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="no-rating">No ratings yet</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="no-data">
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  className="refresh-btn"
                  onClick={fetchStockData}
                  disabled={stockLoading}
                >
                  <span className="refresh-icon">🔄</span>
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .seller-products-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 50%, #E1F5FE 100%);
          padding: 40px 20px;
        }

        .products-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .products-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-buttons {
          display: flex;
          gap: 12px;
        }

        .products-title {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-icon {
          font-size: 36px;
        }

        .add-product-btn,
        .check-stock-btn,
        .refresh-products-btn {
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
        }

        .check-stock-btn {
          background: linear-gradient(135deg, #F06292 0%, #EC407A 100%);
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.4);
        }

        .add-product-btn:hover,
        .check-stock-btn:hover,
        .refresh-products-btn:hover {
          background: linear-gradient(135deg, #F06292 0%, #E91E63 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(240, 98, 146, 0.4);
        }

        .plus-icon,
        .stock-icon,
        .refresh-icon {
          font-size: 20px;
          font-weight: bold;
        }

        .form-section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .cancel-form-btn {
          background: #999;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
          transition: all 0.3s ease;
        }

        .cancel-form-btn:hover {
          background: #777;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .empty-text {
          font-size: 18px;
          color: #666;
          margin-bottom: 24px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .product-image {
          width: 100%;
          height: 200px;
          background: #f5f5f5;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          padding: 16px;
        }

        .product-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .product-price {
          font-size: 20px;
          font-weight: 700;
          color: #F06292;
          margin: 0 0 4px 0;
        }

        .product-stock {
          font-size: 14px;
          color: #666;
          margin: 0 0 12px 0;
        }

        .product-category {
          display: inline-block;
          background: #FFE0E6;
          color: #F06292;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-actions {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          border-top: 1px solid #f0f0f0;
        }

        .edit-btn,
        .delete-btn {
          flex: 1;
          padding: 10px 12px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .edit-btn {
          background: #ff4c91;
          color: white;
        }

        .edit-btn:hover {
          background: #ff4c91;
        }

        .delete-btn {
          background: #ffccd6;
          color: white;
        }

        .delete-btn:hover {
          background: #ffdfdf;
        }

        .edit-mode {
          padding: 20px;
        }

        .edit-form-group {
          margin-bottom: 16px;
        }

        .edit-form-group label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .edit-form-group input,
        .edit-form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .edit-form-group input:focus,
        .edit-form-group textarea:focus {
          outline: none;
          border-color: #F06292;
          box-shadow: 0 0 0 3px rgba(240, 98, 146, 0.1);
        }

        .edit-buttons {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .save-btn,
        .cancel-btn {
          flex: 1;
          padding: 10px 12px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .save-btn {
          background: #dc3172;
          color: white;
        }

        .save-btn:hover {
          background: #da668b;
        }

        .cancel-btn {
          background: #999;
          color: white;
        }

        .cancel-btn:hover {
          background: #777;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .stock-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 32px;
          border-bottom: 2px solid #f0f0f0;
          background: linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%);
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-icon {
          font-size: 28px;
        }

        .close-modal-btn {
          background: none;
          border: none;
          font-size: 32px;
          color: #999;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .close-modal-btn:hover {
          background: #f0f0f0;
          color: #666;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #dc3172;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .stock-table-wrapper {
          overflow-x: auto;
        }

        .stock-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .stock-table thead {
          background: linear-gradient(135deg, #ff9cc2 0%, #dc5b8d 100%);
          color: white;
        }

        .stock-table th {
          padding: 16px 20px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stock-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: middle;
        }

        .stock-table tbody tr:hover {
          background: #f8f9fa;
        }

        .product-name-cell {
          font-weight: 600;
          color: #333;
          max-width: 200px;
        }

        .category-cell {
          text-align: center;
        }

        .category-badge {
          background: linear-gradient(135deg, #FFE0E6 0%, #FFCDD2 100%);
          color: #F06292;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }

        .stock-cell {
          text-align: center;
        }

        .stock-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 14px;
          display: inline-block;
          min-width: 40px;
          text-align: center;
        }

        .stock-badge.in-stock {
          background: linear-gradient(135deg, #ff9cc2 0%, #dd6c97 100%);
          color: #b84470;
        }

        .stock-badge.low-stock {
          background: linear-gradient(135deg, #ff9cc2 0%, #e09cb6 100%);
          color: #8a3d5a;
        }

        .stock-badge.out-of-stock {
          background: linear-gradient(135deg, #ff9cc2 0%, #ec74a2 100%);
          color: #492130;
        }

        .rating-cell {
          text-align: center;
        }

        .rating-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .rating-stars {
          font-size: 16px;
          line-height: 1;
        }

        .rating-number {
          font-weight: 700;
          color: #ff9cc2;
          font-size: 14px;
        }

        .review-count {
          font-size: 11px;
          color: #666;
        }

        .no-rating {
          color: #999;
          font-style: italic;
          font-size: 13px;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 40px 20px !important;
          font-style: italic;
        }

        .modal-footer {
          padding: 20px 32px;
          border-top: 2px solid #f0f0f0;
          background: #f8f9fa;
          display: flex;
          justify-content: center;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #da5789 0%, #ff9cc2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px #ff9cc2;
        }

        .refresh-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff9cc2 0%, #ff9cc2 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px #ff9cc2;
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .refresh-icon {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .products-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-buttons {
            width: 100%;
            flex-direction: column;
            gap: 12px;
          }

          .add-product-btn,
          .check-stock-btn,
          .refresh-products-btn {
            width: 100%;
            justify-content: center;
          }

          .products-title {
            font-size: 24px;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }

          .stock-modal {
            margin: 10px;
            max-height: 90vh;
          }

          .modal-header {
            padding: 20px 24px;
          }

          .modal-title {
            font-size: 20px;
          }

          .stock-table th,
          .stock-table td {
            padding: 12px 16px;
            font-size: 13px;
          }

          .modal-footer {
            padding: 16px 24px;
          }
        }

        @media (max-width: 480px) {
          .seller-products-page {
            padding: 20px 12px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .products-title {
            font-size: 20px;
          }

          .form-section {
            padding: 20px;
          }

          .header-buttons {
            gap: 10px;
          }

          .add-product-btn,
          .check-stock-btn,
          .refresh-products-btn {
            padding: 10px 20px;
            font-size: 14px;
          }

          .stock-modal {
            margin: 5px;
            border-radius: 12px;
          }

          .modal-header {
            padding: 16px 20px;
          }

          .modal-title {
            font-size: 18px;
          }

          .stock-table {
            font-size: 12px;
          }

          .stock-table th,
          .stock-table td {
            padding: 10px 12px;
          }

          .category-badge {
            font-size: 10px;
            padding: 4px 8px;
          }

          .stock-badge {
            font-size: 12px;
            padding: 6px 12px;
          }

          .rating-stars {
            font-size: 14px;
          }

          .rating-number {
            font-size: 12px;
          }

          .review-count {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
