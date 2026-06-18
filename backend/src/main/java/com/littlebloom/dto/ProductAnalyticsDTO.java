package com.littlebloom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductAnalyticsDTO {
    private Long productId;
    private String productName;
    private Double avgRating;
    private Long reviewCount;
    private Long totalSold;
    private Long totalRevenue;
}