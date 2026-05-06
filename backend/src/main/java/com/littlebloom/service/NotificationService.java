package com.littlebloom.service;

import com.littlebloom.dto.AddToWishlistRequest;
import com.littlebloom.dto.NotificationDTO;
import com.littlebloom.dto.WishlistDTO;
import com.littlebloom.model.*;
import com.littlebloom.repository.NotificationRepository;
import com.littlebloom.repository.ProductRepository;
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
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    public void notifySellerOrderPlaced(User buyer, User seller, Product product, Integer quantity) {
        String message = "🎉 New order from " + buyer.getName() + ": " + quantity + " × " + product.getName();
        Notification notification = Notification.builder()
                .sender(buyer)
                .receiver(seller)
                .message(message)
                .type(Notification.NotificationType.ORDER_PLACED)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public void notifyBuyerOrderShipped(Order order) {
        String message = "🚚 Great news! Your order #" + order.getId() + " is on the way. Expected delivery in 3-5 business days.";
        Notification notification = Notification.builder()
                .receiver(order.getBuyer())
                .message(message)
                .type(Notification.NotificationType.ORDER_SHIPPED)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public void notifyBuyerOrderConfirmed(Order order) {
        String message = "✓ Your order #" + order.getId() + " has been confirmed by the seller. We're preparing it for shipment.";
        Notification notification = Notification.builder()
                .receiver(order.getBuyer())
                .message(message)
                .type(Notification.NotificationType.ORDER_SHIPPED)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public void notifyBuyerOrderDelivered(Order order) {
        String message = "✅ Your order #" + order.getId() + " has been delivered! Hope your little one loves it. You can now leave a review.";
        Notification notification = Notification.builder()
                .receiver(order.getBuyer())
                .message(message)
                .type(Notification.NotificationType.ORDER_DELIVERED)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public void notifySellerAboutReview(User buyer, User seller, Product product, Integer rating) {
        String stars = "★".repeat(rating) + "☆".repeat(5 - rating);
        String message = "⭐ " + buyer.getName() + " left a " + stars + " review on " + product.getName();
        Notification notification = Notification.builder()
                .sender(buyer)
                .receiver(seller)
                .message(message)
                .type(Notification.NotificationType.REVIEW_ADDED)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<NotificationDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByReceiverOrderByCreatedAtDesc(user).stream()
                .map(this::getNotificationDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByReceiverAndIsReadFalse(user).stream()
                .map(this::getNotificationDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private NotificationDTO getNotificationDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .senderId(notification.getSender() != null ? notification.getSender().getId() : null)
                .senderName(notification.getSender() != null ? notification.getSender().getName() : "System")
                .receiverId(notification.getReceiver().getId())
                .message(notification.getMessage())
                .type(notification.getType().toString())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
