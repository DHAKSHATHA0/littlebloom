package com.littlebloom.controller;

import com.littlebloom.dto.OrderItemDTO;
import com.littlebloom.security.CustomUserDetails;
import com.littlebloom.service.DataScienceService;
import com.littlebloom.service.OrderService;
import com.littlebloom.service.ProductService;
import com.littlebloom.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ds")
@CrossOrigin(origins = "http://localhost:3000")
public class EnhancedAnalyticsController {

    @Value("${ds.service.url:http://localhost:5000}")
    private String dsServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired(required = false)
    private DataScienceService dataScienceService;

    @Autowired
    private OrderService orderService;

    @Autowired(required = false)
    private ProductService productService;

    @Autowired(required = false)
    private ReviewService reviewService;

    /**
     * Enhanced seller dashboard with Python DS analytics
     */
    @GetMapping("/seller/dashboard")
    public ResponseEntity<Map<String, Object>> getEnhancedSellerDashboard(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long sellerId = userDetails.getUserId();

            // Get seller orders
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(sellerId);

            // Prepare data for Python DS service
            List<Map<String, Object>> ordersForAnalytics = sellerOrders.stream()
                    .map(order -> {
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put("date", order.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE));
                        orderMap.put("amount", order.getPrice().doubleValue());
                        orderMap.put("category", order.getProductCategory());
                        orderMap.put("product_id", order.getProductId());
                        orderMap.put("quantity", order.getQuantity());
                        return orderMap;
                    })
                    .collect(Collectors.toList());

            // Call Python DS service for enhanced dashboard
            String url = dsServiceUrl + "/seller/dashboard";
            Map<String, Object> request = new HashMap<>();
            request.put("orders", ordersForAnalytics);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> dashboardData = response.getBody();

