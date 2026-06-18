package com.littlebloom.repository;

import com.littlebloom.model.Order;
import com.littlebloom.model.OrderItem;
import com.littlebloom.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findByOrder(Order order);
    List<OrderItem> findBySellerId(Long sellerId);
    Page<OrderItem> findBySeller(User seller, Pageable pageable);
    List<OrderItem> findBySellerOrderByCreatedAtDesc(User seller);
    List<OrderItem> findByStatus(OrderItem.OrderItemStatus status);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.seller.id = :sellerId AND oi.status = :status")
    List<OrderItem> findSellerOrdersByStatus(@Param("sellerId") Long sellerId, @Param("status") OrderItem.OrderItemStatus status);
    
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.seller.id = :sellerId")
    long countBySellerId(@Param("sellerId") Long sellerId);
}
