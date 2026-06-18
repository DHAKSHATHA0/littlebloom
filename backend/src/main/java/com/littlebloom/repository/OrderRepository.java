package com.littlebloom.repository;

import com.littlebloom.model.Order;
import com.littlebloom.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerId(Long buyerId);
    List<Order> findByBuyer(User buyer);
    Page<Order> findByBuyer(User buyer, Pageable pageable);
    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<Order> findByStatus(Order.OrderStatus status);
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.buyer.id = :buyerId ORDER BY o.createdAt DESC")
    List<Order> findUserOrdersWithDetails(@Param("buyerId") Long buyerId);
    
    @Query("SELECT o FROM Order o JOIN o.items oi WHERE oi.seller.id = :sellerId")
    List<Order> findOrdersForSeller(@Param("sellerId") Long sellerId);
}
