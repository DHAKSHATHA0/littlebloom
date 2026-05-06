package com.littlebloom.dto;

import com.littlebloom.model.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private Long id;
    private Long sellerId;
    private String sellerName;
    private String name;
    private String category;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private String size;
    private String imageUrl;
    private Integer predictedDeliveryDays;
    private Double avgRating;
    private Long reviewCount;

    public static ProductDTO fromProduct(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .sellerId(product.getSeller().getId())
                .sellerName(product.getSeller().getName())
                .name(product.getName())
                .category(product.getCategory())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .size(product.getSize())
                .imageUrl(product.getImageUrl())
                .predictedDeliveryDays(product.getPredictedDeliveryDays())
                .build();
    }
}
