package com.littlebloom.service;

import com.littlebloom.dto.AddToWishlistRequest;
import com.littlebloom.dto.ProductDTO;
import com.littlebloom.dto.WishlistDTO;
import com.littlebloom.model.Product;
import com.littlebloom.model.Review;
import com.littlebloom.model.User;
import com.littlebloom.model.Wishlist;
import com.littlebloom.repository.ProductRepository;
import com.littlebloom.repository.ReviewRepository;
import com.littlebloom.repository.UserRepository;
import com.littlebloom.repository.WishlistRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Transactional
    public WishlistDTO addToWishlist(Long userId, AddToWishlistRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already in wishlist
        if (wishlistRepository.countByUserIdAndProductId(userId, request.getProductId()) > 0) {
            throw new RuntimeException("Product already in wishlist");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        wishlist = wishlistRepository.save(wishlist);
        log.info("Product {} added to wishlist of user {}", product.getId(), userId);

        return toWishlistDTO(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        wishlistRepository.delete(wishlist);
        log.info("Product {} removed from wishlist of user {}", productId, userId);
    }

    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.countByUserIdAndProductId(userId, productId) > 0;
    }

    public WishlistDTO getWishlistItem(Long userId, Long productId) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        return toWishlistDTO(wishlist);
    }

    public List<WishlistDTO> getUserWishlist(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Wishlist> wishlistItems = wishlistRepository.findUserWishlist(userId);
        return wishlistItems.stream()
                .map(this::toWishlistDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getWishlistProducts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Wishlist> wishlistItems = wishlistRepository.findUserWishlist(userId);
        return wishlistItems.stream()
                .map(Wishlist::getProduct)
                .map(this::enrichProductDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void clearWishlist(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);
        wishlistRepository.deleteAll(wishlistItems);
        log.info("Wishlist cleared for user {}", userId);
    }

    public long getWishlistCount(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserId(userId);
        return wishlistItems.size();
    }

    private WishlistDTO toWishlistDTO(Wishlist wishlist) {
        return WishlistDTO.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUser().getId())
                .productId(wishlist.getProduct().getId())
                .productName(wishlist.getProduct().getName())
                .category(wishlist.getProduct().getCategory())
                .imageUrl(wishlist.getProduct().getImageUrl())
                .createdAt(wishlist.getCreatedAt())
                .build();
    }

    private ProductDTO enrichProductDTO(Product product) {
        ProductDTO dto = ProductDTO.fromProduct(product);
        Double avgRating = reviewRepository.findAverageRatingByProductId(product.getId());
        long reviewCount = reviewRepository.countByProductId(product.getId());
        
        dto.setAvgRating(avgRating != null ? avgRating : 0.0);
        dto.setReviewCount(reviewCount);
        
        return dto;
    }
}
