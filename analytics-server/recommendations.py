"""
Product Recommendation Engine using Data Science
Provides intelligent product recommendations based on:
- Category similarity
- Rating and popularity
- Price range
- Stock availability
"""

import json
import numpy as np
from collections import defaultdict
from datetime import datetime

class RecommendationEngine:
    def __init__(self):
        """Initialize the recommendation engine"""
        self.category_weights = defaultdict(float)
        self.product_vectors = {}
        
    def normalize_price(self, price, min_price, max_price):
        """Normalize price to 0-1 range"""
        if max_price == min_price:
            return 0.5
        return (price - min_price) / (max_price - min_price)
    
    def calculate_product_vector(self, product, all_products):
        """
        Create a feature vector for a product
        Features: price (normalized), rating, popularity (review count), stock
        """
        if not all_products:
            return np.array([0, 0, 0, 0])
        
        # Extract prices for normalization
        prices = [p.get('price', 0) for p in all_products]
        min_price = min(prices) if prices else 0
        max_price = max(prices) if prices else 1
        
        # Normalize features
        normalized_price = self.normalize_price(
            product.get('price', 0), 
            min_price, 
            max_price
        )
        normalized_rating = (product.get('rating', 0) or 0) / 5.0  # 0-1 scale
        review_count = min(product.get('reviewCount', 0) or 0, 100) / 100.0  # Normalize
        has_stock = 1.0 if product.get('quantity', 0) > 0 else 0.0
        
        return np.array([
            normalized_price,
            normalized_rating,
            review_count,
            has_stock
        ])
    
    def calculate_cosine_similarity(self, vec1, vec2):
        """Calculate cosine similarity between two vectors"""
        if np.linalg.norm(vec1) == 0 or np.linalg.norm(vec2) == 0:
            return 0.0
        
        dot_product = np.dot(vec1, vec2)
        norms_product = np.linalg.norm(vec1) * np.linalg.norm(vec2)
        
        if norms_product == 0:
            return 0.0
        
        return dot_product / norms_product
    
    def get_recommendations(self, current_product, all_products, limit=5):
        """
        Get product recommendations based on similarity
        
        Args:
            current_product: The product to get recommendations for
            all_products: List of all available products
            limit: Maximum number of recommendations to return
            
        Returns:
            List of recommended products sorted by relevance score
        """
        recommendations = []
        
        if not all_products or not current_product:
            return recommendations
        
        # Create feature vector for current product
        current_vector = self.calculate_product_vector(current_product, all_products)
        
        # Score all other products
        product_scores = []
        
        for product in all_products:
            # Skip the current product
            if product.get('id') == current_product.get('id'):
                continue
            
            # Category match (most important)
            category_match = 1.0 if product.get('category') == current_product.get('category') else 0.6
            
            # Calculate similarity using feature vectors
            product_vector = self.calculate_product_vector(product, all_products)
            vector_similarity = self.calculate_cosine_similarity(current_vector, product_vector)
            
            # Calculate composite score
            # Weight: Category (40%), Vector Similarity (40%), Stock (20%)
            composite_score = (
                category_match * 0.4 +
                vector_similarity * 0.4 +
                (1.0 if product.get('quantity', 0) > 0 else 0.0) * 0.2
            )
            
            # Boost score if product has good ratings
            if product.get('rating', 0):
                composite_score *= (1 + (product.get('rating', 0) / 5.0) * 0.2)
            
            product_scores.append({
                'product': product,
                'score': composite_score,
                'category_match': category_match == 1.0
            })
        
        # Sort by score and get top recommendations
        product_scores.sort(key=lambda x: (-x['score'], x['product'].get('name', '')))
        recommendations = [item['product'] for item in product_scores[:limit]]
        
        return recommendations
    
    def get_category_based_recommendations(self, category, all_products, limit=5, exclude_id=None):
        """
        Get recommendations for all products in a specific category
        
        Args:
            category: The product category
            all_products: List of all available products
            limit: Maximum number of recommendations
            exclude_id: Product ID to exclude from recommendations
            
        Returns:
            List of recommended products from the category
        """
        # Filter by category
        category_products = [
            p for p in all_products 
            if p.get('category') == category and p.get('id') != exclude_id
        ]
        
        # Sort by rating and review count (popularity)
        category_products.sort(
            key=lambda x: (
                -(x.get('rating', 0) or 0),
                -(x.get('reviewCount', 0) or 0)
            )
        )
        
        return category_products[:limit]
    
    def get_trending_products(self, all_products, limit=5):
        """
        Get trending products based on ratings and review count
        """
        # Filter products with stock
        in_stock_products = [p for p in all_products if p.get('quantity', 0) > 0]
        
        # Score based on rating and popularity
        scored_products = []
        for product in in_stock_products:
            score = (
                (product.get('rating', 0) or 0) * 0.7 +
                min((product.get('reviewCount', 0) or 0) / 50, 5) * 0.3
            )
            scored_products.append((product, score))
        
        # Sort and return top products
        scored_products.sort(key=lambda x: -x[1])
        return [p[0] for p in scored_products[:limit]]


# Flask endpoint handlers (to be integrated with app.py)
def get_product_recommendations_handler(current_product_dict, all_products_list):
    """
    Handler for getting product recommendations
    
    Args:
        current_product_dict: Current product data as dictionary
        all_products_list: List of all products as dictionaries
        
    Returns:
        Dictionary with recommended products
    """
    engine = RecommendationEngine()
    
    # Convert to expected format if needed
    recommendations = engine.get_recommendations(
        current_product_dict,
        all_products_list,
        limit=6
    )
    
    return {
        'success': True,
        'data': recommendations,
        'count': len(recommendations)
    }


def get_category_recommendations_handler(category, all_products_list, exclude_id=None, limit=6):
    """
    Handler for getting category-based recommendations
    """
    engine = RecommendationEngine()
    
    recommendations = engine.get_category_based_recommendations(
        category,
        all_products_list,
        limit=limit,
        exclude_id=exclude_id
    )
    
    return {
        'success': True,
        'data': recommendations,
        'count': len(recommendations)
    }


if __name__ == '__main__':
    # Test the recommendation engine
    test_products = [
        {'id': 1, 'name': 'Toy A', 'category': 'Toys & Development', 'price': 500, 'rating': 4.5, 'reviewCount': 50, 'quantity': 10},
        {'id': 2, 'name': 'Toy B', 'category': 'Toys & Development', 'price': 600, 'rating': 4.2, 'reviewCount': 30, 'quantity': 5},
        {'id': 3, 'name': 'Toy C', 'category': 'Toys & Development', 'price': 700, 'rating': 4.8, 'reviewCount': 100, 'quantity': 15},
        {'id': 4, 'name': 'Clothing A', 'category': 'Clothing', 'price': 500, 'rating': 4.0, 'reviewCount': 20, 'quantity': 8},
    ]
    
    engine = RecommendationEngine()
    current_product = test_products[0]
    
    recommendations = engine.get_recommendations(current_product, test_products)
    print(f"Recommendations for {current_product['name']}:")
    for rec in recommendations:
        print(f"  - {rec['name']} (Category: {rec['category']})")
