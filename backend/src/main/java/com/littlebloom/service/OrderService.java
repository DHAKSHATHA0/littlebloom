package com.littlebloom.service;

import com.littlebloom.dto.CreateOrderRequest;
import com.littlebloom.dto.OrderDTO;
import com.littlebloom.dto.OrderItemDTO;
import com.littlebloom.model.*;
import com.littlebloom.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public OrderDTO createOrder(Long buyerId, CreateOrderRequest request) {
        try {
            log.info("Creating order for buyer: {}", buyerId);
            
            User buyer = userRepository.findById(buyerId)
                    .orElseThrow(() -> new RuntimeException("Buyer not found"));

            if (request.getItems() == null || request.getItems().isEmpty()) {
                throw new RuntimeException("Cart is empty");
            }

            // Validate stock for all items before creating order
            for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));
                
                if (product.getQuantity() < itemRequest.getQuantity()) {
                    log.warn("Insufficient stock for product: {} (available: {}, requested: {})", 
                            product.getId(), product.getQuantity(), itemRequest.getQuantity());
                    throw new RuntimeException("Insufficient stock for " + product.getName() + ". Available: " + product.getQuantity());
                }
            }

            BigDecimal totalPrice = request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal gstAmount = request.getGstAmount() != null ? request.getGstAmount() : BigDecimal.ZERO;
            Integer gstRate = request.getGstRate() != null ? request.getGstRate() : 0;

            Order order = Order.builder()
                    .buyer(buyer)
                    .status(Order.OrderStatus.PENDING)
                    .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD")
                    .gst(gstAmount)
                    .totalPrice(totalPrice)
                    .shippingCost(BigDecimal.ZERO)
                    .build();

            order = orderRepository.save(order);
            log.info("Order created with ID: {}", order.getId());

            for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                User seller = product.getSeller();

                // Decrement product quantity
                int originalQuantity = product.getQuantity();
                int newQuantity = originalQuantity - itemRequest.getQuantity();
                product.setQuantity(newQuantity);
                productRepository.save(product);
                log.info("STOCK UPDATE: Product {} quantity updated: {} -> {} (decreased by {})", 
                        product.getId(), originalQuantity, newQuantity, itemRequest.getQuantity());

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .seller(seller)
                        .quantity(itemRequest.getQuantity())
                        .price(product.getPrice())
                        .status(OrderItem.OrderItemStatus.PENDING)
                        .build();

                orderItemRepository.save(orderItem);
                log.info("Order item created for product: {}", product.getId());

                // Notify seller
                try {
                    notificationService.notifySellerOrderPlaced(buyer, seller, product, itemRequest.getQuantity());
                    log.info("Seller notification sent to: {}", seller.getId());
                } catch (Exception e) {
                    log.error("Failed to send seller notification: {}", e.getMessage());
                }
            }

            order = orderRepository.save(order);
            log.info("Order finalized with total price: {}", totalPrice);

            // Clear cart
            try {
                Cart cart = cartRepository.findByUser(buyer).orElse(null);
                if (cart != null) {
                    cartService.clearCart(buyerId);
                    log.info("Cart cleared for buyer: {}", buyerId);
                }
            } catch (Exception e) {
                log.error("Failed to clear cart: {}", e.getMessage());
            }

            return getOrderDTO(order);
        } catch (RuntimeException e) {
            log.error("Error creating order for buyer {}: {}", buyerId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating order for buyer {}: {}", buyerId, e.getMessage(), e);
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }

    public Page<OrderDTO> getBuyerOrders(Long buyerId, Pageable pageable) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        return orderRepository.findByBuyer(buyer, pageable)
                .map(this::getOrderDTO);
    }

    public List<OrderDTO> getBuyerOrdersAll(Long buyerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        return orderRepository.findByBuyerOrderByCreatedAtDesc(buyer).stream()
                .map(this::getOrderDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return getOrderDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String newStatus, Long sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus status = Order.OrderStatus.valueOf(newStatus);
        order.setStatus(status);
        order = orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrder(order);
        for (OrderItem item : items) {
            item.setStatus(OrderItem.OrderItemStatus.valueOf(newStatus));
            orderItemRepository.save(item);
        }

        log.info("Order {} status updated to {}", orderId, newStatus);
        return getOrderDTO(order);
    }

    @Transactional
    public void updateOrderItemStatus(Long orderItemId, String status) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        log.info("Updating order item {} status from {} to {}", orderItemId, orderItem.getStatus(), status);
        
        orderItem.setStatus(OrderItem.OrderItemStatus.valueOf(status));
        
        // Set deliveredAt timestamp when status changes to DELIVERED
        if ("DELIVERED".equals(status)) {
            LocalDateTime deliveryTime = java.time.LocalDateTime.now();
            orderItem.setDeliveredAt(deliveryTime);
            log.info("✅ DELIVERY TIMESTAMP SET: Order item {} marked as delivered at {}", orderItemId, deliveryTime);
        }
        
        orderItemRepository.save(orderItem);
        log.info("Order item {} saved with status {} and deliveredAt {}", orderItemId, status, orderItem.getDeliveredAt());

        Order order = orderItem.getOrder();
        List<OrderItem> allItems = orderItemRepository.findByOrder(order);

        Order.OrderStatus newOrderStatus = determineOrderStatus(allItems);
        if (order.getStatus() != newOrderStatus) {
            order.setStatus(newOrderStatus);
            orderRepository.save(order);
            log.info("Order {} status updated to {}", order.getId(), newOrderStatus);

            if (newOrderStatus == Order.OrderStatus.DELIVERED) {
                notificationService.notifyBuyerOrderDelivered(order);
            } else if (newOrderStatus == Order.OrderStatus.OUT_FOR_DELIVERY) {
                notificationService.notifyBuyerOrderShipped(order);
            } else if (newOrderStatus == Order.OrderStatus.CONFIRMED) {
                notificationService.notifyBuyerOrderConfirmed(order);
            }
        }
    }

    private Order.OrderStatus determineOrderStatus(List<OrderItem> items) {
        if (items.isEmpty()) {
            return Order.OrderStatus.PENDING;
        }

        boolean allDelivered = items.stream()
                .allMatch(item -> item.getStatus() == OrderItem.OrderItemStatus.DELIVERED);
        if (allDelivered) {
            return Order.OrderStatus.DELIVERED;
        }

        boolean anyOutForDelivery = items.stream()
                .anyMatch(item -> item.getStatus() == OrderItem.OrderItemStatus.OUT_FOR_DELIVERY);
        if (anyOutForDelivery) {
            return Order.OrderStatus.OUT_FOR_DELIVERY;
        }

        boolean allConfirmedOrBetter = items.stream()
                .allMatch(item -> item.getStatus() != OrderItem.OrderItemStatus.PENDING);
        if (allConfirmedOrBetter) {
            return Order.OrderStatus.CONFIRMED;
        }

        return Order.OrderStatus.PENDING;
    }

    public Page<OrderItemDTO> getSellerOrders(Long sellerId, Pageable pageable) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        return orderItemRepository.findBySeller(seller, pageable)
                .map(this::getOrderItemDTO);
    }

    public List<OrderItemDTO> getSellerOrdersAll(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        return orderItemRepository.findBySellerOrderByCreatedAtDesc(seller).stream()
                .map(this::getOrderItemDTO)
                .collect(Collectors.toList());
    }

    public List<OrderItemDTO> getSellerOrdersLast30Days(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        java.time.LocalDateTime thirtyDaysAgo = java.time.LocalDateTime.now().minusDays(30);
        
        return orderItemRepository.findBySellerOrderByCreatedAtDesc(seller).stream()
                .filter(item -> item.getCreatedAt().isAfter(thirtyDaysAgo))
                .map(this::getOrderItemDTO)
                .collect(Collectors.toList());
    }

    public List<OrderItemDTO> getAllOrderItems() {
        return orderItemRepository.findAll().stream()
                .map(this::getOrderItemDTO)
                .collect(Collectors.toList());
    }

    private OrderDTO getOrderDTO(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        List<OrderItemDTO> itemDTOs = items.stream()
                .map(this::getOrderItemDTO)
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getBuyer().getId())
                .buyerId(order.getBuyer().getBuyerId())
                .buyerName(order.getBuyer().getName())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus().toString())
                .items(itemDTOs)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemDTO getOrderItemDTO(OrderItem item) {
        User buyer = item.getOrder().getBuyer();
        
        // Generate buyer ID if missing (fallback for existing users)
        String buyerIdFormatted = buyer.getBuyerId();
        if (buyerIdFormatted == null || buyerIdFormatted.isEmpty()) {
            buyerIdFormatted = "by" + String.format("%04d", buyer.getId());
        }
        
        return OrderItemDTO.builder()
                .id(item.getId())
                .orderId(item.getOrder().getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .category(item.getProduct().getCategory())
                .productCategory(item.getProduct().getCategory()) // For analytics compatibility
                .imageUrl(item.getProduct().getImageUrl())
                .sellerId(item.getSeller().getId())
                .sellerName(item.getSeller().getName())
                .buyerId(buyer.getId())
                .buyerIdFormatted(buyerIdFormatted)
                .buyerName(buyer.getName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .status(item.getStatus().toString())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .deliveredAt(item.getDeliveredAt()) // Add the delivered timestamp
                .build();
    }
}
