package com.littlebloom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private String size;
    private String imageUrl;
    private Integer predictedDeliveryDays;
}
