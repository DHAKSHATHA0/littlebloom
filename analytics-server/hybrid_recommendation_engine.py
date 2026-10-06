"""
Hybrid Recommendation Engine combining all 4 layers:
- Layer 1: Collaborative Filtering (User-Product interactions via SVD)
- Layer 2: Content-Based Filtering (Text and numerical features via TF-IDF)
- Layer 3: Context-Aware Filtering (Temporal, seasonal, location, user lifecycle)
- Layer 4: Neural Collaborative Filtering (Deep learning embeddings)
"""

import numpy as np
from typing import List, Dict, Optional
from datetime import datetime


class HybridRecommendationEngine:
    def __init__(self, collaborative_layer=None, content_based_layer=None, 
                 context_aware_layer=None, neural_cf_layer=None):
        """
        Initialize Hybrid Recommendation Engine with all 4 layers
        
        Args:
            collaborative_layer: Layer 1 - CollaborativeFilteringLayer instance
            content_based_layer: Layer 2 - ContentBasedLayer instance
            context_aware_layer: Layer 3 - ContextAwareLayer instance
            neural_cf_layer: Layer 4 - NeuralCollaborativeFilteringLayer instance
        """
        self.collaborative_layer = collaborative_layer
        self.content_based_layer = content_based_layer
        self.context_aware_layer = context_aware_layer
        self.neural_cf_layer = neural_cf_layer
        
        self.recommendation_weights = {
            'collaborative': 0.25,
            'content_based': 0.25,
            'context_aware': 0.25,
            'neural_cf': 0.25
        }
    
    def set_layer_weights(self, collaborative=0.25, content_based=0.25, 
                         context_aware=0.25, neural_cf=0.25):
        """
        Set weights for each recommendation layer
        Weights should sum to 1.0
        """
        total = collaborative + content_based + context_aware + neural_cf
        if abs(total - 1.0) > 1e-6:
            raise ValueError(f"Weights must sum to 1.0, got {total}")
        
        self.recommendation_weights = {
            'collaborative': collaborative,
            'content_based': content_based,
            'context_aware': context_aware,
            'neural_cf': neural_cf
        }
    
    def get_user_recommendations(self, user_id, all_products, limit=10,
                                 user_interaction_data=None, user_profile_data=None):
        """
        Get hybrid recommendations combining all 4 layers
        
        Args:
            user_id: User ID to get recommendations for
            all_products: List of all product dictionaries
            limit: Number of recommendations to return
            user_interaction_data: User's past interactions
            user_profile_data: User's profile data
            
        Returns:
            List of recommended products with scores and confidence
        """
        recommendations = {}
        layer_scores = {
            'collaborative': {},
            'content_based': {},
            'context_aware': {},
            'neural_cf': {}
        }
        
        # Layer 1: Collaborative Filtering
        if self.collaborative_layer:
            try:
                cf_recommendations = self.collaborative_layer.get_user_recommendations(
                    user_id, limit=limit * 3
                )
                for product in cf_recommendations:
                    pid = product['id']
                    recommendations[pid] = product
                    layer_scores['collaborative'][pid] = self.recommendation_weights['collaborative']
            except Exception as e:
                print(f"Layer 1 (CF) error: {e}")
        
        # Layer 2: Content-Based Filtering
        if self.content_based_layer and user_interaction_data:
            try:
                viewed_product_ids = user_interaction_data.get('viewed_products', [])
                if viewed_product_ids:
                    cb_recommendations = self.content_based_layer.get_similar_products(
                        viewed_product_ids, limit=limit * 3
                    )
                    for product in cb_recommendations:
                        pid = product['id']
                        recommendations[pid] = product
                        layer_scores['content_based'][pid] = self.recommendation_weights['content_based']
            except Exception as e:
                print(f"Layer 2 (CB) error: {e}")
        
        # Layer 3: Context-Aware Filtering
        if self.context_aware_layer and user_profile_data:
            try:
                ctx_recommendations = self.context_aware_layer.get_personalized_recommendations(
                    all_products, user_profile_data, limit=limit * 3
                )
                for product in ctx_recommendations:
                    pid = product['id']
                    recommendations[pid] = product
                    layer_scores['context_aware'][pid] = self.recommendation_weights['context_aware']
            except Exception as e:
                print(f"Layer 3 (Context) error: {e}")
        
        # Layer 4: Neural Collaborative Filtering
        if self.neural_cf_layer:
            try:
                neural_recommendations = self.neural_cf_layer.get_user_recommendations(
                    user_id, all_products, limit=limit * 3
                )
                for item in neural_recommendations:
                    product = item['product']
                    pid = product['id']
                    recommendations[pid] = product
                    layer_scores['neural_cf'][pid] = self.recommendation_weights['neural_cf']
            except Exception as e:
                print(f"Layer 4 (Neural CF) error: {e}")
        
        # Combine scores from all layers
        final_scores = {}
        layer_count = {}
        
        for layer_name, scores_dict in layer_scores.items():
            for pid, score in scores_dict.items():
                if pid not in final_scores:
                    final_scores[pid] = 0
                    layer_count[pid] = 0
                final_scores[pid] += score
                layer_count[pid] += 1
        
        # Average scores and calculate confidence
        final_recommendations = []
        for pid in recommendations.keys():
            avg_score = final_scores.get(pid, 0) / max(layer_count.get(pid, 1), 1)
            confidence_level = min(layer_count.get(pid, 1) / 4, 1.0)  # Max 4 layers
            
            final_recommendations.append({
                'product': recommendations[pid],
                'score': avg_score,
                'confidence': 'high' if confidence_level > 0.75 else 'medium' if confidence_level > 0.5 else 'low',
                'layer_agreement': layer_count.get(pid, 0)
            })
        
        final_recommendations.sort(key=lambda x: (-x['score'], -x['layer_agreement']))
        return final_recommendations[:limit]
    
    def get_similar_products(self, product_id, all_products, limit=5):
        """
        Get products similar using all layers
        
        Args:
            product_id: Product ID to find similar products for
            all_products: List of all products
            limit: Number of similar products to return
            
        Returns:
            List of similar products with consensus scores
        """
        similar_products = {}
        layer_scores = {}
        
        # Layer 2: Content-Based (primary for similarity)
        if self.content_based_layer:
            try:
                cb_similar = self.content_based_layer.get_recommendations(
                    product_id, limit=limit * 2
                )
                for product in cb_similar:
                    pid = product['id']
                    similar_products[pid] = product
                    if pid not in layer_scores:
                        layer_scores[pid] = 0
                    layer_scores[pid] += self.recommendation_weights['content_based']
            except Exception as e:
                print(f"Layer 2 (CB) similarity error: {e}")
        
        # Layer 4: Neural CF (embedding-based similarity)
        if self.neural_cf_layer:
            try:
                neural_similar = self.neural_cf_layer.get_similar_products(
                    product_id, all_products, limit=limit * 2
                )
                for item in neural_similar:
                    product = item['product']
                    pid = product['id']
                    similar_products[pid] = product
                    if pid not in layer_scores:
                        layer_scores[pid] = 0
                    layer_scores[pid] += self.recommendation_weights['neural_cf']
            except Exception as e:
                print(f"Layer 4 (Neural CF) similarity error: {e}")
        
        # Layer 1: Collaborative similarity (complementary)
        if self.collaborative_layer:
            try:
                cf_similar = self.collaborative_layer.get_similar_products(
                    product_id, limit=limit * 2
                )
                for product in cf_similar:
                    pid = product['id']
                    similar_products[pid] = product
                    if pid not in layer_scores:
                        layer_scores[pid] = 0
                    layer_scores[pid] += self.recommendation_weights['collaborative']
            except Exception as e:
                print(f"Layer 1 (CF) similarity error: {e}")
        
        final_results = [
            {
                'product': similar_products[pid],
                'score': layer_scores.get(pid, 0)
            }
            for pid in similar_products.keys()
        ]
        
        final_results.sort(key=lambda x: -x['score'])
        return final_results[:limit]
    
    def get_trending_products(self, all_products, category=None, limit=10):
        """
        Get trending products using Layer 3 context-aware scoring
        
        Args:
            all_products: List of all products
            category: Optional category filter
            limit: Number of trending products to return
            
        Returns:
            List of trending products
        """
        if self.context_aware_layer:
            try:
                trending = self.context_aware_layer.get_trending_now(
                    all_products, limit=limit
                )
                if category:
                    trending = [p for p in trending if p.get('category') == category]
                return trending[:limit]
            except Exception as e:
                print(f"Context-aware trending error: {e}")
        
        try:
            trending = []
            for product in all_products:
                if category and product.get('category') != category:
                    continue
                
                score = (
                    (product.get('rating', 0) or 0) * 0.4 +
                    min((product.get('reviewCount', 0) or 0) / 100, 5) * 0.3 +
                    (1.0 if product.get('quantity', 0) > 0 else 0.0) * 0.2 +
                    (product.get('trending_score', 0) or 0) * 0.1
                )
                
                if product.get('is_sponsored'):
                    score *= 1.1
                
                trending.append({
                    'product': product,
                    'score': score
                })
            
            trending.sort(key=lambda x: -x['score'])
            return [t['product'] for t in trending[:limit]]
        except Exception as e:
            print(f"Trending products error: {e}")
            return []
    
    def get_category_recommendations(self, category, all_products, limit=10,
                                    exclude_ids=None):
        """
        Get recommendations for products in a specific category
        
        Args:
            category: Product category
            all_products: List of all products
            limit: Number of recommendations
            exclude_ids: Product IDs to exclude
            
        Returns:
            List of recommended products
        """
        exclude_ids = exclude_ids or []
        
        recommendations = {}
        scores = {}
        
        if self.content_based_layer:
            try:
                cb_recs = self.content_based_layer.get_category_recommendations(
                    category, limit=limit * 2, exclude_ids=exclude_ids
                )
                for product in cb_recs:
                    pid = product['id']
                    recommendations[pid] = product
                    scores[pid] = self.recommendation_weights['content_based']
            except Exception as e:
                print(f"Content-based category error: {e}")
        
        if not recommendations:
            for product in all_products:
                if (product.get('category') == category and 
                    product['id'] not in exclude_ids):
                    pid = product['id']
                    score = (
                        (product.get('rating', 0) or 0) * 0.6 +
                        min((product.get('reviewCount', 0) or 0) / 100, 5) * 0.4
                    )
                    recommendations[pid] = product
                    scores[pid] = score
        
        final = [
            {
                'product': recommendations[pid],
                'score': scores.get(pid, 0.0)
            }
            for pid in recommendations.keys()
        ]
        
        final.sort(key=lambda x: -x['score'])
        return [f['product'] for f in final[:limit]]
    
    def get_cold_start_recommendations(self, all_products, limit=10):
        """Get recommendations for new users with minimal data"""
        scored = []
        for product in all_products:
            score = (
                (product.get('rating', 0) or 0) * 0.5 +
                min((product.get('reviewCount', 0) or 0) / 100, 5) * 0.3 +
                (1.0 if product.get('quantity', 0) > 0 else 0.0) * 0.2
            )
            scored.append({'product': product, 'score': score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
    
    def get_seasonal_recommendations(self, all_products, limit=10, exclude_ids=None):
        """Get seasonally relevant recommendations using Layer 3"""
        if self.context_aware_layer:
            return self.context_aware_layer.get_seasonal_recommendations(
                all_products, limit, exclude_ids
            )
        return self.get_cold_start_recommendations(all_products, limit)
    
    def get_lifecycle_recommendations(self, all_products, user_profile_data, limit=10):
        """Get recommendations based on user lifecycle stage using Layer 3"""
        if self.context_aware_layer:
            return self.context_aware_layer.get_lifecycle_aware_recommendations(
                all_products, user_profile_data, limit
            )
        return self.get_cold_start_recommendations(all_products, limit)
    
    def get_repurchase_recommendations(self, all_products, user_profile_data, limit=5):
        """Get repurchase recommendations based on user history using Layer 3"""
        if self.context_aware_layer:
            return self.context_aware_layer.get_repurchase_recommendations(
                all_products, user_profile_data, limit
            )
        return []
    
    def get_neighbor_recommendations(self, user_id, all_products, all_user_ids, limit=10, k=5):
        """
        Get recommendations from similar users using Layer 4 (Neural CF)
        
        Args:
            user_id: Target user ID
            all_products: List of all products
            all_user_ids: List of all user IDs
            limit: Number of recommendations
            k: Number of neighbors to consider
            
        Returns:
            List of neighbor-based recommendations
        """
        if self.neural_cf_layer:
            return self.neural_cf_layer.get_recommendations_from_neighbors(
                user_id, all_products, all_user_ids, limit, k
            )
        return []
    
    def get_ensemble_score(self, product_id, user_id=None):
        """
        Get detailed ensemble score breakdown for a product
        
        Args:
            product_id: Product ID
            user_id: Optional user ID for personalized scoring
            
        Returns:
            Dictionary with scores from each layer
        """
        scores = {}
        
        if self.collaborative_layer and user_id:
            try:
                scores['collaborative'] = self.collaborative_layer._score_product(
                    user_id, product_id
                )
            except:
                scores['collaborative'] = None
        
        if self.content_based_layer:
            try:
                scores['content_based'] = self.content_based_layer._get_product_quality_score(
                    product_id
                )
            except:
                scores['content_based'] = None
        
        if self.context_aware_layer:
            try:
                scores['context_aware'] = 0.75  # Placeholder
            except:
                scores['context_aware'] = None
        
        if self.neural_cf_layer and user_id:
            try:
                scores['neural_cf'] = self.neural_cf_layer._predict_interaction(
                    user_id, product_id
                )
            except:
                scores['neural_cf'] = None
        
        return scores
