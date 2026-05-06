package com.littlebloom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    private List<OrderItemRequest> items;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private BigDecimal gstAmount;
    private Integer gstRate;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
    }
}
