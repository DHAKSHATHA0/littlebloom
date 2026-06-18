package com.littlebloom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistDTO {
    private Long id;
    private Long userId;
    private Long productId;
    private String productName;
    private String category;
    private String imageUrl;
    private LocalDateTime createdAt;
}
