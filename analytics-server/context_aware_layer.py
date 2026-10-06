"""
Context-Aware Filtering Layer
Provides recommendations based on contextual factors:
- Temporal patterns (time of day, day of week, seasonality)
- Location-based filtering (user's city/state)
- User lifecycle stage (new, regular, loyal)
- Product lifecycle stage (new, trending, declining)
- Purchase frequency and spending patterns
"""

import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict


class ContextAwareLayer:
    def __init__(self):
        """Initialize Context-Aware Filtering layer"""
        self.seasonal_categories = {
            'winter': ['Clothing', 'Accessories'],
            'spring': ['Toys & Development'],
            'summer': ['Clothing', 'Accessories'],
            'autumn': ['Toys & Development', 'Clothing']
        }
        
        self.time_of_day_preferences = {
            'morning': 0.8,    # High activity
            'afternoon': 1.0,  # Peak activity
            'evening': 0.9,    # High activity
            'night': 0.6       # Low activity
        }
    
    def _get_season(self, date=None):
        """Get season for given date (or current date)"""
        if date is None:
            date = datetime.now()
        
        month = date.month
        if month in [12, 1, 2]:
            return 'winter'
        elif month in [3, 4, 5]:
            return 'spring'
        elif month in [6, 7, 8]:
            return 'summer'
        else:
            return 'autumn'
    
    def _get_time_of_day(self, time=None):
        """Get time of day period"""
        if time is None:
            time = datetime.now()
        
        hour = time.hour
        if 5 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 21:
            return 'evening'
        else:
            return 'night'
    
    def _get_day_of_week(self, date=None):
        """Get day of week (0=Monday, 6=Sunday)"""
        if date is None:
            date = datetime.now()
        return date.weekday()
    
    def _classify_user(self, user_data):
        """Classify user lifecycle stage"""
        if not user_data:
            return 'new'
        
        purchase_count = len(user_data.get('purchase_history', []))
        days_active = (datetime.now() - user_data.get('created_at', datetime.now())).days
        
        if purchase_count == 0:
            return 'new'
        elif purchase_count < 3 and days_active < 30:
            return 'onboarding'
        elif purchase_count >= 3 and purchase_count < 10:
            return 'regular'
        else:
            return 'loyal'
    
    def _classify_product(self, product, all_products):
        """Classify product lifecycle stage"""
        if not product:
            return 'established'
        
        days_old = (datetime.now() - product.get('created_at', datetime.now())).days
        reviews = product.get('reviewCount', 0) or 0
        rating = product.get('rating', 0) or 0
        
        if days_old < 7:
            return 'new'
        elif reviews < 10:
            return 'emerging'
        elif rating >= 4.5 and reviews > 20:
            return 'trending'
        elif rating < 3.0:
            return 'declining'
        else:
            return 'established'
    
    def _calculate_delivery_preference(self, user_data, product):
        """Score product based on delivery time preference"""
        if not user_data or not product:
            return 1.0
        
        predicted_days = product.get('predicted_delivery_days', 3)
        
        # Check if user has fast delivery preference
        avg_delivery_preference = user_data.get('avg_delivery_days', 3)
        
        if predicted_days <= avg_delivery_preference:
            return 1.0
        else:
            # Penalty for slower delivery
            penalty = 1.0 - (0.1 * (predicted_days - avg_delivery_preference))
            return max(0.5, penalty)
    
    def _calculate_price_affinity(self, user_data, product):
        """Score product based on user's price range preferences"""
        if not user_data or not product:
            return 1.0
        
        user_avg_price = user_data.get('avg_purchase_price', 1000)
        product_price = product.get('price', 0)
        
        # User typically buys within ±50% of their average
        min_comfortable = user_avg_price * 0.5
        max_comfortable = user_avg_price * 1.5
        
        if min_comfortable <= product_price <= max_comfortable:
            return 1.0
        elif product_price < min_comfortable:
            return 0.8  # Cheaper than usual (slight penalty)
        else:
            return 0.6  # Expensive (higher penalty)
    
    def _calculate_location_boost(self, user_data, product):
        """Boost local products or sellers"""
        if not user_data or not product:
            return 1.0
        
        user_city = user_data.get('city', '').lower()
        seller_city = product.get('seller_city', '').lower()
        
        if user_city and seller_city and user_city == seller_city:
            return 1.15  # Local boost
        
        user_state = user_data.get('state', '').lower()
        seller_state = product.get('seller_state', '').lower()
        
        if user_state and seller_state and user_state == seller_state:
            return 1.05  # Same state boost
        
        return 1.0
    
    def get_seasonal_recommendations(self, products, limit=10, exclude_ids=None):
        """Get seasonally relevant recommendations"""
        if not products:
            return []
        
        exclude_ids = exclude_ids or []
        season = self._get_season()
        seasonal_cats = self.seasonal_categories.get(season, [])
        
        # Filter products by seasonal categories
        seasonal_products = [
            p for p in products
            if p.get('category') in seasonal_cats and p['id'] not in exclude_ids
        ]
        
        # If no seasonal products, return best sellers
        if not seasonal_products:
            seasonal_products = [
                p for p in products if p['id'] not in exclude_ids
            ]
        
        # Score by rating and reviews
        scored = []
        for product in seasonal_products:
            score = (
                (product.get('rating', 0) or 0) * 0.6 +
                min((product.get('reviewCount', 0) or 0) / 50, 5) * 0.4
            )
            scored.append({'product': product, 'score': score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
    
    def get_time_aware_recommendations(self, products, user_data=None, limit=10):
        """Get recommendations adjusted for current time of day"""
        if not products:
            return []
        
        time_period = self._get_time_of_day()
        activity_factor = self.time_of_day_preferences.get(time_period, 1.0)
        
        scored = []
        for product in products:
            # Base score
            base_score = (
                (product.get('rating', 0) or 0) * 0.5 +
                min((product.get('reviewCount', 0) or 0) / 50, 5) * 0.5
            )
            
            # Apply time-of-day factor
            # During low activity periods, boost convenience items
            if time_period == 'night':
                if product.get('category') in ['Clothing', 'Accessories']:
                    base_score *= 1.1
            
            final_score = base_score * activity_factor
            scored.append({'product': product, 'score': final_score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
    
    def get_lifecycle_aware_recommendations(self, products, user_data, limit=10):
        """Get recommendations based on user lifecycle stage"""
        if not products or not user_data:
            return []
        
        user_stage = self._classify_user(user_data)
        exclude_ids = user_data.get('purchase_history', [])
        
        scored = []
        for product in products:
            if product['id'] in exclude_ids:
                continue
            
            product_stage = self._classify_product(product, products)
            
            # New users should see trending/popular products
            if user_stage == 'new':
                if product_stage in ['trending', 'established']:
                    boost = 1.2
                else:
                    boost = 0.8
            
            # Regular users see diverse products
            elif user_stage == 'regular':
                if product_stage == 'new':
                    boost = 1.1  # Encourage discovery
                else:
                    boost = 1.0
            
            # Loyal users see everything including declining products (for collection)
            elif user_stage == 'loyal':
                boost = 1.0
            
            else:  # onboarding
                if product_stage in ['trending', 'new']:
                    boost = 1.15
                else:
                    boost = 0.9
            
            base_score = (
                (product.get('rating', 0) or 0) * 0.6 +
                min((product.get('reviewCount', 0) or 0) / 50, 5) * 0.4
            )
            
            final_score = base_score * boost
            scored.append({'product': product, 'score': final_score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
    
    def get_personalized_recommendations(self, products, user_data, limit=10):
        """Get recommendations adjusted for user's preferences"""
        if not products or not user_data:
            return []
        
        exclude_ids = set(user_data.get('purchase_history', []))
        
        scored = []
        for product in products:
            if product['id'] in exclude_ids:
                continue
            
            # Base score
            base_score = (
                (product.get('rating', 0) or 0) * 0.4 +
                min((product.get('reviewCount', 0) or 0) / 50, 5) * 0.3
            )
            
            # Apply personalization factors
            delivery_factor = self._calculate_delivery_preference(user_data, product)
            price_factor = self._calculate_price_affinity(user_data, product)
            location_factor = self._calculate_location_boost(user_data, product)
            
            final_score = (
                base_score * 0.4 +
                delivery_factor * 0.2 +
                price_factor * 0.2 +
                location_factor * 0.2
            )
            
            scored.append({'product': product, 'score': final_score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
    
    def get_repurchase_recommendations(self, products, user_data, limit=5):
        """Recommend products similar to user's previous purchases"""
        if not products or not user_data:
            return []
        
        purchase_history = user_data.get('purchase_history', [])
        if not purchase_history:
            return []
        
        # Find products in same categories as purchases
        purchased_products = [p for p in products if p['id'] in purchase_history]
        purchased_categories = set(p.get('category') for p in purchased_products)
        
        # Recommend from same categories
        category_products = [
            p for p in products
            if p.get('category') in purchased_categories and p['id'] not in purchase_history
        ]
        
        # Score higher for frequently purchased categories
        category_frequency = defaultdict(int)
        for p in purchased_products:
            category_frequency[p.get('category')] += 1
        
        scored = []
        for product in category_products:
            category = product.get('category')
            frequency_boost = 1.0 + (category_frequency[category] * 0.1)
            
            base_score = (
                (product.get('rating', 0) or 0) * 0.5 +
                min((product.get('reviewCount', 0) or 0) / 50, 5) * 0.5
            )
            
            final_score = base_score * frequency_boost
            scored.append({'product': product, 'score': final_score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
    
    def get_trending_now(self, products, limit=10):
        """Get real-time trending products"""
        if not products:
            return []
        
        # Trending = high recent activity
        # Use recent review count, high ratings, in-stock
        scored = []
        for product in products:
            if product.get('quantity', 0) <= 0:
                continue  # Skip out of stock
            
            score = (
                (product.get('rating', 0) or 0) * 0.4 +
                (product.get('trending_score', 0) or 0) * 0.3 +
                min((product.get('reviewCount', 0) or 0) / 100, 5) * 0.3
            )
            scored.append({'product': product, 'score': score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
    
    def apply_context(self, recommendations, context_type='general', **context_data):
        """
        Apply context multiplier to existing recommendations
        
        Args:
            recommendations: List of product dictionaries
            context_type: 'seasonal', 'time_aware', 'lifecycle', 'location'
            **context_data: Additional context parameters
            
        Returns:
            Adjusted recommendations with context applied
        """
        if not recommendations:
            return []
        
        multipliers = {}
        
        if context_type == 'seasonal':
            season = self._get_season()
            seasonal_cats = self.seasonal_categories.get(season, [])
            for i, rec in enumerate(recommendations):
                if rec.get('category') in seasonal_cats:
                    multipliers[i] = 1.1
        
        elif context_type == 'time_aware':
            time_period = self._get_time_of_day()
            for i, rec in enumerate(recommendations):
                multipliers[i] = self.time_of_day_preferences.get(time_period, 1.0)
        
        elif context_type == 'location':
            user_city = context_data.get('user_city', '').lower()
            for i, rec in enumerate(recommendations):
                seller_city = rec.get('seller_city', '').lower()
                if user_city and seller_city and user_city == seller_city:
                    multipliers[i] = 1.15
        
        # Apply multipliers
        adjusted = []
        for i, rec in enumerate(recommendations):
            multiplier = multipliers.get(i, 1.0)
            adjusted.append({
                'product': rec,
                'context_multiplier': multiplier,
                'adjusted_score': rec.get('score', 0) * multiplier
            })
        
        return adjusted
