package com.littlebloom.repository;

import com.littlebloom.model.Product;
import com.littlebloom.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    Page<Product> findByCategory(String category, Pageable pageable);
    
    List<Product> findBySeller(User seller);
    List<Product> findBySellerId(Long sellerId);
    
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
    
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.quantity > 0")
    List<Product> findByCategoryAndAvailable(@Param("category") String category);
    
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    List<Product> searchProducts(@Param("keyword") String keyword);
    
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId ORDER BY p.createdAt DESC")
    List<Product> findSellerProducts(@Param("sellerId") Long sellerId);
    
    @Query("SELECT p FROM Product p WHERE p.quantity > 0 ORDER BY p.createdAt DESC")
    List<Product> findAllAvailableProducts();
    
    @Query("SELECT p FROM Product p WHERE p.quantity > 0 ORDER BY p.createdAt DESC")
    Page<Product> findAllAvailableProducts(Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.seller.id = :sellerId")
    long countProductsBySeller(@Param("sellerId") Long sellerId);
}
