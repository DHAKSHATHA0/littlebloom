package com.littlebloom.repository;

import com.littlebloom.model.Order;
import com.littlebloom.model.Product;
import com.littlebloom.model.Review;
import com.littlebloom.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    List<Review> findByProduct(Product product);
    List<Review> findByUserId(Long userId);
    List<Review> findByUser(User user);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double findAverageRatingByProductId(@Param("productId") Long productId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product = :product")
    Optional<Double> getAverageRatingForProduct(@Param("product") Product product);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.product = :product")
    Long getReviewCountForProduct(@Param("product") Product product);
    
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.user.id = :userId")
    Optional<Review> findByProductIdAndUserId(@Param("productId") Long productId, @Param("userId") Long userId);
    
    @Query("SELECT r FROM Review r WHERE r.product = :product AND r.user = :user AND r.order = :order")
    Optional<Review> findByUserAndOrderAndProduct(@Param("user") User user, @Param("order") Order order, @Param("product") Product product);
    
    @Query("SELECT r FROM Review r WHERE r.order = :order AND r.product = :product")
    Optional<Review> findByOrderAndProduct(@Param("order") Order order, @Param("product") Product product);
    
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    List<Review> findProductReviewsOrderByNewest(@Param("productId") Long productId);
}
