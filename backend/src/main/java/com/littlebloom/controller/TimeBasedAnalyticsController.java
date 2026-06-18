package com.littlebloom.controller;

import com.littlebloom.dto.OrderItemDTO;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/time-analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class TimeBasedAnalyticsController {

    @Value("${ds.service.url:http://localhost:5000}")
    private String dsServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private OrderService orderService;

    /**
     * Main dashboard analytics endpoint
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long sellerId = userDetails.getUserId();
            String userRole = userDetails.getRole();
            
            if (!"SELLER".equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied - seller role required"));
            }

            // Get seller orders from database
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(sellerId);
            
            if (sellerOrders.isEmpty()) {
                return ResponseEntity.ok(createEmptyAnalytics());
            }

            // Prepare data for Python analytics service
            List<Map<String, Object>> ordersForAnalytics = sellerOrders.stream()
                    .map(order -> {
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put("date", order.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE));
                        orderMap.put("amount", order.getPrice().doubleValue() * order.getQuantity());
                        return orderMap;
                    })
                    .collect(Collectors.toList());

            // Call Python DS service for time-based analytics
            String url = dsServiceUrl + "/analytics/dashboard";
            Map<String, Object> request = new HashMap<>();
            request.put("orders", ordersForAnalytics);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                Map<String, Object> analyticsData = response.getBody();
                return ResponseEntity.ok(analyticsData);
            } catch (Exception e) {
                // Fallback to direct processing if Python service is unavailable
                return ResponseEntity.ok(processSellerAnalytics(sellerOrders));
            }

        } catch (Exception e) {
            System.err.println("Dashboard analytics error: " + e.getMessage());
            return ResponseEntity.ok(createEmptyAnalytics());
        }
    }

    /**
     * Product analytics for pie chart
     */
    @GetMapping("/product")
    public ResponseEntity<Map<String, Object>> getProductAnalytics(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long sellerId = userDetails.getUserId();

            // Get seller orders grouped by product
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(sellerId);

            // Group orders by product name and count
            Map<String, Long> productOrderCounts = sellerOrders.stream()
                    .collect(Collectors.groupingBy(
                            OrderItemDTO::getProductName,
                            Collectors.counting()
                    ));

            // Convert to list format
            List<Map<String, Object>> products = productOrderCounts.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> productMap = new HashMap<>();
                        productMap.put("name", entry.getKey());
                        productMap.put("orders", entry.getValue());
                        return productMap;
                    })
                    .sorted((a, b) -> Long.compare((Long) b.get("orders"), (Long) a.get("orders")))
                    .limit(6)
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("products", products);
            result.put("status", "success");
            
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> fallbackData = new HashMap<>();
            fallbackData.put("products", new ArrayList<>());
            fallbackData.put("status", "success");
            return ResponseEntity.ok(fallbackData);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "Time-Based Analytics");
        health.put("features", Arrays.asList("Daily", "Weekly", "Monthly", "Yearly", "Product Analysis"));
        
        return ResponseEntity.ok(health);
    }

    // Helper methods
    private Map<String, Object> processSellerAnalytics(List<OrderItemDTO> orders) {
        Map<String, Object> result = new HashMap<>();
        
        // Get current week's start (Sunday) and end (Saturday)
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate startOfWeek = today.with(java.time.DayOfWeek.SUNDAY).minusDays(7); // Previous Sunday
        if (today.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) {
            startOfWeek = today.with(java.time.DayOfWeek.SUNDAY); // This Sunday if today is not Sunday
        }
        java.time.LocalDate endOfWeek = startOfWeek.plusDays(6); // Saturday
        
        // Filter orders for current week only
        final java.time.LocalDate finalStartOfWeek = startOfWeek;
        final java.time.LocalDate finalEndOfWeek = endOfWeek;
        
        List<OrderItemDTO> currentWeekOrders = orders.stream()
                .filter(order -> {
                    java.time.LocalDate orderDate = order.getCreatedAt().toLocalDate();
                    return !orderDate.isBefore(finalStartOfWeek) && !orderDate.isAfter(finalEndOfWeek);
                })
                .collect(Collectors.toList());
        
        // Daily analysis (by day of week) - Current week only
        Map<String, List<OrderItemDTO>> dailyGroups = currentWeekOrders.stream()
                .collect(Collectors.groupingBy(order -> {
                    java.time.DayOfWeek dayOfWeek = order.getCreatedAt().getDayOfWeek();
                    // Convert to Sunday=0, Monday=1, ..., Saturday=6 format
                    int dayValue = dayOfWeek.getValue() % 7; // Sunday becomes 0
                    String[] days = {"SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"};
                    return days[dayValue];
                }));
        
        // Create daily data in Sunday to Saturday order for current week
        List<Map<String, Object>> dailyData = Arrays.asList("SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY")
                .stream()
                .map(day -> {
                    List<OrderItemDTO> dayOrders = dailyGroups.getOrDefault(day, new ArrayList<>());
                    double revenue = dayOrders.stream()
                            .mapToDouble(o -> o.getPrice().doubleValue() * o.getQuantity())
                            .sum();
                    int orderCount = dayOrders.size();
                    
                    Map<String, Object> dayMap = new HashMap<>();
                    dayMap.put("label", day.substring(0, 3)); // Sun, Mon, Tue, Wed, Thu, Fri, Sat
                    dayMap.put("orders", orderCount);
                    dayMap.put("revenue", Math.round(revenue * 100.0) / 100.0); // Round to 2 decimal places
                    return dayMap;
                })
                .collect(Collectors.toList());
        
        // Weekly analysis (last 8 weeks)
        Map<String, List<OrderItemDTO>> weeklyGroups = orders.stream()
                .collect(Collectors.groupingBy(order -> {
                    java.time.LocalDate date = order.getCreatedAt().toLocalDate();
                    int weekOfYear = date.get(java.time.temporal.WeekFields.ISO.weekOfYear());
                    int year = date.getYear();
                    return year + "-W" + String.format("%02d", weekOfYear);
                }));
        
        List<Map<String, Object>> weeklyData = weeklyGroups.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .limit(8)
                .map(entry -> {
                    List<OrderItemDTO> weekOrders = entry.getValue();
                    double revenue = weekOrders.stream().mapToDouble(o -> o.getPrice().doubleValue() * o.getQuantity()).sum();
                    int orderCount = weekOrders.size();
                    
                    Map<String, Object> weekMap = new HashMap<>();
                    weekMap.put("label", entry.getKey());
                    weekMap.put("orders", orderCount);
                    weekMap.put("revenue", revenue);
                    return weekMap;
                })
                .collect(Collectors.toList());
        
        // Monthly analysis (last 12 months)
        Map<String, List<OrderItemDTO>> monthlyGroups = orders.stream()
                .collect(Collectors.groupingBy(order -> 
                    order.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM"))));
        
        List<Map<String, Object>> monthlyData = monthlyGroups.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .limit(12)
                .map(entry -> {
                    List<OrderItemDTO> monthOrders = entry.getValue();
                    double revenue = monthOrders.stream().mapToDouble(o -> o.getPrice().doubleValue() * o.getQuantity()).sum();
                    int orderCount = monthOrders.size();
                    
                    Map<String, Object> monthMap = new HashMap<>();
                    monthMap.put("label", entry.getKey());
                    monthMap.put("orders", orderCount);
                    monthMap.put("revenue", revenue);
                    return monthMap;
                })
                .collect(Collectors.toList());
        
        // Yearly analysis
        Map<String, List<OrderItemDTO>> yearlyGroups = orders.stream()
                .collect(Collectors.groupingBy(order -> 
                    String.valueOf(order.getCreatedAt().getYear())));
        
        List<Map<String, Object>> yearlyData = yearlyGroups.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    List<OrderItemDTO> yearOrders = entry.getValue();
                    double revenue = yearOrders.stream().mapToDouble(o -> o.getPrice().doubleValue() * o.getQuantity()).sum();
                    int orderCount = yearOrders.size();
                    
                    Map<String, Object> yearMap = new HashMap<>();
                    yearMap.put("label", entry.getKey());
                    yearMap.put("orders", orderCount);
                    yearMap.put("revenue", revenue);
                    return yearMap;
                })
                .collect(Collectors.toList());
        
        // Calculate current week totals for summary cards
        double currentWeekRevenue = currentWeekOrders.stream()
                .mapToDouble(o -> o.getPrice().doubleValue() * o.getQuantity())
                .sum();
        int currentWeekOrderCount = currentWeekOrders.size();
        double avgOrderValue = currentWeekOrderCount > 0 ? currentWeekRevenue / currentWeekOrderCount : 0;
        
        result.put("daily", dailyData);
        result.put("weekly", weeklyData);
        result.put("monthly", monthlyData);
        result.put("yearly", yearlyData);
        result.put("current_week_summary", Map.of(
                "total_orders", currentWeekOrderCount,
                "total_revenue", Math.round(currentWeekRevenue * 100.0) / 100.0,
                "avg_order_value", Math.round(avgOrderValue * 100.0) / 100.0
        ));
        result.put("status", "success");
        
        return result;
    }

    private Map<String, Object> createEmptyAnalytics() {
        // Sunday to Saturday order
        List<String> weekdays = Arrays.asList("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
        
        List<Map<String, Object>> dailyData = weekdays.stream()
                .map(day -> {
                    Map<String, Object> dayMap = new HashMap<>();
                    dayMap.put("label", day);
                    dayMap.put("orders", 0);
                    dayMap.put("revenue", 0.0);
                    return dayMap;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("daily", dailyData);
        result.put("weekly", new ArrayList<>());
        result.put("monthly", new ArrayList<>());
        result.put("yearly", new ArrayList<>());
        result.put("status", "success");
        
        return result;
    }
}