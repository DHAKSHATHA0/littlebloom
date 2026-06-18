package com.littlebloom.controller;

import com.littlebloom.dto.OrderItemDTO;
import com.littlebloom.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "http://localhost:3000")
public class DebugController {

    @Autowired
    private OrderService orderService;

    /**
     * Debug endpoint to check database data
     */
    @GetMapping("/database-check")
    public ResponseEntity<Map<String, Object>> checkDatabaseData() {
        try {
            // Get all order items to see what's in the database
            List<OrderItemDTO> allOrders = orderService.getAllOrderItems(); // We need to create this method
            
            Map<String, Object> result = new HashMap<>();
            result.put("total_orders", allOrders.size());
            result.put("sample_orders", allOrders.stream().limit(5).collect(Collectors.toList()));
            
            // Group by seller
            Map<Long, Long> ordersBySeller = allOrders.stream()
                    .collect(Collectors.groupingBy(
                            OrderItemDTO::getSellerId,
                            Collectors.counting()
                    ));
            
            result.put("orders_by_seller", ordersBySeller);
            result.put("unique_sellers", ordersBySeller.keySet());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("total_orders", 0);
            return ResponseEntity.ok(error);
        }
    }

    /**
     * Debug endpoint for specific seller
     */
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<Map<String, Object>> checkSellerData(@PathVariable Long sellerId) {
        try {
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(sellerId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("seller_id", sellerId);
            result.put("total_orders", sellerOrders.size());
            result.put("orders", sellerOrders);
            
            if (!sellerOrders.isEmpty()) {
                double totalRevenue = sellerOrders.stream()
                        .mapToDouble(order -> order.getPrice().doubleValue() * order.getQuantity())
                        .sum();
                result.put("total_revenue", totalRevenue);
                
                // Group by date
                Map<String, List<OrderItemDTO>> ordersByDate = sellerOrders.stream()
                        .collect(Collectors.groupingBy(order -> 
                            order.getCreatedAt().toLocalDate().toString()));
                
                result.put("orders_by_date", ordersByDate.entrySet().stream()
                        .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            entry -> entry.getValue().size()
                        )));
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("seller_id", sellerId);
            error.put("total_orders", 0);
            return ResponseEntity.ok(error);
        }
    }
}