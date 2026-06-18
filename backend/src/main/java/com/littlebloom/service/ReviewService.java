package com.littlebloom.service;

import com.littlebloom.dto.CreateReviewRequest;
import com.littlebloom.dto.ReviewDTO;
import com.littlebloom.model.Order;
import com.littlebloom.model.OrderItem;
import com.littlebloom.model.Product;
import com.littlebloom.model.Review;
import com.littlebloom.model.User;
import com.littlebloom.repository.OrderItemRepository;
import com.littlebloom.repository.OrderRepository;
import com.littlebloom.repository.ProductRepository;
import com.littlebloom.repository.ReviewRepository;
import com.littlebloom.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ReviewDTO createReview(Long userId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Check if order is delivered
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Can only review delivered orders");
        }

        // Check if user is the buyer of the order
        if (!order.getBuyer().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Can only review own orders");
        }

        // Check if review already exists
        if (reviewRepository.findByUserAndOrderAndProduct(user, order, product).isPresent()) {
            throw new RuntimeException("Review already exists for this product");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .feedback(request.getFeedback())
                .build();

        review = reviewRepository.save(review);

        // Notify seller about review
        notificationService.notifySellerAboutReview(user, product.getSeller(), product, request.getRating());

        return getReviewDTO(review);
    }

    public List<ReviewDTO> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.findByProduct(product).stream()
                .map(this::getReviewDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getUserReviews(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reviewRepository.findByUser(user).stream()
                .map(this::getReviewDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return getReviewDTO(review);
    }

    public Double getProductAverageRating(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.getAverageRatingForProduct(product)
                .orElse(0.0);
    }

    public Long getProductReviewCount(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.getReviewCountForProduct(product);
    }

    public List<Double> getProductRatings(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return reviewRepository.findByProduct(product).stream()
                .map(Review::getRating)
                .map(Double::valueOf)
                .collect(Collectors.toList());
    }

    public ReviewDTO getReviewByOrderAndProduct(Long orderId, Long productId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        return reviewRepository.findByOrderAndProduct(order, product)
                .map(this::getReviewDTO)
                .orElse(null);
    }

    private ReviewDTO getReviewDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .productId(review.getProduct().getId())
                .orderId(review.getOrder().getId())
                .rating(review.getRating())
                .feedback(review.getFeedback())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
