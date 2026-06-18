import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const SmartRecommendations = ({ userCategory = 'toys', maxItems = 6 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [userCategory, maxItems]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setRecommendations([]);
        return;
      }

      const response = await fetch('/api/products/search', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter(product => 
          product.category?.toLowerCase().includes(userCategory.toLowerCase())
        ).slice(0, maxItems);
        
        setRecommendations(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recommendations-loading">
        <div className="spinner"></div>
        <p>Loading recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-empty">
        <h3>🎯 Smart Recommendations</h3>
        <p>No recommendations available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="smart-recommendations">
      <div className="recommendations-header">
        <h3>🎯 Recommended for You</h3>
        <p>Based on your interest in {userCategory}</p>
      </div>
      
      <div className="recommendations-grid">
        {recommendations.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <style>{`
        .smart-recommendations {
          margin: 40px 0;
        }

        .recommendations-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .recommendations-header h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 8px 0;
        }

        .recommendations-header p {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .recommendations-loading,
        .recommendations-empty {
          text-align: center;
          padding: 60px 20px;
        }

        .recommendations-loading .spinner {
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

        .recommendations-empty h3 {
          font-size: 1.5rem;
          color: #333;
          margin: 0 0 8px 0;
        }

        .recommendations-empty p {
          color: #666;
          margin: 0;
        }

        @media (max-width: 768px) {
          .recommendations-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
          }

          .recommendations-header h3 {
            font-size: 1.5rem;
          }

          .recommendations-header p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartRecommendations;