package com.littlebloom.controller;

import com.littlebloom.dto.OrderDTO;
import com.littlebloom.dto.OrderItemDTO;
import com.littlebloom.dto.UpdateOrderStatusRequest;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.littlebloom.dto.CreateOrderRequest;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(Authentication authentication, @RequestBody CreateOrderRequest request) {
        try {
            if (authentication == null) {
                log.warn("Unauthorized order creation attempt");
                return ResponseEntity.status(401).body(createErrorResponse("Unauthorized"));
            }

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            log.info("Creating order for user: {}", userDetails.getUserId());
            
            OrderDTO order = orderService.createOrder(userDetails.getUserId(), request);
            log.info("Order created successfully: {}", order.getId());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            log.error("Error creating order: {}", e.getMessage());
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating order: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(createErrorResponse("Failed to create order. Please try again."));
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }

    @GetMapping
    public ResponseEntity<Page<OrderDTO>> getBuyerOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderDTO> orders = orderService.getBuyerOrders(userDetails.getUserId(), pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderDTO>> getBuyerOrdersAll(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<OrderDTO> orders = orderService.getBuyerOrdersAll(userDetails.getUserId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/seller/all")
    public ResponseEntity<List<OrderItemDTO>> getSellerOrdersAll(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<OrderItemDTO> orders = orderService.getSellerOrdersAll(userDetails.getUserId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller/paginated")
    public ResponseEntity<Page<OrderItemDTO>> getSellerOrdersPaginated(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderItemDTO> orders = orderService.getSellerOrders(userDetails.getUserId(), pageable);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            Authentication authentication,
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(createErrorResponse("Unauthorized"));
            }

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, request.getStatus(), userDetails.getUserId());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            log.error("Error updating order status: {}", e.getMessage());
            return ResponseEntity.status(400).body(createErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/item/{itemId}/status")
    public ResponseEntity<Void> updateOrderItemStatus(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody UpdateOrderStatusRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        orderService.updateOrderItemStatus(itemId, request.getStatus());
        return ResponseEntity.noContent().build();
    }
}
