package com.littlebloom.controller;

import com.littlebloom.dto.CreateReviewRequest;
import com.littlebloom.dto.ReviewDTO;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            Authentication authentication,
            @RequestBody CreateReviewRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ReviewDTO review = reviewService.createReview(userDetails.getUserId(), request);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getProductReviews(@PathVariable Long productId) {
        List<ReviewDTO> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/user")
    public ResponseEntity<List<ReviewDTO>> getUserReviews(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ReviewDTO> reviews = reviewService.getUserReviews(userDetails.getUserId());
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<Double> getProductAverageRating(@PathVariable Long productId) {
        Double rating = reviewService.getProductAverageRating(productId);
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/product/{productId}/count")
    public ResponseEntity<Long> getProductReviewCount(@PathVariable Long productId) {
        Long count = reviewService.getProductReviewCount(productId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/order/{orderId}/product/{productId}")
    public ResponseEntity<ReviewDTO> getReviewByOrderAndProduct(
            @PathVariable Long orderId, 
            @PathVariable Long productId) {
        ReviewDTO review = reviewService.getReviewByOrderAndProduct(orderId, productId);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(review);
    }
}