            return ResponseEntity.ok(dashboardData);

        } catch (Exception e) {
            // Fallback to basic dashboard data
            return createFallbackDashboard(authentication);
        }
    }

    private ResponseEntity<Map<String, Object>> createFallbackDashboard(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long sellerId = userDetails.getUserId();
            
            List<OrderItemDTO> sellerOrders = orderService.getSellerOrdersAll(sellerId);
            
            // Basic calculations
            double totalRevenue = sellerOrders.stream()
                    .mapToDouble(order -> order.getPrice().doubleValue())
                    .sum();
            
            int totalOrders = sellerOrders.size();
            int pendingOrders = (int) sellerOrders.stream()
                    .filter(order -> "PENDING".equals(order.getStatus()))
                    .count();
            
            Map<String, Object> fallbackData = new HashMap<>();
            
            // Create basic analytics structure
            Map<String, Object> salesAnalytics = new HashMap<>();
            
            // Weekly data (empty for fallback)
            List<Map<String, Object>> weeklyData = Arrays.asList(
                createDayData("Mon", 0, 0),
                createDayData("Tue", 0, 0),
                createDayData("Wed", 0, 0),
                createDayData("Thu", 0, 0),
                createDayData("Fri", 0, 0),
                createDayData("Sat", 0, 0),
                createDayData("Sun", 0, 0)
            );
            
            salesAnalytics.put("weekly", weeklyData);
            salesAnalytics.put("monthly", new ArrayList<>());
            salesAnalytics.put("yearly", new ArrayList<>());
            
            Map<String, Object> currentMonth = new HashMap<>();
            currentMonth.put("revenue", totalRevenue);
            currentMonth.put("orders", totalOrders);
            currentMonth.put("items", totalOrders);
            currentMonth.put("avg_order_value", totalOrders > 0 ? totalRevenue / totalOrders : 0);
            salesAnalytics.put("current_month", currentMonth);
            
            salesAnalytics.put("trend_analysis", new ArrayList<>());
            
            fallbackData.put("sales_analytics", salesAnalytics);
            
            Map<String, Object> prediction = new HashMap<>();
            prediction.put("next_prediction", 0);
            prediction.put("confidence", 0);
            prediction.put("trend", "Fallback mode - Python DS unavailable");
            prediction.put("future_7_days", Arrays.asList(0, 0, 0, 0, 0, 0, 0));
            fallbackData.put("sales_prediction", prediction);
            
            fallbackData.put("total_orders", totalOrders);
            fallbackData.put("pending_orders", pendingOrders);
            
            return ResponseEntity.ok(fallbackData);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Dashboard fallback failed"));
        }
    }
    
    private Map<String, Object> createDayData(String day, double revenue, int orders) {
        Map<String, Object> dayData = new HashMap<>();
        dayData.put("date", day);
        dayData.put("revenue", revenue);
        dayData.put("orders", orders);
        return dayData;
    }

    /**
     * Product rating aggregation using Python DS
     */
    @GetMapping("/product/{productId}/ratings")
    public ResponseEntity<Map<String, Object>> getProductRatingAnalytics(@PathVariable Long productId) {
        try {
            if (reviewService == null || dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }
            
            // Get product ratings (assuming you have a review service)
            List<Double> ratings = reviewService.getProductRatings(productId);

            // Call Python DS service for advanced rating analytics
            Map<String, Object> ratingAnalytics = dataScienceService.aggregateRatings(ratings);

            return ResponseEntity.ok(ratingAnalytics);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Rating analytics failed"));
        }
    }

    /**
     * Smart product recommendations using Python DS
     */
    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, Object>> getSmartRecommendations(
            Authentication authentication,
            @RequestParam(required = false) String category) {
        
        try {
            CustomUserDetails userDetails = null;
            Long userId = null;
            
            if (authentication != null) {
                userDetails = (CustomUserDetails) authentication.getPrincipal();
                userId = userDetails.getUserId();
            }

            if (productService == null || dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }

            // Get all products
            List<Map<String, Object>> products = productService.getAllProductsForRecommendation();

            // Use default category if not provided
            String userCategory = category != null ? category : "toys";

            // Call Python DS service for recommendations
            Map<String, Object> recommendations = dataScienceService.getProductRecommendations(
                    userCategory, products, userId);

            return ResponseEntity.ok(recommendations);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Recommendations failed"));
        }
    }

    /**
     * Delivery time prediction using Python DS
     */
    @PostMapping("/predict/delivery")
    public ResponseEntity<Map<String, Object>> predictDeliveryTime(@RequestBody Map<String, Object> request) {
        try {
            if (dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }
            
            double distance = ((Number) request.getOrDefault("distance", 50)).doubleValue();
            double trafficFactor = ((Number) request.getOrDefault("traffic_factor", 1.0)).doubleValue();
            double productWeight = ((Number) request.getOrDefault("product_weight", 1.0)).doubleValue();
            String deliveryType = (String) request.getOrDefault("delivery_type", "standard");

            // Call Python DS service for delivery prediction
            Map<String, Object> deliveryPrediction = dataScienceService.predictDelivery(
                    distance, trafficFactor, productWeight, deliveryType);

            return ResponseEntity.ok(deliveryPrediction);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Delivery prediction failed"));
        }
    }

    /**
     * Sentiment analysis for feedback using Python DS
     */
    @PostMapping("/sentiment/analyze")
    public ResponseEntity<Map<String, Object>> analyzeFeedbackSentiment(@RequestBody Map<String, String> request) {
        try {
            String feedback = request.get("feedback");
            
            if (feedback == null || feedback.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Feedback text is required"));
            }

            if (dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }

            // Call Python DS service for sentiment analysis
            Map<String, Object> sentimentAnalysis = dataScienceService.analyzeSentiment(feedback);

            return ResponseEntity.ok(sentimentAnalysis);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Sentiment analysis failed"));
        }
    }

    /**
     * Weekly sales analytics for charts
     */
    @GetMapping("/seller/weekly-sales")
    public ResponseEntity<Map<String, Object>> getWeeklySalesAnalytics(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long sellerId = userDetails.getUserId();

            // Get recent orders (last 30 days)
            List<OrderItemDTO> recentOrders = orderService.getSellerOrdersLast30Days(sellerId);

            // Prepare data for Python DS service
            List<Map<String, Object>> ordersForAnalytics = recentOrders.stream()
                    .map(order -> {
                        Map<String, Object> orderMap = new HashMap<>();
                        orderMap.put("date", order.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE));
                        orderMap.put("amount", order.getPrice().doubleValue());
                        return orderMap;
                    })
                    .collect(Collectors.toList());

            if (dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }

            // Call Python DS service
            Map<String, Object> salesAnalytics = dataScienceService.getSalesAnalytics(ordersForAnalytics);

            // Extract weekly data for frontend charts
            List<Map<String, Object>> weeklyData = (List<Map<String, Object>>) salesAnalytics.get("weekly");

            return ResponseEntity.ok(Map.of(
                    "weekly_sales", weeklyData,
                    "status", "success"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Weekly sales analytics failed"));
        }
    }

    /**
     * Sales prediction for next month
     */
    @GetMapping("/seller/sales-prediction")
    public ResponseEntity<Map<String, Object>> getSalesPrediction(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long sellerId = userDetails.getUserId();

            // Get historical sales data
            List<OrderItemDTO> historicalOrders = orderService.getSellerOrdersAll(sellerId);

            // Prepare sales data (daily aggregation)
            Map<String, Double> dailySales = historicalOrders.stream()
                    .collect(Collectors.groupingBy(
                            order -> order.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE),
                            Collectors.summingDouble(order -> order.getPrice().doubleValue())
                    ));

            List<Double> salesValues = new ArrayList<>(dailySales.values());

            if (dataScienceService == null) {
                return ResponseEntity.status(500).body(Map.of("error", "Service not available"));
            }

            // Call Python DS service for prediction
            Map<String, Object> prediction = dataScienceService.predictSales(salesValues);

            return ResponseEntity.ok(prediction);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Sales prediction failed"));
        }
    }

    /**
     * Health check for DS integration
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "Enhanced Analytics with Python DS");
        health.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(health);
    }
}