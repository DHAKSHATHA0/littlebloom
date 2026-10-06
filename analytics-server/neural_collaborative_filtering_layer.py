"""
Neural Collaborative Filtering Layer (Layer 4)
Deep learning-based recommendations using neural embeddings:
- User embeddings and product embeddings
- Multi-layer neural network for interaction modeling
- Handles non-linear relationships between users and products
- Supports batch training and inference
"""

import numpy as np
from typing import List, Dict, Tuple, Optional
from datetime import datetime


class NeuralEmbedding:
    """Simple neural embedding layer"""
    
    def __init__(self, embedding_dim=32):
        """
        Initialize embedding layer
        
        Args:
            embedding_dim: Dimension of embeddings (default: 32)
        """
        self.embedding_dim = embedding_dim
        self.embeddings = {}
        self.initialized = False
    
    def initialize(self, n_items):
        """Initialize embeddings for n_items"""
        np.random.seed(42)
        self.embeddings = {
            i: np.random.normal(0, 0.1, self.embedding_dim)
            for i in range(n_items)
        }
        self.initialized = True
    
    def get_embedding(self, item_id):
        """Get embedding for item"""
        if item_id not in self.embeddings:
            self.embeddings[item_id] = np.random.normal(0, 0.1, self.embedding_dim)
        return self.embeddings[item_id]
    
    def update_embedding(self, item_id, gradient, learning_rate=0.01):
        """Update embedding with gradient descent"""
        if item_id in self.embeddings:
            self.embeddings[item_id] -= learning_rate * gradient


class NeuralNetworkLayer:
    """Simple multi-layer neural network"""
    
    def __init__(self, input_dim, hidden_dims=[128, 64, 32], activation='relu'):
        """
        Initialize neural network layer
        
        Args:
            input_dim: Input dimension (typically 2 * embedding_dim)
            hidden_dims: Dimensions of hidden layers
            activation: Activation function ('relu', 'sigmoid')
        """
        self.input_dim = input_dim
        self.hidden_dims = hidden_dims
        self.activation = activation
        
        # Initialize weights
        np.random.seed(42)
        self.weights = []
        self.biases = []
        
        layer_dims = [input_dim] + hidden_dims + [1]
        for i in range(len(layer_dims) - 1):
            w = np.random.normal(0, 0.01, (layer_dims[i], layer_dims[i+1]))
            b = np.zeros(layer_dims[i+1])
            self.weights.append(w)
            self.biases.append(b)
    
    def relu(self, x):
        """ReLU activation"""
        return np.maximum(0, x)
    
    def relu_derivative(self, x):
        """ReLU derivative"""
        return (x > 0).astype(float)
    
    def sigmoid(self, x):
        """Sigmoid activation"""
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def forward(self, x):
        """Forward pass through network"""
        self.activations = [x]
        
        for i, (w, b) in enumerate(zip(self.weights[:-1], self.biases[:-1])):
            z = np.dot(x, w) + b
            if self.activation == 'relu':
                x = self.relu(z)
            else:
                x = self.sigmoid(z)
            self.activations.append(x)
        
        # Output layer with sigmoid
        z = np.dot(x, self.weights[-1]) + self.biases[-1]
        output = self.sigmoid(z)
        self.activations.append(output)
        
        return output
    
    def backward(self, loss_gradient, learning_rate=0.01):
        """Backward pass (simplified)"""
        delta = loss_gradient * self.sigmoid(self.activations[-1]) * (1 - self.sigmoid(self.activations[-1]))
        
        for i in reversed(range(len(self.weights))):
            grad_w = np.dot(self.activations[i].T, delta)
            grad_b = np.sum(delta, axis=0)
            
            self.weights[i] -= learning_rate * grad_w
            self.biases[i] -= learning_rate * grad_b
            
            if i > 0:
                delta = np.dot(delta, self.weights[i].T)
                if self.activation == 'relu':
                    delta *= self.relu_derivative(self.activations[i])


