package com.littlebloom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {
    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String category;
    private String productCategory; // Alias for category for analytics
    private String imageUrl;
    private Long sellerId;
    private String sellerName;
    private Long buyerId;
    private String buyerIdFormatted;
    private String buyerName;
    private Integer quantity;
    private BigDecimal price;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // When the order item was last updated
    private LocalDateTime deliveredAt; // When the seller marked as delivered
}
