"""
Content-Based Filtering Layer using TF-IDF
Provides product recommendations based on:
- Product name, description, category, tags similarity
- Numerical features (price, rating, stock, popularity)
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict


class ContentBasedLayer:
    def __init__(self, max_features=500, ngram_range=(1, 2)):
        """
        Initialize Content-Based Filtering layer
        
        Args:
            max_features: Maximum number of TF-IDF features
            ngram_range: N-gram range for TF-IDF vectorizer
        """
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            ngram_range=ngram_range,
            stop_words='english',
            min_df=1,
            max_df=0.9
        )
        self.scaler = MinMaxScaler()
        self.tfidf_matrix = None
        self.products = None
        self.product_ids = None
        
    def _build_text_features(self, products):
        """
        Combine product name, description, category, and tags into single text
        """
        texts = []
        for product in products:
            parts = [
                str(product.get('name', '')),
                str(product.get('description', '')),
                str(product.get('category', '')),
                ' '.join(str(t) for t in product.get('tags', []))
            ]
            text = ' '.join(parts)
            texts.append(text)
        return texts
    
    def _build_numerical_features(self, products):
        """
        Build numerical feature matrix: [price, rating, popularity, stock]
        Normalized to 0-1 range
        """
        features = []
        
        if not products:
            return np.array([])
        
        # Extract raw values
        prices = [p.get('price', 0) for p in products]
        ratings = [p.get('rating', 0) or 0 for p in products]
        popularity = [min(p.get('reviewCount', 0) or 0, 100) for p in products]
        stocks = [min(p.get('quantity', 0) or 0, 10) for p in products]
        
        # Normalize each feature
        for i, product in enumerate(products):
            norm_price = (prices[i] - min(prices)) / (max(prices) - min(prices) + 1e-6)
            norm_rating = ratings[i] / 5.0
            norm_popularity = popularity[i] / 100.0
            norm_stock = 1.0 if stocks[i] > 0 else 0.0
            
            features.append([
                norm_price,
                norm_rating,
                norm_popularity,
                norm_stock
            ])
        
        return np.array(features)
    
    def fit(self, products):
        """
        Fit the TF-IDF vectorizer and build numerical features
        
        Args:
            products: List of product dictionaries
        """
        self.products = products
        self.product_ids = [p['id'] for p in products]
        
        # Build and fit TF-IDF matrix
        texts = self._build_text_features(products)
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)
        
    def get_recommendations(self, product_id, limit=5, text_weight=0.6, numerical_weight=0.4):
        """
        Get content-based recommendations for a product
        
        Args:
            product_id: ID of the product to get recommendations for
            limit: Number of recommendations to return
            text_weight: Weight for text similarity (0-1)
            numerical_weight: Weight for numerical similarity (0-1)
            
        Returns:
            List of recommended product dictionaries
        """
        if self.tfidf_matrix is None or not self.products:
            return []
        
        try:
            product_idx = self.product_ids.index(product_id)
        except ValueError:
            return []
        
        # Calculate text similarity using TF-IDF
        tfidf_similarities = cosine_similarity(
            self.tfidf_matrix[product_idx],
            self.tfidf_matrix
        ).flatten()
        
        # Calculate numerical feature similarity
        numerical_features = self._build_numerical_features(self.products)
        current_features = numerical_features[product_idx]
        
        numerical_similarities = []
        for features in numerical_features:
            # Euclidean distance normalized
            distance = np.sqrt(np.sum((current_features - features) ** 2))
            similarity = 1 / (1 + distance)
            numerical_similarities.append(similarity)
        
        numerical_similarities = np.array(numerical_similarities)
        
        # Combine similarities
        combined_scores = (
            tfidf_similarities * text_weight +
            numerical_similarities * numerical_weight
        )
        
        # Exclude current product and get top recommendations
        recommendations = []
        for idx, score in enumerate(combined_scores):
            if idx != product_idx and score > 0:
                recommendations.append({
                    'product': self.products[idx],
                    'score': float(score)
                })
        
        # Sort by score
        recommendations.sort(key=lambda x: -x['score'])
        
        return [rec['product'] for rec in recommendations[:limit]]
    
    def get_similar_products(self, product_ids, limit=5):
        """
        Get products similar to a set of products (e.g., user's purchase history)
        
        Args:
            product_ids: List of product IDs to base recommendations on
            limit: Number of recommendations to return
            
        Returns:
            List of recommended product dictionaries
        """
        if not product_ids or self.tfidf_matrix is None:
            return []
        
        # Get indices for provided products
        indices = []
        for pid in product_ids:
            try:
                indices.append(self.product_ids.index(pid))
            except ValueError:
                continue
        
        if not indices:
            return []
        
        # Average similarity across all products in history
        avg_tfidf_similarity = np.zeros(len(self.products))
        avg_numerical_similarity = np.zeros(len(self.products))
        
        numerical_features = self._build_numerical_features(self.products)
        
        for idx in indices:
            # TF-IDF similarity
            tfidf_sim = cosine_similarity(
                self.tfidf_matrix[idx],
                self.tfidf_matrix
            ).flatten()
            avg_tfidf_similarity += tfidf_sim
            
            # Numerical similarity
            current_features = numerical_features[idx]
            for j, features in enumerate(numerical_features):
                distance = np.sqrt(np.sum((current_features - features) ** 2))
                avg_numerical_similarity[j] += 1 / (1 + distance)
        
        avg_tfidf_similarity /= len(indices)
        avg_numerical_similarity /= len(indices)
        
        # Combine and filter
        combined_scores = (
            avg_tfidf_similarity * 0.6 +
            avg_numerical_similarity * 0.4
        )
        
        recommendations = []
        for idx, score in enumerate(combined_scores):
            if idx not in indices and score > 0:
                recommendations.append({
                    'product': self.products[idx],
                    'score': float(score)
                })
        
        recommendations.sort(key=lambda x: -x['score'])
        return [rec['product'] for rec in recommendations[:limit]]
    
    def get_category_recommendations(self, category, limit=5, exclude_ids=None):
        """
        Get best products in a category using content-based features
        
        Args:
            category: Product category to recommend from
            limit: Number of recommendations
            exclude_ids: Product IDs to exclude
            
        Returns:
            List of product dictionaries
        """
        if not self.products:
            return []
        
        exclude_ids = exclude_ids or []
        
        # Filter by category
        category_products = [
            (idx, p) for idx, p in enumerate(self.products)
            if p.get('category') == category and p['id'] not in exclude_ids
        ]
        
        if not category_products:
            return []
        
        # Score by rating and reviews within category
        scored = []
        for idx, product in category_products:
            score = (
                (product.get('rating', 0) or 0) * 0.6 +
                min((product.get('reviewCount', 0) or 0) / 100, 5) * 0.4
            )
            scored.append({'product': product, 'score': score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
    
    def get_recommendations_by_tags(self, tags, limit=5, exclude_ids=None):
        """
        Get recommendations based on specific tags
        
        Args:
            tags: List of tags to match
            limit: Number of recommendations
            exclude_ids: Product IDs to exclude
            
        Returns:
            List of product dictionaries
        """
        if not self.products or not tags:
            return []
        
        exclude_ids = exclude_ids or []
        
        # Score products by tag matches
        scored = []
        for product in self.products:
            if product['id'] in exclude_ids:
                continue
            
            product_tags = set(str(t).lower() for t in product.get('tags', []))
            search_tags = set(str(t).lower() for t in tags)
            
            if not product_tags:
                continue
            
            overlap = len(product_tags & search_tags)
            if overlap > 0:
                score = overlap / max(len(product_tags), len(search_tags))
                scored.append({'product': product, 'score': score})
        
        scored.sort(key=lambda x: -x['score'])
        return [s['product'] for s in scored[:limit]]
