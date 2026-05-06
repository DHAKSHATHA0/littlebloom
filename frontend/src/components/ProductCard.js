// frontend/src/components/ProductCard.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user) {
      setMessage('Please log in to add items to cart');
      setMessageType('error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Check stock
    if (product.quantity <= 0) {
      setMessage('This product is out of stock');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const result = await addToCart(product.id, parseInt(quantity));
      if (result.success) {
        setMessage('Item added to cart successfully!');
        setMessageType('success');
        setQuantity(1); // Reset quantity
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to add item to cart');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-lg font-bold">Out of Stock</span>
          </div>
        )}
        {user?.role === 'SELLER' && user?.id === product.sellerId && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Your Product
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="mb-2">
          <span className="inline-block bg-pink-100 text-pink-700 text-xs font-medium px-2 py-1 rounded">
            {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Product Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description || 'No description available'}
        </p>

        {/* Price */}
        <div className="mb-3">
          <div className="text-xl font-bold text-pink-600 mb-1">
            ₹{product.price}
          </div>
          <div className="text-xs text-gray-500">
            Stock: <span className={isOutOfStock ? 'text-red-600' : 'text-green-600'}>
              {product.quantity} available
            </span>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-3 p-2 rounded text-sm font-medium text-center ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Quantity and Add to Cart */}
        {!isOutOfStock && user?.role !== 'SELLER' && (
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max={product.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, e.target.value)))}
              disabled={loading}
              className="w-16 px-2 py-2 border border-gray-300 rounded text-center disabled:bg-gray-100"
            />
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="flex-1 bg-pink-600 text-white py-2 rounded font-semibold hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        )}

        {/* Seller or Out of Stock Message */}
        {(isOutOfStock || user?.role === 'SELLER') && (
          <div className="text-center py-2 text-gray-600 font-medium">
            {isOutOfStock ? 'Out of Stock' : 'Manage in Dashboard'}
          </div>
        )}

        {/* View Details Link */}
        <div className="mt-3 text-center">
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="text-pink-600 text-sm font-medium hover:underline"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
