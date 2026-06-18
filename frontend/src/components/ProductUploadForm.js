import React, { useState } from 'react';
import { productAPI } from '../services/api';
import { PRODUCT_CATEGORIES } from '../constants/categories';

export default function ProductUploadForm({ onProductAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Clothing',
    description: '',
    price: '',
    quantity: '',
    size: '',
    imageUrl: '',
    predictedDeliveryDays: 3,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? value : 
              name === 'quantity' ? parseInt(value) || '' :
              name === 'predictedDeliveryDays' ? parseInt(value) || 3 :
              value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
    if (url) {
      setImagePreview(url);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage('Product name is required');
      setMessageType('error');
      return false;
    }
    if (!formData.category) {
      setMessage('Category is required');
      setMessageType('error');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setMessage('Valid price is required');
      setMessageType('error');
      return false;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setMessage('Valid quantity is required');
      setMessageType('error');
      return false;
    }
    if (!formData.imageUrl.trim()) {
      setMessage('Image URL is required');
      setMessageType('error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        size: formData.size.trim() || null,
        imageUrl: formData.imageUrl.trim(),
        predictedDeliveryDays: formData.predictedDeliveryDays,
      };

      const response = await productAPI.createProduct(payload);
      
      setMessage('Product uploaded successfully!');
      setMessageType('success');
      
      setFormData({
        name: '',
        category: 'Clothing',
        description: '',
        price: '',
        quantity: '',
        size: '',
        imageUrl: '',
        predictedDeliveryDays: 3,
      });
      setImagePreview(null);

      if (onProductAdded) {
        onProductAdded(response.data);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload product';
      setMessage(errorMsg);
      setMessageType('error');
      console.error('Upload error:', error);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-upload-form">
      {message && (
        <div className={`form-message ${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        <h2 className="form-title">Add New Product</h2>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Brand</label>
            <input
              type="text"
              placeholder="Enter brand name"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              step="0.01"
              min="0"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">MRP (₹)</label>
            <input
              type="number"
              placeholder="Enter MRP"
              step="0.01"
              min="0"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stock Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              min="1"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-input form-select"
              required
            >
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age Group</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              placeholder="e.g. 0-6 months"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your product - materials, care instructions, features, etc."
            rows="4"
            className="form-input form-textarea"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Upload Image or Enter URL *</label>
            <div className="image-upload-section">
              <div className="file-upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-label">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Click to upload or drag and drop</span>
                </label>
              </div>

              <div className="or-divider">OR</div>

              <input
                type="url"
                value={formData.imageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                className="form-input"
              />
            </div>
          </div>

          {imagePreview && (
            <div className="form-group">
              <label className="form-label">Image Preview</label>
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="preview-img"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Uploading Product...' : 'Upload Product'}
        </button>
      </form>

      <style>{`
        .product-upload-form {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 40px;
        }

        .form-message {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 600;
          text-align: center;
        }

        .form-message.success {
          background: #D1FAE5;
          color: #065F46;
        }

        .form-message.error {
          background: #FEE2E2;
          color: #991B1B;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-title {
          font-size: 24px;
          font-weight: 700;
          color: #333;
          margin: 0;
          padding-bottom: 16px;
          border-bottom: 2px solid #F0F0F0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 12px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s ease;
          background: #FAFAFA;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #F06292;
          background: white;
          box-shadow: 0 0 0 3px rgba(240, 98, 146, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        .image-upload-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .file-upload-box {
          border: 2px dashed #F06292;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
          background: #FFF5F8;
        }

        .file-upload-box:hover {
          border-color: #EC407A;
          background: #FFE8F0;
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #F06292;
          font-weight: 600;
          font-size: 14px;
        }

        .file-label svg {
          color: #F06292;
        }

        .or-divider {
          text-align: center;
          color: #999;
          font-size: 12px;
          font-weight: 600;
          position: relative;
        }

        .or-divider::before,
        .or-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 45%;
          height: 1px;
          background: #E5E7EB;
        }

        .or-divider::before {
          left: 0;
        }

        .or-divider::after {
          right: 0;
        }

        .image-preview {
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FAFAFA;
        }

        .preview-img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }

        .submit-btn {
          background: #F06292;
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(240, 98, 146, 0.3);
          margin-top: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #EC407A;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(240, 98, 146, 0.4);
        }

        .submit-btn:disabled {
          background: #CCC;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .product-upload-form {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .form-title {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .product-upload-form {
            padding: 16px;
          }

          .form-content {
            gap: 16px;
          }

          .form-title {
            font-size: 18px;
            padding-bottom: 12px;
          }
        }
      `}</style>
    </div>
  );
}
