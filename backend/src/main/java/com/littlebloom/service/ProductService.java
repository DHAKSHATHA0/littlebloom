package com.littlebloom.service;

import com.littlebloom.dto.CreateProductRequest;
import com.littlebloom.dto.ProductDTO;
import com.littlebloom.dto.UpdateProductRequest;
import com.littlebloom.model.Product;
import com.littlebloom.model.User;
import com.littlebloom.repository.ProductRepository;
import com.littlebloom.repository.ReviewRepository;
import com.littlebloom.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public ProductDTO createProduct(Long sellerId, CreateProductRequest request) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        if (seller.getRole() != User.Role.SELLER) {
            throw new RuntimeException("Only sellers can create products");
        }

        Product product = Product.builder()
                .seller(seller)
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .size(request.getSize())
                .imageUrl(request.getImageUrl())
                .predictedDeliveryDays(request.getPredictedDeliveryDays() != null ? request.getPredictedDeliveryDays() : 3)
                .build();

        product = productRepository.save(product);
        return enrichProductDTO(ProductDTO.fromProduct(product));
    }

    public ProductDTO updateProduct(Long productId, Long sellerId, UpdateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized: Cannot update other seller's product");
        }

        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setSize(request.getSize());
        product.setImageUrl(request.getImageUrl());
        if (request.getPredictedDeliveryDays() != null) {
            product.setPredictedDeliveryDays(request.getPredictedDeliveryDays());
        }

        product = productRepository.save(product);
        return enrichProductDTO(ProductDTO.fromProduct(product));
    }

    public void deleteProduct(Long productId, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("Unauthorized: Cannot delete other seller's product");
        }

        productRepository.delete(product);
    }

    public ProductDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return enrichProductDTO(ProductDTO.fromProduct(product));
    }

    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(p -> enrichProductDTO(ProductDTO.fromProduct(p)));
    }

    public Page<ProductDTO> searchProducts(String search, Pageable pageable) {
        return productRepository.searchProducts(search, pageable)
                .map(p -> enrichProductDTO(ProductDTO.fromProduct(p)));
    }

    public Page<ProductDTO> getProductsByCategory(String category, Pageable pageable) {
        return productRepository.findByCategory(category, pageable)
                .map(p -> enrichProductDTO(ProductDTO.fromProduct(p)));
    }

    public List<ProductDTO> getSellerProducts(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        return productRepository.findBySeller(seller).stream()
                .map(p -> enrichProductDTO(ProductDTO.fromProduct(p)))
                .collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        return productRepository.findAll().stream()
                .map(Product::getCategory)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getTopSellingProducts(int limit) {
        return productRepository.findAll().stream()
                .map(p -> enrichProductDTO(ProductDTO.fromProduct(p)))
                .sorted((p1, p2) -> Long.compare(p2.getReviewCount() != null ? p2.getReviewCount() : 0, 
                                                   p1.getReviewCount() != null ? p1.getReviewCount() : 0))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<java.util.Map<String, Object>> getAllProductsForRecommendation() {
        return productRepository.findAll().stream()
                .map(product -> {
                    java.util.Map<String, Object> productMap = new java.util.HashMap<>();
                    productMap.put("id", product.getId());
                    productMap.put("name", product.getName());
                    productMap.put("category", product.getCategory());
                    productMap.put("price", product.getPrice().doubleValue());
                    productMap.put("description", product.getDescription());
                    productMap.put("imageUrl", product.getImageUrl());
                    return productMap;
                })
                .collect(Collectors.toList());
    }

    private ProductDTO enrichProductDTO(ProductDTO dto) {
        Double avgRating = reviewRepository.getAverageRatingForProduct(
                productRepository.findById(dto.getId()).orElseThrow()
        ).orElse(0.0);
        Long reviewCount = reviewRepository.getReviewCountForProduct(
                productRepository.findById(dto.getId()).orElseThrow()
        );

        dto.setAvgRating(avgRating);
        dto.setReviewCount(reviewCount);
        return dto;
    }
}
