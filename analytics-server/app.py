#!/usr/bin/env python3
"""
Little Bloom - Enhanced Data Science Analytics Server
Python Flask API for comprehensive AI/ML features
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime, timedelta
import warnings
import logging
from analytics import TimeBasedSalesAnalytics
from recommendations import RecommendationEngine
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ==============================================================================
# ENHANCED DATA SCIENCE FUNCTIONS
# ==============================================================================

class EnhancedSalesAnalytics:
    """Enhanced Data Science Analytics using NumPy, Pandas, scikit-learn"""
    
    @staticmethod
    def comprehensive_sales_analytics(orders_data):
        """
        Comprehensive sales analytics with weekly, monthly, yearly breakdown
        
        Args:
            orders_data: List of order dictionaries with date, amount, category
            
        Returns:
            dict with weekly, monthly, yearly analytics
        """
        try:
            if not orders_data:
                return {"weekly": [], "monthly": [], "yearly": [], "trends": {}}
            
            # Convert to DataFrame
            df = pd.DataFrame(orders_data)
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
            
            # Weekly aggregation
            weekly = df.resample('W').agg({
                'amount': ['sum', 'count', 'mean']
            }).round(2)
            
            # Monthly aggregation
            monthly = df.resample('M').agg({
                'amount': ['sum', 'count', 'mean']
            }).round(2)
            
            # Yearly aggregation
            yearly = df.resample('Y').agg({
                'amount': ['sum', 'count', 'mean']
            }).round(2)
            
            # Calculate trends
            total_revenue = df['amount'].sum()
            avg_order_value = df['amount'].mean()
            total_orders = len(df)
            
            # Growth rate calculation
            growth_rate = 0
            if len(monthly) > 1:
                recent_month = monthly['amount']['sum'].iloc[-1]
                previous_month = monthly['amount']['sum'].iloc[-2]
                growth_rate = ((recent_month - previous_month) / previous_month * 100) if previous_month > 0 else 0
            
            return {
                "weekly": [
                    {
                        "date": idx.strftime('%Y-%m-%d'),
                        "revenue": float(row[('amount', 'sum')]),
                        "orders": int(row[('amount', 'count')]),
                        "avg_order_value": float(row[('amount', 'mean')])
                    }
                    for idx, row in weekly.iterrows()
                ],
                "monthly": [
                    {
                        "date": idx.strftime('%Y-%m'),
                        "revenue": float(row[('amount', 'sum')]),
                        "orders": int(row[('amount', 'count')]),
                        "avg_order_value": float(row[('amount', 'mean')])
                    }
                    for idx, row in monthly.iterrows()
                ],
                "yearly": [
                    {
                        "date": idx.strftime('%Y'),
                        "revenue": float(row[('amount', 'sum')]),
                        "orders": int(row[('amount', 'count')]),
                        "avg_order_value": float(row[('amount', 'mean')])
                    }
                    for idx, row in yearly.iterrows()
                ],
                "trends": {
                    "total_revenue": float(total_revenue),
                    "avg_order_value": float(avg_order_value),
                    "total_orders": total_orders,
                    "growth_rate": float(growth_rate)
                }
            }
            
        except Exception as e:
            logger.error(f"Sales analytics error: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def advanced_sales_prediction(sales_data):
        """
        Advanced sales prediction with confidence intervals
        
        Args:
            sales_data: List of sales values
            
        Returns:
            dict with predictions and confidence metrics
        """
        try:
            if not sales_data or len(sales_data) < 2:
                return {
                    'next_prediction': 0,
                    'confidence': 0,
                    'trend': 'Insufficient data',
                    'future_7_days': [0] * 7
                }
            
            # Prepare data
            X = np.array(range(len(sales_data))).reshape(-1, 1)
            y = np.array(sales_data)
            
            # Train model
            model = LinearRegression()
            model.fit(X, y)
            
            # Predict next value
            next_prediction = model.predict([[len(sales_data)]])[0]
            
            # Calculate confidence (R²)
            confidence = model.score(X, y)
            
            # Determine trend
            slope = model.coef_[0]
            if slope > 100:
                trend = "📈 Strong Growth"
            elif slope > 0:
                trend = "📈 Growth"
            elif slope > -100:
                trend = "📉 Decline"
            else:
                trend = "📉 Strong Decline"
            
            # Predict next 7 days
            future_predictions = []
            for i in range(1, 8):
                pred = model.predict([[len(sales_data) + i - 1]])[0]
                future_predictions.append(max(0, float(pred)))
            
            return {
                'next_prediction': max(0, float(next_prediction)),
                'confidence': float(confidence),
                'trend': trend,
                'slope': float(slope),
                'future_7_days': future_predictions
            }
            
        except Exception as e:
            logger.error(f"Sales prediction error: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def aggregate_product_ratings(ratings):
        """
        Advanced rating aggregation with distribution analysis
        
        Args:
            ratings: List of rating values (1-5)
            
        Returns:
            dict with comprehensive rating statistics
        """
        try:
            if not ratings:
                return {"average_rating": 0, "total_ratings": 0}
            
            ratings_array = np.array(ratings)
            
            return {
                "average_rating": float(np.mean(ratings_array)),
                "median_rating": float(np.median(ratings_array)),
                "total_ratings": len(ratings),
                "rating_distribution": {
                    "5_star": int(np.sum(ratings_array == 5)),
                    "4_star": int(np.sum(ratings_array == 4)),
                    "3_star": int(np.sum(ratings_array == 3)),
                    "2_star": int(np.sum(ratings_array == 2)),
                    "1_star": int(np.sum(ratings_array == 1))
                },
                "std_deviation": float(np.std(ratings_array))
            }
            
        except Exception as e:
            logger.error(f"Rating aggregation error: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def smart_product_recommendation(user_category, products, user_id=None):
        """
        Smart product recommendation using content-based filtering
        
        Args:
            user_category: User's preferred category
            products: List of product dictionaries
            user_id: Optional user ID for personalization
            
        Returns:
            dict with recommended products and scores
        """
        try:
            if not products:
                return {"recommended": [], "algorithm": "content_based"}
            
            # Convert to DataFrame
            df = pd.DataFrame(products)
            
            # Category-based filtering
            category_matches = df[df['category'].str.lower() == user_category.lower()]
            
            # If no category matches, use price-based recommendation
            if category_matches.empty:
                median_price = df['price'].median()
                price_range = df['price'].std()
                recommended = df[
                    (df['price'] >= median_price - price_range) & 
                    (df['price'] <= median_price + price_range)
                ].head(5)
            else:
                recommended = category_matches.sort_values('price').head(5)
            
            # Add recommendation scores
            recommendations = []
            for _, row in recommended.iterrows():
                score = 0.8 if row['category'].lower() == user_category.lower() else 0.5
                price_score = 1 - (row['price'] / df['price'].max()) * 0.3
                final_score = min(1.0, score + price_score)
                
                recommendations.append({
                    "id": int(row['id']),
                    "name": row['name'],
                    "category": row['category'],
                    "price": float(row['price']),
                    "recommendation_score": float(final_score),
                    "reason": f"Matches your interest in {user_category}"
                })
            
            return {
                "recommended": recommendations,
                "algorithm": "content_based",
                "total_analyzed": len(products)
            }
            
        except Exception as e:
            logger.error(f"Product recommendation error: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def predict_delivery_time(distance, traffic_factor=1.0, product_weight=1.0, delivery_type="standard"):
        """
        Smart delivery time prediction with multiple factors
        
        Args:
            distance: Distance in km
            traffic_factor: Traffic multiplier (1.0 = normal)
            product_weight: Product weight in kg
            delivery_type: Type of delivery (express, standard, economy)
            
        Returns:
            dict with delivery prediction and factors
        """
        try:
            # Base calculation
            base_days = distance / 40  # 40 km per day base speed
            
            # Apply traffic factor
            traffic_adjusted = base_days * traffic_factor
            
            # Weight factor
            weight_factor = 1 + (product_weight - 1) * 0.1
            weight_adjusted = traffic_adjusted * weight_factor
            
            # Delivery type factor
            delivery_factors = {
                "express": 0.5,
                "standard": 1.0,
                "economy": 1.5
            }
            type_factor = delivery_factors.get(delivery_type.lower(), 1.0)
            
            final_days = weight_adjusted * type_factor
            predicted_days = max(1, int(np.ceil(final_days)))
            
            # Calculate delivery date
            delivery_date = (datetime.now() + timedelta(days=predicted_days)).strftime('%Y-%m-%d')
            
            return {
                "days": predicted_days,
                "delivery_date": delivery_date,
                "factors": {
                    "distance_factor": float(base_days),
                    "traffic_factor": float(traffic_factor),
                    "weight_factor": float(weight_factor),
                    "delivery_type_factor": float(type_factor)
                },
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error(f"Delivery prediction error: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def analyze_sentiment(feedback_text):
        """
        Basic sentiment analysis without external dependencies
        
        Args:
            feedback_text: Text to analyze
            
        Returns:
            dict with sentiment analysis results
        """
        try:
            # Simple keyword-based sentiment analysis
            positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful', 'fantastic']
            negative_words = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'poor']
            
            text_lower = feedback_text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            if positive_count > negative_count:
                sentiment = "positive"
                polarity = 0.5
            elif negative_count > positive_count:
                sentiment = "negative"
                polarity = -0.5
            else:
                sentiment = "neutral"
                polarity = 0.0
            
            return {
                "sentiment": sentiment,
                "polarity": float(polarity),
                "subjectivity": 0.5,
                "confidence": abs(polarity),
                "key_phrases": [],
                "word_count": len(feedback_text.split())
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {str(e)}")
            return {"error": str(e)}

# ==============================================================================
# API ENDPOINTS
# ==============================================================================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'Little Bloom Analytics',
        'version': '2.0.0',
        'libraries': ['NumPy', 'Pandas', 'scikit-learn'],
        'features': ['Time-based Analytics', 'Dashboard Analytics', 'Product Analysis']
    }), 200

@app.route('/analytics/dashboard', methods=['POST'])
def time_based_dashboard():
    """Complete time-based dashboard analytics - Daily, Weekly, Monthly, Yearly"""
    try:
        data = request.get_json()
        orders = data.get('orders', [])
        
        result = TimeBasedSalesAnalytics.process_dashboard_analytics(orders)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Time-based dashboard error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/analytics/product', methods=['POST'])
def product_analysis():
    """Product analysis for pie chart"""
    try:
        data = request.get_json()
        products = data.get('products', [])
        
        result = TimeBasedSalesAnalytics.get_product_analysis(products)
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Product analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/analytics/sales', methods=['POST'])
def comprehensive_sales_analytics():
    """Comprehensive sales analytics with weekly, monthly, yearly breakdown"""
    try:
        data = request.get_json()
        orders = data.get('orders', [])
        
        result = EnhancedSalesAnalytics.comprehensive_sales_analytics(orders)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/sales', methods=['POST'])
def advanced_sales_prediction():
    """Advanced sales prediction using Linear Regression"""
    try:
        data = request.get_json()
        sales = data.get('sales', [])
        
        result = EnhancedSalesAnalytics.advanced_sales_prediction(sales)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/ratings/aggregate', methods=['POST'])
def aggregate_ratings():
    """Advanced rating aggregation with distribution analysis"""
    try:
        data = request.get_json()
        ratings = data.get('ratings', [])
        
        result = EnhancedSalesAnalytics.aggregate_product_ratings(ratings)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/recommend', methods=['POST'])
def recommend_products():
    """Smart product recommendation system"""
    try:
        data = request.get_json()
        user_category = data.get('user_category', '')
        products = data.get('products', [])
        user_id = data.get('user_id')
        
        result = EnhancedSalesAnalytics.smart_product_recommendation(user_category, products, user_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict/delivery', methods=['POST'])
def predict_delivery():
    """Smart delivery time prediction"""
    try:
        data = request.get_json()
        distance = data.get('distance', 0)
        traffic_factor = data.get('traffic_factor', 1.0)
        product_weight = data.get('product_weight', 1.0)
        delivery_type = data.get('delivery_type', 'standard')
        
        result = EnhancedSalesAnalytics.predict_delivery_time(
            distance, traffic_factor, product_weight, delivery_type
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/sentiment', methods=['POST'])
def analyze_sentiment():
    """Basic sentiment analysis for feedback"""
    try:
        data = request.get_json()
        feedback = data.get('feedback', '')
        
        result = EnhancedSalesAnalytics.analyze_sentiment(feedback)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ==============================================================================
# DATA SCIENCE RECOMMENDATION ENDPOINTS
# ==============================================================================

@app.route('/recommendations/product', methods=['POST'])
def get_product_recommendations():
    """
    Get intelligent product recommendations based on current product
    Uses data science to find similar products by category, price, rating, etc.
    """
    try:
        data = request.get_json()
        current_product = data.get('currentProduct', {})
        all_products = data.get('allProducts', [])
        limit = data.get('limit', 6)
        
        if not current_product or not all_products:
            return jsonify({
                'success': False,
                'message': 'Missing required data',
                'data': []
            }), 400
        
        engine = RecommendationEngine()
        recommendations = engine.get_recommendations(
            current_product,
            all_products,
            limit=min(limit, 10)
        )
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'count': len(recommendations),
            'algorithm': 'collaborative_filtering_with_vector_similarity'
        }), 200
        
    except Exception as e:
        logger.error(f"Product recommendation error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'data': []
        }), 500

@app.route('/recommendations/category', methods=['POST'])
def get_category_recommendations():
    """
    Get category-based product recommendations
    Returns top-rated products from the same category
    """
    try:
        data = request.get_json()
        category = data.get('category', '')
        all_products = data.get('allProducts', [])
        exclude_id = data.get('excludeId')
        limit = data.get('limit', 6)
        
        if not category or not all_products:
            return jsonify({
                'success': False,
                'message': 'Missing required data (category, allProducts)',
                'data': []
            }), 400
        
        engine = RecommendationEngine()
        recommendations = engine.get_category_based_recommendations(
            category,
            all_products,
            limit=min(limit, 10),
            exclude_id=exclude_id
        )
        
        return jsonify({
            'success': True,
            'data': recommendations,
            'count': len(recommendations),
            'category': category,
            'algorithm': 'category_matching_with_popularity_scoring'
        }), 200
        
    except Exception as e:
        logger.error(f"Category recommendation error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'data': []
        }), 500

@app.route('/recommendations/trending', methods=['POST'])
def get_trending_recommendations():
    """
    Get trending products based on ratings and popularity
    Uses data science to identify top-performing products
    """
    try:
        data = request.get_json()
        all_products = data.get('allProducts', [])
        limit = data.get('limit', 5)
        
        if not all_products:
            return jsonify({
                'success': False,
                'message': 'Missing allProducts data',
                'data': []
            }), 400
        
        engine = RecommendationEngine()
        trending = engine.get_trending_products(all_products, limit=min(limit, 10))
        
        return jsonify({
            'success': True,
            'data': trending,
            'count': len(trending),
            'algorithm': 'trending_products_algorithm'
        }), 200
        
    except Exception as e:
        logger.error(f"Trending recommendation error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'data': []
        }), 500

if __name__ == '__main__':
    print("Little Bloom - Enhanced Data Science Server")
    print("Python Flask API with Advanced AI/ML Features")
    print("Port: 5000")
    print("")
    print("Enhanced Features:")
    print("- Comprehensive Sales Analytics (Pandas)")
    print("- Advanced Sales Prediction (Scikit-learn)")
    print("- Product Rating Aggregation (NumPy)")
    print("- Smart Product Recommendations")
    print("- Delivery Time Prediction")
    print("- Basic Sentiment Analysis")
    print("- Moving Average & Trend Analysis")
    print("- Volatility & Risk Assessment")
    print("- Anomaly Detection")
    print("")
    print("Libraries: Flask, Pandas, Scikit-learn, NumPy")
    print("")
    print("Starting server on http://localhost:5000")
    
    app.run(debug=True, port=5000, host='0.0.0.0')