class NeuralCollaborativeFilteringLayer:
    """Neural Collaborative Filtering recommendation layer"""
    
    def __init__(self, embedding_dim=32, hidden_dims=[128, 64, 32], learning_rate=0.01):
        """
        Initialize Neural CF layer
        
        Args:
            embedding_dim: Dimension of user/product embeddings
            hidden_dims: Dimensions of hidden layers in neural network
            learning_rate: Learning rate for training
        """
        self.embedding_dim = embedding_dim
        self.hidden_dims = hidden_dims
        self.learning_rate = learning_rate
        
        self.user_embeddings = NeuralEmbedding(embedding_dim)
        self.product_embeddings = NeuralEmbedding(embedding_dim)
        self.neural_net = NeuralNetworkLayer(
            input_dim=embedding_dim * 2,
            hidden_dims=hidden_dims
        )
        
        self.user_products = {}  # user_id -> list of (product_id, rating)
        self.product_users = {}  # product_id -> list of (user_id, rating)
        self.trained = False
    
    def build_interaction_matrix(self, interactions):
        """
        Build user-product interaction matrix from data
        
        Args:
            interactions: List of dicts with 'user_id', 'product_id', 'interaction_type'
                         interaction_type: 'purchase'(1.0), 'wishlist'(0.5), 'view'(0.1)
        """
        interaction_weights = {
            'purchase': 1.0,
            'wishlist': 0.7,
            'cart': 0.5,
            'view': 0.1
        }
        
        for interaction in interactions:
            user_id = interaction['user_id']
            product_id = interaction['product_id']
            itype = interaction.get('interaction_type', 'view')
            weight = interaction_weights.get(itype, 0.1)
            
            if user_id not in self.user_products:
                self.user_products[user_id] = []
            self.user_products[user_id].append((product_id, weight))
            
            if product_id not in self.product_users:
                self.product_users[product_id] = []
            self.product_users[product_id].append((user_id, weight))
        
        # Initialize embeddings
        all_users = set(self.user_products.keys())
        all_products = set(self.product_users.keys())
        
        self.user_embeddings.initialize(len(all_users))
        self.product_embeddings.initialize(len(all_products))
    
    def _predict_interaction(self, user_id, product_id):
        """Predict interaction strength between user and product"""
        user_emb = self.user_embeddings.get_embedding(user_id)
        product_emb = self.product_embeddings.get_embedding(product_id)
        
        # Concatenate embeddings
        combined = np.concatenate([user_emb, product_emb])
        
        # Forward pass through neural network
        prediction = self.neural_net.forward(combined.reshape(1, -1))
        return prediction[0, 0]
    
    def train(self, epochs=10, batch_size=32, verbose=False):
        """
        Train neural collaborative filtering model
        
        Args:
            epochs: Number of training epochs
            batch_size: Batch size for training
            verbose: Print training progress
        """
        if not self.user_products or not self.product_users:
            return
        
        # Prepare training data
        training_pairs = []
        for user_id, products in self.user_products.items():
            for product_id, weight in products:
                training_pairs.append((user_id, product_id, weight))
        
        np.random.seed(42)
        total_loss = 0
        
        for epoch in range(epochs):
            np.random.shuffle(training_pairs)
            epoch_loss = 0
            
            for i in range(0, len(training_pairs), batch_size):
                batch = training_pairs[i:i+batch_size]
                batch_loss = 0
                
                for user_id, product_id, target in batch:
                    # Forward pass
                    prediction = self._predict_interaction(user_id, product_id)
                    
                    # Compute loss (MSE)
                    loss = (prediction - target) ** 2
                    batch_loss += loss
                    
                    # Backward pass (simplified)
                    loss_grad = 2 * (prediction - target)
                    self.neural_net.backward(loss_grad, self.learning_rate)
                
                epoch_loss += batch_loss / len(batch)
            
            if verbose and (epoch + 1) % max(1, epochs // 5) == 0:
                print(f"Epoch {epoch+1}/{epochs}, Loss: {epoch_loss:.4f}")
        
        self.trained = True
    
    def get_user_recommendations(self, user_id, all_products, limit=10, 
                                exclude_ids=None):
        """
        Get neural CF recommendations for a user
        
        Args:
            user_id: User ID to get recommendations for
            all_products: List of all product dictionaries
            limit: Number of recommendations to return
            exclude_ids: Product IDs to exclude (already purchased)
            
        Returns:
            List of recommended products with scores
        """
        if not self.trained:
            return []
        
        exclude_ids = set(exclude_ids or [])
        scores = []
        
        for product in all_products:
            if product['id'] in exclude_ids:
                continue
            
            # Predict interaction
            prediction = self._predict_interaction(user_id, product['id'])
            
            # Combine with product features
            feature_score = (
                (product.get('rating', 0) or 0) * 0.3 +
                min((product.get('reviewCount', 0) or 0) / 100, 5) * 0.2 +
                (1.0 if product.get('quantity', 0) > 0 else 0.0) * 0.1
            )
            
            # Final score: 70% neural prediction, 30% features
            final_score = prediction * 0.7 + feature_score * 0.3
            
            scores.append({
                'product': product,
                'score': final_score,
                'neural_score': prediction,
                'feature_score': feature_score
            })
        
        scores.sort(key=lambda x: -x['score'])
        return scores[:limit]
    
    def get_similar_products(self, product_id, all_products, limit=5):
        """
        Get products similar to given product using embeddings
        
        Args:
            product_id: Product ID to find similar products for
            all_products: List of all products
            limit: Number of similar products to return
            
        Returns:
            List of similar products with scores
        """
        if not self.trained:
            return []
        
        product_emb = self.product_embeddings.get_embedding(product_id)
        scores = []
        
        for product in all_products:
            if product['id'] == product_id:
                continue
            
            other_emb = self.product_embeddings.get_embedding(product['id'])
            
            # Cosine similarity between embeddings
            dot_product = np.dot(product_emb, other_emb)
            norm_product = np.linalg.norm(product_emb) * np.linalg.norm(other_emb)
            
            if norm_product > 0:
                similarity = dot_product / norm_product
            else:
                similarity = 0
            
            # Combine with product quality
            quality_score = (
                (product.get('rating', 0) or 0) * 0.4 +
                min((product.get('reviewCount', 0) or 0) / 100, 5) * 0.3 +
                (1.0 if product.get('quantity', 0) > 0 else 0.0) * 0.3
            )
            
            final_score = similarity * 0.6 + quality_score * 0.4
            
            scores.append({
                'product': product,
                'score': final_score,
                'embedding_similarity': similarity
            })
        
        scores.sort(key=lambda x: -x['score'])
        return scores[:limit]
    
    def get_user_neighbors(self, user_id, all_user_ids, k=5):
        """
        Get similar users based on embedding similarity
        
        Args:
            user_id: User ID to find neighbors for
            all_user_ids: List of all user IDs
            k: Number of neighbors to return
            
        Returns:
            List of similar user IDs with similarity scores
        """
        if not self.trained:
            return []
        
        user_emb = self.user_embeddings.get_embedding(user_id)
        similarities = []
        
        for other_user_id in all_user_ids:
            if other_user_id == user_id:
                continue
            
            other_emb = self.user_embeddings.get_embedding(other_user_id)
            
            # Cosine similarity
            dot_product = np.dot(user_emb, other_emb)
            norm_product = np.linalg.norm(user_emb) * np.linalg.norm(other_emb)
            
            if norm_product > 0:
                similarity = dot_product / norm_product
            else:
                similarity = 0
            
            similarities.append({
                'user_id': other_user_id,
                'similarity': similarity
            })
        
        similarities.sort(key=lambda x: -x['similarity'])
        return similarities[:k]
    
    def get_recommendations_from_neighbors(self, user_id, all_products, 
                                          all_user_ids, limit=10, k=5):
        """
        Get recommendations from similar users' purchases
        
        Args:
            user_id: Target user ID
            all_products: List of all products
            all_user_ids: List of all user IDs
            limit: Number of recommendations
            k: Number of neighbors to consider
            
        Returns:
            List of recommended products
        """
        if not self.trained:
            return []
        
        # Get similar users
        neighbors = self.get_user_neighbors(user_id, all_user_ids, k)
        
        if not neighbors:
            return []
        
        # Collect products from neighbors
        neighbor_products = {}
        for neighbor in neighbors:
            neighbor_id = neighbor['user_id']
            similarity = neighbor['similarity']
            
            if neighbor_id in self.user_products:
                for product_id, interaction_weight in self.user_products[neighbor_id]:
                    if product_id not in neighbor_products:
                        neighbor_products[product_id] = 0
                    # Weight by neighbor similarity
                    neighbor_products[product_id] += similarity * interaction_weight
        
        # Convert to recommendations
        recommendations = []
        for product in all_products:
            if product['id'] in neighbor_products:
                score = neighbor_products[product['id']]
                recommendations.append({
                    'product': product,
                    'score': score
                })
        
        recommendations.sort(key=lambda x: -x['score'])
        return recommendations[:limit]
    
    def get_model_insights(self):
        """Get insights about trained model"""
        if not self.trained:
            return {'status': 'not_trained'}
        
        return {
            'status': 'trained',
            'embedding_dimension': self.embedding_dim,
            'hidden_dimensions': self.hidden_dims,
            'num_users': len(self.user_products),
            'num_products': len(self.product_users),
            'total_interactions': sum(len(p) for p in self.user_products.values()),
            'avg_products_per_user': sum(len(p) for p in self.user_products.values()) / len(self.user_products) if self.user_products else 0,
            'avg_users_per_product': sum(len(u) for u in self.product_users.values()) / len(self.product_users) if self.product_users else 0
        }
